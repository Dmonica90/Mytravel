#!/usr/bin/env node
/* Genera, a partir de js/itinerario.js:
   - calendario/viaje-moni.ics y calendario/viaje-nando.ics: el viaje para suscribirse desde el
     calendario del iPhone, con la redacción de cada quien y alarmas en vuelos, trenes y check-in.
   - supabase/avisos.sql: las notificaciones push programadas (resumen la noche anterior,
     "en 30 min…" antes de cada parada con lugar y recordatorios de check-in).
   Uso: node tools/calendario.mjs   (vuelve a correrlo cada vez que cambie el itinerario) */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_URL = 'https://dmonica90.github.io/Mytravel/';
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/itinerario.js'), 'utf8') +
  '\n;this.DAYS=DAYS;this.INTRO=INTRO;this.OV=OV;this.VOZ=VOZ;this.VUELOS=VUELOS;', ctx);
const {DAYS, INTRO, OV, VOZ, VUELOS} = ctx;

const NAMES = {moni:'Moni', nando:'Nando'};
const TZ = 'Europe/Madrid';
const dayTz = d => d.tz || TZ;

/* ---------- Horas: local (zona) → UTC ---------- */
function offsetMin(tz, utcMs){
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:tz, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'}).formatToParts(new Date(utcMs)).map(x=>[x.type, x.value]));
  return (Date.UTC(+p.year, p.month-1, +p.day, +p.hour, +p.minute, +p.second) - utcMs) / 60000;
}
function toUtc(iso, hhmm, tz){
  const [y, mo, da] = iso.split('-').map(Number), [h, m] = hhmm.split(':').map(Number);
  const guess = Date.UTC(y, mo-1, da, h, m);
  let t = guess - offsetMin(tz, guess)*60000;
  t = guess - offsetMin(tz, t)*60000;
  return t;
}
const addDays = (iso, n) => new Date(Date.parse(`${iso}T12:00:00Z`) + n*864e5).toISOString().slice(0, 10);
const icsDate = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/* ---------- Redacción personal (igual que js/app.js) ---------- */
const nice = x => (x||'').replace(/^0(\d)/, '$1');
const durTxt = m => m<60 ? `${m} min` : `${Math.floor(m/60)} h${m%60 ? ` ${m%60} min` : ''}`;
function voice(v, who, c={}){
  const t = v==null ? '' : (typeof v==='object' ? (v[who]||'') : v); if (!t) return '';
  const other = NAMES[who==='moni' ? 'nando' : 'moni'];
  return t.replace(/\{yo\}/g, NAMES[who]).replace(/\{otro\}/g, other)
    .replace(/\{hora\}/g, nice(c.hora)).replace(/\{hasta\}/g, nice(c.hasta))
    .replace(/\{dur\}/g, c.durMin!=null ? durTxt(c.durMin) : '');
}

/* Paradas de un día para una persona, en orden: el bloque "Monica · …"/"Nando · …" solo para esa persona. */
const mine = (label, who) => !label || !/^(Monica|Nando) · /.test(label) || label.startsWith(who==='moni' ? 'Monica · ' : 'Nando · ');
function stopsFor(d, who){
  const lists = [];
  if (d.pre && mine(d.pre.who, who)) lists.push({items:d.pre.items, pre:true});
  d.blocks.forEach(b=>{ if (mine(b.label, who)) lists.push({items:b.items}); });
  /* Reuniones sin parada propia, como "Reunión pareja · 18:30" del 16 oct: también van al calendario. */
  const pm = d.post && /(\d{1,2}:\d{2})/.exec(d.post.title);
  if (pm) lists.push({items:[{t:pm[1].padStart(5, '0'), icon:d.post.icon, title:d.post.title.replace(/\s*·\s*\d{1,2}:\d{2}/, ''), detail:(d.post.text||[]).join(' ')}]});
  const out = [];
  lists.forEach(l=>l.items.forEach((it, i)=>{
    const next = l.items[i+1];
    const tz = it.tz || dayTz(d);
    const start = toUtc(d.iso, it.t, tz);
    const nextStart = next ? toUtc(d.iso, next.t, next.tz || dayTz(d)) : null;
    const key = l.pre ? `pre:${d.id}|${it.t}` : `${d.id}|${it.t}`;
    const durMin = nextStart ? Math.round((nextStart - start)/60000) : null;
    out.push({d, it, start, nextStart, key, voz: voice(VOZ[key], who, {hora:it.t, hasta: next ? next.t : '', durMin})});
  }));
  return out.sort((a,b)=>a.start-b.start);
}

/* ---------- .ics ---------- */
const escT = s => String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
function fold(line){
  const out = []; let cur = '';
  for (const ch of line) { if (Buffer.byteLength(cur + ch) > 73) { out.push(cur); cur = ' ' + ch; } else cur += ch; }
  out.push(cur); return out.join('\r\n');
}
const alarm = (trigger, text) => ['BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:${trigger}`, `DESCRIPTION:${escT(text)}`, 'END:VALARM'];
const isFlight = it => it.icon==='plane';
const isTrain = it => it.icon==='train-front';
const isReserva = it => /reserv|online|picasso/i.test(`${it.title} ${it.detail||''} ${(it.tips||[]).join(' ')}`) && !isFlight(it) && !isTrain(it);

function buildIcs(who){
  const stamp = icsDate(Date.UTC(2026, 9, 6, 12, 0));
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Viaje Oct 2026//Monica y Nando//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:Viaje Oct 2026 · ${NAMES[who]}`, 'X-WR-TIMEZONE:Europe/Madrid', 'REFRESH-INTERVAL;VALUE=DURATION:PT6H', 'X-PUBLISHED-TTL:PT6H'];
  DAYS.forEach(d=>{
    stopsFor(d, who).forEach(s=>{
      const {it} = s;
      const end = s.nextStart && s.nextStart > s.start ? Math.min(s.nextStart, s.start + 3*3600e3) : s.start + 3600e3;
      const desc = [s.voz, it.detail, ...(it.tips||[]), `Día ${parseInt(d.n)} en la app: ${APP_URL}#${d.id}`].filter(Boolean).join('\n\n');
      L.push('BEGIN:VEVENT', `UID:${s.key.replace(/[^a-z0-9]/gi,'-')}-${who}@viaje-oct-2026`, `DTSTAMP:${stamp}`,
        `DTSTART:${icsDate(s.start)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${escT(it.title)}`, `DESCRIPTION:${escT(desc)}`);
      if (it.q) L.push(`LOCATION:${escT(it.q)}`);
      if (it.pin) L.push(`GEO:${it.pin.lat};${it.pin.lng}`);
      L.push(`URL:${APP_URL}#${d.id}`);
      if (isFlight(it)) L.push(...alarm('-P1D', `Mañana vuelan: ${it.title}`), ...alarm('-PT2H', `En 2 h sale su vuelo: ${it.title}`));
      else if (isTrain(it)) L.push(...alarm('-P1D', `Mañana: ${it.title}`), ...alarm('-PT1H', `En 1 h: ${it.title}`));
      else if (isReserva(it)) L.push(...alarm('-PT1H', `En 1 h: ${it.title}`));
      L.push('END:VEVENT');
    });
  });
  /* Check-in de cada vuelo: evento en la hora en que abre, con aviso 3 días antes. */
  VUELOS.forEach(f=>{
    const d = DAYS.find(x=>x.id===f.day);
    const dep = toUtc(d.iso, f.dep.padStart(5, '0'), f.tz);
    const open = dep - f.checkin*3600e3;
    const extra = f.checkin===24 ? ' En algunas rutas abre desde 48 h antes: si quieren, inténtenlo un día antes.' : '';
    L.push('BEGIN:VEVENT', `UID:checkin-${f.legs[0]}-${who}@viaje-oct-2026`, `DTSTAMP:${stamp}`, `DTSTART:${icsDate(open)}`, `DTEND:${icsDate(open + 1800e3)}`,
      `SUMMARY:${escT(`Check-in ${f.airline} ${f.code}`)}`,
      `DESCRIPTION:${escT(`Abre el check-in en línea (~${f.checkin} h antes de la salida de las ${f.dep}).${extra}\n\nVuelo: ${f.from} → ${f.to}, ${f.date}.\n${APP_URL}#vuelos`)}`,
      `URL:${APP_URL}#vuelos`,
      ...alarm('-P3D', `Faltan 3 días para el check-in de ${f.code}`), ...alarm('PT0M', `Ya pueden hacer el check-in de ${f.code}`),
      'END:VEVENT');
  });
  L.push('END:VCALENDAR');
  return L.map(fold).join('\r\n') + '\r\n';
}

/* ---------- Avisos push (supabase/avisos.sql) ---------- */
const sqlT = s => `'${String(s).replace(/'/g, "''")}'`;
const short = (s, n) => s.length>n ? s.slice(0, n-1).replace(/\s+\S*$/, '') + '…' : s;
function avisos(){
  const rows = [];
  const add = (id, at, who, titulo, cuerpo, url) => rows.push({id, at, who, titulo, cuerpo:short(cuerpo, 170), url});
  ['moni','nando'].forEach(who=>{
    DAYS.forEach((d, di)=>{
      const stops = stopsFor(d, who);
      if (!stops.length) return;
      /* Resumen la noche anterior (21:00 de la zona donde estén), salvo si esa noche van volando. */
      const prev = DAYS[di-1];
      if (!(prev && prev.travel==='flight' && prev.id==='c4')) {
        const tz = prev ? dayTz(prev) : stops[0].it.tz || dayTz(d);
        const first = stops[0];
        add(`noche:${d.id}:${who}`, toUtc(addDays(d.iso, -1), '21:00', tz), who,
          `Mañana: día ${parseInt(d.n)} · ${d.city}`,
          `${NAMES[who]}, empiezan a las ${nice(first.it.t)}: ${first.it.title}. ${voice(OV[d.id], who) || d.ov || ''}`, `#${d.id}`);
      }
      /* 30 min antes de cada parada con lugar (los vuelos ya los avisa el calendario). */
      stops.forEach(s=>{
        if (!s.it.pin || isFlight(s.it)) return;
        add(`p30:${s.key}:${who}`, s.start - 30*60e3, who, `En 30 min: ${s.it.title}`,
          s.voz || `${nice(s.it.t)} · ${s.it.pin.l}`, `#${d.id}`);
      });
    });
  });
  VUELOS.forEach(f=>{
    const d = DAYS.find(x=>x.id===f.day);
    const dep = toUtc(d.iso, f.dep.padStart(5, '0'), f.tz), open = dep - f.checkin*3600e3;
    add(`ci3:${f.legs[0]}`, open - 3*864e5, 'ambos', `Faltan 3 días para el check-in`, `${f.airline} ${f.code} (${f.date}). El check-in en línea abre unas ${f.checkin} h antes de la salida.`, '#vuelos');
    if (f.checkin===24) add(`ci48:${f.legs[0]}`, dep - 48*3600e3, 'ambos', `Intenten el check-in de ${f.code}`, `En algunas rutas Aeroméxico abre desde 48 h antes. Si aún no, mañana a esta hora seguro.`, '#vuelos');
    add(`ci0:${f.legs[0]}`, open, 'ambos', `Ya pueden hacer el check-in`, `${f.airline} ${f.code}: el check-in en línea ya está abierto. Elijan asientos juntos.`, '#vuelos');
  });
  rows.sort((a,b)=>a.at-b.at);
  const vals = rows.map(r=>`  (${sqlT(r.id)}, ${sqlT(new Date(r.at).toISOString())}, ${sqlT(r.who)}, ${sqlT(r.titulo)}, ${sqlT(r.cuerpo)}, ${sqlT(r.url)})`).join(',\n');
  return `-- Generado por tools/calendario.mjs a partir de js/itinerario.js. No lo edites a mano.
-- Notificaciones push programadas del viaje (${rows.length}). Córrelo en el SQL Editor de Supabase
-- después de supabase/schema.sql. Se puede volver a correr: actualiza los que aún no se mandan.
insert into public.avisos (id, send_at, who, titulo, cuerpo, url) values
${vals}
on conflict (id) do update set send_at = excluded.send_at, who = excluded.who, titulo = excluded.titulo,
  cuerpo = excluded.cuerpo, url = excluded.url
  where public.avisos.sent_at is null;
`;
}

fs.mkdirSync(path.join(ROOT, 'calendario'), {recursive:true});
['moni','nando'].forEach(who=>fs.writeFileSync(path.join(ROOT, `calendario/viaje-${who}.ics`), buildIcs(who)));
fs.writeFileSync(path.join(ROOT, 'supabase/avisos.sql'), avisos());
console.log('Listo: calendario/viaje-moni.ics, calendario/viaje-nando.ics, supabase/avisos.sql');
