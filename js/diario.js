/* Pestaña Álbum = diario del viaje.
   Una página por día: "Nuestro día" (nota que escriben los dos) y las fotos en polaroid
   con su nota. Las fotos vienen de js/visitas.js (evento "viaje:fotos").
   Con Supabase el diario se comparte (tabla diario) y avisa en vivo; sin Supabase se
   guarda en este celular. */
window.ViajeModules = window.ViajeModules || [];
window.ViajeModules.push(function(V){
'use strict';
const {esc, store, key, DAYS, DAYDATA, toast, user, OTHER} = V;
const N = window.Nube && window.Nube.enabled ? window.Nube : null;
const NAMES = {moni:'Moni', nando:'Nando'};
const $ = id => document.getElementById(id);
const LKEY = key('viaje-diario'), CKEY = 'viaje-diario-cache';
/* {day: {texto, who, ts}} */
let diario = store.get(N ? CKEY : LKEY, {});
let filtro = 'all';
const editing = new Set();
const grid = $('albumGrid');
grid.dataset.lbGroup = '';

$('albumIntro').textContent = N
  ? `Las fotos de los dos, con sus notas, y lo que escriban de cada día. Lo que suba ${OTHER} aparece aquí al momento.`
  : 'Las fotos y el diario se guardan solo en este celular. Guarden las fotos en su galería para no perderlas.';
$('albumFilter').hidden = !N;

const dateFmt = {};
function reached(d){
  const tz = d.tz || 'Europe/Madrid';
  const f = dateFmt[tz] || (dateFmt[tz] = new Intl.DateTimeFormat('en-CA', {timeZone:tz, year:'numeric', month:'2-digit', day:'2-digit'}));
  return f.format(new Date()) >= d.iso;
}
const when = (ts, tz) => { try { return new Date(ts).toLocaleString('es-MX', {day:'numeric', month:'short', hour:'numeric', minute:'2-digit', hourCycle:'h23', timeZone:tz || 'Europe/Madrid'}); } catch(e){ return ''; } };
const photosAll = () => (V.visits ? V.visits.photos() : []);

function noteBlock(d){
  const n = diario[d.id];
  if (editing.has(d.id)) return `<form class="jr-form" data-day="${d.id}">
      <label class="md-label" for="jr-t-${d.id}">Nuestro día</label>
      <textarea class="md-input" id="jr-t-${d.id}" rows="4" maxlength="1000" placeholder="¿Qué fue lo mejor? ¿Qué no quieren olvidar?">${esc(n && n.texto || '')}</textarea>
      <div class="jr-actions"><button class="md-btn md-btn--sm primary" type="submit">Guardar</button><button class="md-btn md-btn--sm md-btn--ghost" type="button" data-cancel="${d.id}">Cancelar</button></div>
    </form>`;
  if (n && n.texto) return `<div class="jr-note">
      <p class="jr-note-label">Nuestro día</p>
      <p class="jr-note-text">${esc(n.texto)}</p>
      <div class="jr-note-foot"><span>${N ? `Escribió ${esc(NAMES[n.who]||'')} · ` : ''}${esc(when(n.ts, d.tz))}</span><button type="button" class="jr-link" data-edit="${d.id}"><i data-lucide="pencil"></i>Editar</button></div>
    </div>`;
  return `<button type="button" class="jr-write" data-edit="${d.id}"><i data-lucide="notebook-pen"></i><span>Escribir cómo les fue</span></button>`;
}
function polaroid(p){
  const stop = V.visits.stopName(p.day, p.pin);
  const note = p.nota ? `<span class="pol-note">${esc(p.nota)}</span>`
    : p.who===user ? `<button type="button" class="pol-add" data-note="${esc(p.id)}">+ Escribir nota</button>` : '';
  return `<figure class="pol"><button type="button" class="thumb pol-img" data-id="${esc(p.id)}" aria-label="Ver foto de ${esc(stop)}"><img src="${esc(p.thumbUrl||'')}" alt="" loading="lazy">${p.pending?'<span class="pend-tag">pendiente</span>':''}</button>
    <figcaption>${note}<span class="pol-meta">${esc(stop)}${N ? ` · ${esc(NAMES[p.who]||'')}` : ''} · ${esc(V.visits.photoTime(p))}</span></figcaption></figure>`;
}

function render(){
  if (!V.visits) return;
  const all = photosAll();
  const list = filtro==='all' ? all : all.filter(p=>p.who===filtro);
  const by = w => all.filter(p=>p.who===w).length;
  $('albumCount').textContent = all.length ? (N ? `${all.length} ${all.length===1?'foto':'fotos'} · Moni ${by('moni')} · Nando ${by('nando')}` : `${all.length} ${all.length===1?'foto':'fotos'}`) : '';
  $('albumSaveAll').hidden = !list.length;
  document.querySelectorAll('#albumFilter .fchip').forEach(b=>b.setAttribute('aria-pressed', b.dataset.f===filtro));
  const t = V.todayId();
  const pages = DAYS.filter(d=>all.some(p=>p.day===d.id) || (diario[d.id] && diario[d.id].texto) || reached(d) || editing.has(d.id));
  /* Durante el viaje, el día de hoy va primero. */
  pages.sort((a,b)=>(b.id===t) - (a.id===t));
  if (!pages.length) {
    grid.innerHTML = `<div class="album-empty"><i data-lucide="camera"></i><p>Aún no hay fotos. Toma la primera desde una parada o con el botón <b>Tomar foto</b>. Cuando empiece el viaje, aquí también podrán escribir cómo les fue cada día.</p></div>`;
  } else {
    grid.innerHTML = pages.map(d=>{
      const ph = list.filter(p=>p.day===d.id);
      const empty = filtro==='all' ? 'Aún no hay fotos de este día.' : `${NAMES[filtro]} aún no tiene fotos de este día.`;
      return `<article class="jr-day t-${d.tone}" id="jr-${d.id}">
        <header class="jr-head"><span class="jr-num" aria-hidden="true">${d.n}</span><div><p class="md-eyebrow-label muted">Día ${parseInt(d.n)} · ${esc(d.date)} · ${esc(d.city)}${d.id===t?' · <b class="jr-today">Hoy</b>':''}</p><h3 class="jr-title">${esc(d.title[0])}<span class="accent">${esc(d.title[1])}</span></h3></div></header>
        ${noteBlock(d)}
        ${ph.length ? `<div class="jr-grid">${ph.map(polaroid).join('')}</div>` : `<p class="jr-empty">${esc(empty)}</p>`}
      </article>`;
    }).join('');
  }
  if (window.lucide) lucide.createIcons();
}

async function saveDay(day, texto){
  const prev = diario[day];
  diario[day] = {texto, who:user, ts:Date.now()};
  store.set(N ? CKEY : LKEY, diario);
  if (!N) return true;
  try { await N.saveDiario(day, texto); return true; }
  catch(e){
    console.warn(e);
    if (prev) diario[day] = prev; else delete diario[day];
    store.set(CKEY, diario);
    toast('No se pudo guardar el diario. Revisa tu conexión (y que ya hayan corrido el SQL nuevo en Supabase).');
    return false;
  }
}

grid.addEventListener('click', e=>{
  const ed = e.target.closest('[data-edit]');
  if (ed) { editing.add(ed.dataset.edit); render(); const ta = $(`jr-t-${ed.dataset.edit}`); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } return; }
  const c = e.target.closest('[data-cancel]');
  if (c) { editing.delete(c.dataset.cancel); render(); return; }
  const add = e.target.closest('[data-note]');
  if (add) {
    const ids = [...grid.querySelectorAll('.thumb')].map(x=>x.dataset.id);
    V.visits.openLightbox(add.dataset.note, ids);
    setTimeout(()=>$('lbNotaInput').focus(), 50);
  }
});
grid.addEventListener('submit', async e=>{
  const f = e.target.closest('.jr-form'); if (!f) return;
  e.preventDefault();
  const day = f.dataset.day, texto = f.querySelector('textarea').value.trim().slice(0, 1000);
  const btn = f.querySelector('[type="submit"]'); btn.disabled = true;
  const ok = await saveDay(day, texto);
  btn.disabled = false;
  if (ok) { editing.delete(day); render(); }
});
$('albumFilter').addEventListener('click', e=>{ const b = e.target.closest('.fchip'); if (!b) return; filtro = b.dataset.f; render(); });
$('albumSaveAll').addEventListener('click', ()=>{
  const all = photosAll();
  V.visits.saveFiles(filtro==='all' ? all : all.filter(p=>p.who===filtro));
});

/* ---------- Botón "Tomar foto": elegir parada (la actual ya viene marcada) ---------- */
const sheet = $('pickSheet');
$('albumCam').addEventListener('click', ()=>{
  const cur = V.currentStop();
  const t = V.todayId();
  const first = cur || (t && DAYDATA[t].pins.length ? {day:t, pin:0} : null);
  $('pickStop').innerHTML = DAYS.filter(d=>DAYDATA[d.id].pins.length).map(d=>`<optgroup label="Día ${parseInt(d.n)} · ${esc(d.date)} · ${esc(d.city)}">${DAYDATA[d.id].pins.map((p,i)=>`<option value="${d.id}|${i}"${first && first.day===d.id && first.pin===i ? ' selected' : ''}>${esc(p.it.t)} · ${esc(p.l)}</option>`).join('')}</optgroup>`).join('');
  sheet.hidden = false; $('pickStop').focus();
});
$('pickForm').addEventListener('submit', e=>{
  e.preventDefault();
  const [day, pin] = $('pickStop').value.split('|');
  sheet.hidden = true;
  V.visits.openCamera(day, +pin);
});
$('pickCancel').addEventListener('click', ()=>{ sheet.hidden = true; });
sheet.addEventListener('click', e=>{ if (e.target===sheet) sheet.hidden = true; });

window.addEventListener('viaje:fotos', render);
if (window.ViajeTabs) ViajeTabs.on('album', render);
render();

if (N) {
  N.listDiario().then(rows=>{
    diario = {};
    rows.forEach(r=>{ if (r.texto) diario[r.day] = {texto:r.texto, who:r.who, ts:Date.parse(r.updated_at)}; });
    store.set(CKEY, diario); render();
  }).catch(e=>console.warn('diario', e));
  window.addEventListener('nube:change', e=>{
    const {table, type, row} = e.detail; if (table!=='diario' || !row) return;
    if (type==='DELETE' || !row.texto) delete diario[row.day];
    else diario[row.day] = {texto:row.texto, who:row.who, ts:Date.parse(row.updated_at)};
    store.set(CKEY, diario);
    /* No pisar lo que uno está escribiendo en ese momento. */
    if (!editing.has(row.day)) render();
    if (row.who===user || type==='DELETE' || !row.texto) return;
    const d = DAYS.find(x=>x.id===row.day);
    toast(`<b>${esc(NAMES[row.who])}</b> escribió en el diario del día ${d ? parseInt(d.n) : ''}<span>“${esc(row.texto.slice(0, 90))}${row.texto.length>90?'…':''}”</span>`,
      [{label:'Ver', run:()=>window.ViajeTabs && ViajeTabs.go(`#jr-${row.day}`)}]);
  });
}
});
