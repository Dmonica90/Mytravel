/* Viaje Oct 2026 — render del itinerario, mapas (Leaflet + OSM/CARTO) y modo "Ahora".
   Los datos viven en js/itinerario.js. La app arranca cuando js/sesion.js llama a
   ViajeStart('moni' | 'nando'); los módulos de js/visitas.js y js/ubicacion.js se
   registran en ViajeModules y reciben window.Viaje. */
window.ViajeModules = window.ViajeModules || [];
window.ViajeStart = function(user){
'use strict';

const NAMES = {moni:'Moni', nando:'Nando'};
const ME = NAMES[user], OTHER = NAMES[user==='moni'?'nando':'moni'];
const key = k => `${user}:${k}`;
/* Redacción personal: elige la versión de quien entra y completa los marcadores. */
const pick = v => v==null ? '' : (typeof v==='object' ? (v[user]||'') : v);
const durTxt = m => m<60 ? `${m} min` : `${Math.floor(m/60)} h${m%60?` ${m%60} min`:''}`;
function voice(v, ctx={}){
  const t = pick(v); if (!t) return '';
  const toM = x => { const [h,m] = x.split(':').map(Number); return h*60+m; };
  const nice = x => (x||'').replace(/^0(\d)/, '$1');
  return t.replace(/\{yo\}/g, ME).replace(/\{otro\}/g, OTHER)
    .replace(/\{hora\}/g, nice(ctx.hora)).replace(/\{hasta\}/g, nice(ctx.hasta))
    .replace(/\{dur\}/g, ctx.durMin!=null ? durTxt(ctx.durMin) : (ctx.hora && ctx.hasta ? durTxt(toM(ctx.hasta)-toM(ctx.hora)) : ''));
}
const vozFor = (k, it, next, day) => {
  const ctx = {hora:it.t, hasta: next ? next.t : ''};
  if (next && day) ctx.durMin = startMin(day, next) - startMin(day, it);
  return voice((window.VOZ||{})[k], ctx);
};

const TZ = 'Europe/Madrid';
/* Cada día vive en su zona horaria (Cancún, CDMX, España); una parada puede declarar la suya (p. ej. salida desde CDMX). */
const fmts = {};
function localNow(tz){
  const f = fmts[tz] || (fmts[tz] = new Intl.DateTimeFormat('en-CA', {timeZone:tz, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'}));
  const p = Object.fromEntries(f.formatToParts(new Date()).map(x=>[x.type, x.value]));
  return {date:`${p.year}-${p.month}-${p.day}`, min:(+p.hour)*60 + (+p.minute)};
}
function tzOffset(tz, iso){
  const d = new Date(`${iso}T12:00:00Z`);
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:tz, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).formatToParts(d).map(x=>[x.type, x.value]));
  return Math.round((Date.UTC(+p.year, p.month-1, +p.day, +p.hour, +p.minute) - d.getTime())/60000);
}
const dayTz = d => d.tz || TZ;
/* Minutos desde medianoche en la hora del día, aunque la parada esté en otra zona. */
function startMin(d, it){
  const [h,m] = it.t.split(':').map(Number);
  const base = h*60+m;
  return it.tz && it.tz!==dayTz(d) ? base + tzOffset(dayTz(d), d.iso) - tzOffset(it.tz, d.iso) : base;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const gm = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const isFree = c => /^(gratis|0€)/i.test(c||'');
const toMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v===null ? d : JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e){ return false; } }
};

/* ---------- Render: items and days ---------- */
function renderItem(it, dayId, pinIndex, flatIdx, voz){
  const pinAttr = it.pin!=null && pinIndex!=null ? ` data-pin="${pinIndex}" tabindex="0" role="button" aria-label="${esc(it.title)}: ver en el mapa"` : '';
  const idxAttr = flatIdx!=null ? ` data-idx="${flatIdx}"` : '';
  let h = `<li class="item${pinAttr?' has-pin':''}"${pinAttr}${idxAttr}>
    <div class="item-time"><span class="time">${esc(it.t)}</span>${pinAttr?`<span class="pin-n">${pinIndex+1}</span><span class="dist" hidden></span>`:''}</div>
    <div class="item-body">
      <div class="item-head"><div class="item-title"><i data-lucide="${it.icon||'dot'}"></i><span>${esc(it.title)}</span></div>${it.cost?`<span class="cost${isFree(it.cost)?' free':''}">${esc(it.cost)}</span>`:''}</div>
      <span class="status" hidden></span>`;
  if (voz) h += `<p class="voz">${esc(voz)}</p>`;
  if (it.t0 && it.t!==it.t0) h += `<p class="edited">Hora cambiada (antes ${esc(it.t0)})</p>`;
  if (it.nota) h += `<p class="nota"><b>Nota de ${esc(NAMES[it.notaWho]||'')}:</b> ${esc(it.nota)}</p>`;
  if (it.why) h += `<p class="why"><b>${it.whoWhy?'¿Por qué Nando?':'¿Por qué?'}</b> ${esc(it.why)}</p>`;
  if (it.detail) h += `<p class="item-detail">${esc(it.detail)}</p>`;
  if (it.opts) {
    const gid = `${dayId}-o${flatIdx ?? Math.random().toString(36).slice(2,7)}`;
    h += `<div class="opts"><div class="opt-tabs" role="tablist">${it.opts.map((o,i)=>`<button type="button" role="tab" class="opt-tab" id="${gid}-t${i}" aria-controls="${gid}-p${i}" aria-selected="${i===0}">${esc(o.n)}</button>`).join('')}</div>
      ${it.opts.map((o,i)=>`<div class="opt-panel" role="tabpanel" id="${gid}-p${i}" aria-labelledby="${gid}-t${i}"${i?' hidden':''}>
        <div class="opt-name"><span>${esc(o.n.replace(/^[A-D] · /,''))}</span>${o.c?`<span class="cost${isFree(o.c)?' free':''}">${esc(o.c)}</span>`:''}</div>
        <ul class="tips">${o.lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>
        ${o.q?`<a class="gmaps" href="${gm(o.q)}" target="_blank" rel="noopener"><i data-lucide="map-pin"></i>Abrir en Google Maps</a>`:''}
      </div>`).join('')}</div>`;
  }
  if (it.tips) h += `<ul class="tips">${it.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`;
  if (it.q) h += `<a class="gmaps" href="${gm(it.q)}" target="_blank" rel="noopener"><i data-lucide="map-pin"></i>Abrir en Google Maps</a>`;
  if (pinAttr) h += `<div class="visit" data-day="${dayId}" data-pin="${pinIndex}"></div>`;
  return h + `</div></li>`;
}

function budgetTable(cols, rows, totalRow){
  return `<div class="tbl-wrap"><table><thead><tr>${cols.map((c,i)=>`<th${i?' class="num"':''}>${esc(c)}</th>`).join('')}</tr></thead><tbody>
    ${rows.map(r=>`<tr>${r.map((c,i)=>`<td${i?' class="num"':''}>${esc(c)}</td>`).join('')}</tr>`).join('')}
    ${totalRow?`<tr class="total">${totalRow.map((c,i)=>`<td${i?' class="num"':''}>${esc(c)}</td>`).join('')}</tr>`:''}</tbody></table></div>`;
}

/* Every day keeps its stops (pins) and its timeline items in order. */
const DAYDATA = {};
DAYS.forEach(d=>{
  const items = [], pins = [];
  d.blocks.forEach(b=>b.items.forEach(it=>{
    const entry = {it, idx:items.length, pin:null};
    if (it.pin){ entry.pin = pins.length; pins.push({...it.pin, q: it.pin.q || it.q || (it.opts && (it.opts.find(o=>o.q)||{}).q), it}); }
    items.push(entry);
  }));
  DAYDATA[d.id] = {items, pins};
});

const routeName = p => p.q || `${p.lat},${p.lng}`;
function routeUrl(pins, mode){
  const n = pins.map(routeName);
  const u = new URL('https://www.google.com/maps/dir/');
  u.searchParams.set('api','1');
  u.searchParams.set('origin', n[0]);
  u.searchParams.set('destination', n[n.length-1]);
  if (n.length>2) u.searchParams.set('waypoints', n.slice(1,-1).slice(0,9).join('|'));
  u.searchParams.set('travelmode', mode || 'walking');
  return u.toString();
}

function renderMapShell(d){
  const {pins} = DAYDATA[d.id];
  const small = pins.length<=3;
  const btn = pins.length>1 && d.travel!=='flight' ? `<a class="md-btn md-btn--outline" href="${esc(routeUrl(pins, d.travel))}" target="_blank" rel="noopener"><i data-lucide="navigation"></i>Ver ruta en Google Maps</a>` : '';
  const foot = small ? 'Trayecto del día.' : `${pins.length} paradas. La línea une las paradas en orden; el camino por calles lo da Google Maps.`;
  return `<figure class="map${small?' small':''}"><div class="map-head"><span class="md-eyebrow-label muted">${esc(MAP_TITLES[d.map]||'')}</span>${btn}</div>
    <div class="map-canvas" id="map-${d.id}" role="region" aria-label="Mapa del día ${parseInt(d.n)}"></div>
    <figcaption class="map-foot">${foot}${d.offmap?` ${esc(d.offmap)}`:''}</figcaption></figure>`;
}

/* "Monica · Articulate" → "Tú · Articulate" para quien inició sesión. */
const youLabel = l => l.replace(user==='moni' ? /^Monica · / : /^Nando · /, 'Tú · ');

function renderDay(d){
  const {items} = DAYDATA[d.id];
  let k = 0;
  const blocks = d.blocks.map(b=>{
    const lis = b.items.map(()=>{ const e = items[k++], nx = items[e.idx+1]; return renderItem(e.it, d.id, e.pin, e.idx, vozFor(`${d.id}|${e.it.t0||e.it.t}`, e.it, nx && nx.it, d)); }).join('');
    return `<div>${b.label?`<p class="md-eyebrow-label muted block-title">${esc(youLabel(b.label))}</p>`:''}<ol class="tl">${lis}</ol></div>`;
  }).join('');
  const pre = d.pre ? `<div class="panel wash-tertiary"><p class="md-eyebrow-label muted block-title"><i data-lucide="briefcase"></i>${esc(youLabel(d.pre.who))}</p><ol class="tl">${d.pre.items.map((it,i,a)=>renderItem(it,d.id,null,null,vozFor(`pre:${d.id}|${it.t}`, it, a[i+1], d))).join('')}</ol></div>` : '';
  const why = d.why ? `<div class="md-callout md-callout--accent"><div class="md-callout-icon"><i data-lucide="castle"></i></div><div class="md-callout-body"><p class="md-callout-title">¿Por qué Toledo?</p><div class="md-callout-text"><ul>${d.why.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div></div></div>` : '';
  const post = d.post ? `<div class="md-callout md-callout--info"><div class="md-callout-icon"><i data-lucide="${d.post.icon}"></i></div><div class="md-callout-body"><p class="md-callout-title">${esc(d.post.title)}</p><div class="md-callout-text"><ul>${d.post.text.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div></div></div>` : '';
  const callout = d.callout ? `<div class="md-callout md-callout--${d.callout.tone}"><div class="md-callout-icon"><i data-lucide="${d.callout.icon}"></i></div><div class="md-callout-body"><p class="md-callout-title">${esc(d.callout.title)}</p><div class="md-callout-text">${d.callout.text?esc(d.callout.text):`<ul>${d.callout.list.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`}</div></div></div>` : '';
  const extra = d.extra ? `<div class="split">${d.extra.map(e=>`<div class="panel muted-bg"><p class="md-eyebrow-label muted block-title"><i data-lucide="${e.icon}"></i>${esc(e.title)}</p><ol class="plain-list">${e.ol.map((x,i)=>`<li><span class="k">${i+1}</span><span>${esc(x)}</span></li>`).join('')}</ol></div>`).join('')}</div>` : '';
  const cols = d.budgetCols || ['Concepto','Costo'];
  const total = d.totalRow || ['Total', d.total];
  const budget = `<div class="panel"><p class="md-eyebrow-label muted block-title"><i data-lucide="wallet"></i>Presupuesto día ${parseInt(d.n)}</p>${budgetTable(cols, d.budget, total)}${d.totalNote?`<p class="item-detail" style="margin-top:.5rem">${esc(d.totalNote)}</p>`:''}</div>`;
  /* Lo de quien inició sesión va primero (D2: Monica en Articulate / ruta de Nando). */
  const mineFirst = user==='nando' ? blocks+pre : pre+blocks;
  const main = `<div class="col">${why}${mineFirst}${post}${callout}${extra}${budget}</div>`;
  return `<section class="day t-${d.tone}" id="${d.id}" data-day="${d.id}">
    <div class="wrap">
      <div class="day-head">
        <span class="day-num" aria-hidden="true">${d.n}</span>
        <div class="day-meta"><span class="md-eyebrow-label muted">Día ${parseInt(d.n)} · ${esc(d.date)}</span><span class="city-tag t-${d.tone}">${esc(d.city)}</span><span class="visit-progress" data-day="${d.id}"></span></div>
        <h2 class="md-heading">${esc(d.title[0])}<span class="accent">${esc(d.title[1])}</span></h2>
        <p class="day-sub">${esc(voice((window.INTRO||{})[d.id]) || d.sub)}</p>
      </div>
      <div class="day-grid"><div class="map-col">${renderMapShell(d)}</div>${main}</div>
    </div></section>`;
}

const $ = id => document.getElementById(id);
$('heroEyebrow').textContent = `Hola, ${ME} · 11–21 octubre 2026`;
$('heroLead').textContent = `Tu viaje con ${OTHER}: siete días en tren, a pie y con museos gratis cuando se puede. Toca una parada para verla en el mapa, márcala como visitada y tómale una foto.`;
$('dayNav').innerHTML = DAYS.map(d=>`<a class="chip t-${d.tone}" href="#${d.id}" data-nav="${d.id}"><b><i>D${parseInt(d.n)}</i> ${esc(d.date)}</b><small>${esc(d.city)}</small></a>`).join('');
$('overview').innerHTML = DAYS.map(d=>`<a class="ov t-${d.tone}" href="#${d.id}"><div class="ov-top"><span class="ov-num">${d.n}</span><span class="city-tag t-${d.tone}">${esc(d.city)}</span></div><p class="ov-title">${esc(d.date)} · ${esc(d.title.join(''))}</p><p class="ov-text">${esc(voice((window.OV||{})[d.id]) || d.ov)}</p></a>`).join('');
$('days').innerHTML = DAYS.map(renderDay).join('');

$('budgetGlobal').innerHTML = Object.values(GLOBAL).map(g=>`<div class="panel wash-${g.tone}"><h3>${esc(g.title)}</h3><div style="margin-top:.75rem">${budgetTable(['Concepto','Costo'], g.rows, g.total)}</div>${g.note?`<p class="item-detail" style="margin-top:.5rem">${esc(g.note)}</p>`:''}</div>`).join('')
  + `<div class="md-callout md-callout--muted span-all"><div class="md-callout-icon"><i data-lucide="piggy-bank"></i></div><div class="md-callout-body"><p class="md-callout-title">Para ahorrar</p><div class="md-callout-text"><ul>${BUDGET_NOTES.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div></div></div>`;
$('extrasGrid').innerHTML =
  `<div class="panel span-2"><p class="md-eyebrow-label muted block-title"><i data-lucide="smartphone"></i>Apps y reservas</p>${budgetTable(['Recurso','Uso','Costo'], APPS)}</div>`
 + `<div class="panel wash-primary"><p class="md-eyebrow-label muted block-title"><i data-lucide="backpack"></i>Qué llevar · 15–22 °C</p><ul class="tips">${PACK.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div>`;
const notes = NOTES.map(n=>n.title===`Para ${user==='moni'?'Monica':'Nando'}` ? {...n, title:'Para ti', mine:true} : n).sort((a,b)=>(b.mine?1:0)-(a.mine?1:0));
$('notesGrid').innerHTML = notes.map(n=>`<div class="panel wash-${n.tone}"><h3>${esc(n.title)}</h3><ul class="tips" style="margin-top:.75rem">${n.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');

/* ---------- Checklist ---------- */
const CHECK_KEY = key('viaje-bcn-mad-tol-checks');
const saved = store.get(CHECK_KEY, {});
$('checkGrid').innerHTML = CHECKS.map((g,gi)=>`<div class="panel"><h3>${esc(g.title)}</h3><ul class="checks" style="margin-top:.6rem">${g.items.map((it,ii)=>{const id=`c${gi}-${ii}`;return `<li><label for="${id}"><input type="checkbox" id="${id}" data-k="${id}"${saved[id]?' checked':''}><span>${esc(it)}</span></label></li>`}).join('')}</ul></div>`).join('');
if (!store.set('__probe', 1)) $('checkNote').textContent = 'Este navegador no permite guardar: las casillas se reinician al recargar.';
function updateProgress(){ const all=[...document.querySelectorAll('.checks input')]; const done=all.filter(i=>i.checked).length; $('checkBar').style.width = (all.length?done/all.length*100:0)+'%'; }
$('checkGrid').addEventListener('change', e=>{ const k = e.target.dataset.k; if (!k) return; saved[k] = e.target.checked; store.set(CHECK_KEY, saved); updateProgress(); });
updateProgress();

/* ---------- Option tabs ---------- */
document.addEventListener('click', e=>{
  const tab = e.target.closest('.opt-tab'); if (!tab) return;
  e.stopPropagation();
  tab.parentElement.querySelectorAll('.opt-tab').forEach(t=>{ const on = t===tab; t.setAttribute('aria-selected', on); $(t.getAttribute('aria-controls')).hidden = !on; });
}, true);

/* ---------- Theme ---------- */
const root = document.documentElement;
const savedTheme = store.get('theme', null);
$('logoutBtn').addEventListener('click', async ()=>{ try { localStorage.removeItem('viaje-user'); } catch(e){} if (window.Nube && Nube.enabled) await Nube.logout(); location.reload(); });
if (savedTheme) root.dataset.theme = savedTheme;
const isDark = () => root.dataset.theme ? root.dataset.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
$('themeBtn').addEventListener('click', ()=>{ root.dataset.theme = isDark() ? 'light' : 'dark'; store.set('theme', root.dataset.theme); applyTiles(); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTiles);

/* ---------- Maps ---------- */
const MAPS = {};
const tileUrl = () => `https://{s}.basemaps.cartocdn.com/${isDark()?'dark_all':'light_all'}/{z}/{x}/{y}{r}.png`;
function applyTiles(){ Object.values(MAPS).forEach(m=>m.tiles.setUrl(tileUrl())); }
const HOME_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21H3z"/></svg>';

function initMaps(){
  if (!window.L) { document.querySelectorAll('.map-canvas').forEach(el=>{ el.innerHTML = '<p class="map-foot" style="border:0">El mapa necesita conexión la primera vez.</p>'; }); return; }
  DAYS.forEach(d=>{
    const el = $(`map-${d.id}`), {pins} = DAYDATA[d.id];
    if (!el || !pins.length) return;
    const opts = {zoomControl:true, attributionControl:true};
    if (L.Map.GestureHandling) { opts.gestureHandling = true; opts.gestureHandlingOptions = {text:{touch:'Usa dos dedos para mover el mapa', scroll:'Usa Ctrl + rueda para hacer zoom', scrollMac:'Usa ⌘ + rueda para hacer zoom'}, duration:1200}; }
    else opts.scrollWheelZoom = false;
    const map = L.map(el, opts);
    const tiles = L.tileLayer(tileUrl(), {subdomains:'abcd', maxZoom:19, attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'}).addTo(map);
    const segs = pins.slice(1).map((p,i)=>L.polyline([[pins[i].lat,pins[i].lng],[p.lat,p.lng]], {className:`route-line t-${d.tone}`, weight:3, interactive:false}).addTo(map));
    if (d.map==='bcn' && !pins.some(p=>p.hotel)) {
      L.marker([HOTEL_BCN.lat, HOTEL_BCN.lng], {icon:L.divIcon({className:'mk-wrap', html:`<span class="mk ref">${HOME_SVG}</span>`, iconSize:[20,20], iconAnchor:[10,10]}), keyboard:false}).bindTooltip('Hotel (Barceloneta)', {direction:'top', offset:[0,-10], className:'mk-label'}).addTo(map);
    }
    const markers = pins.map((p,i)=>{
      const icon = L.divIcon({className:'mk-wrap', html:`<span class="mk t-${d.tone}${p.hotel?' hotel':''}">${i+1}</span>`, iconSize:[26,26], iconAnchor:[13,13], popupAnchor:[0,-14]});
      const m = L.marker([p.lat,p.lng], {icon, title:`${i+1}. ${p.l}`, riseOnHover:true}).addTo(map);
      m.bindTooltip(p.l, {direction:'top', offset:[0,-14], className:'mk-label'});
      m.bindPopup(`<div class="pop-t">${esc(p.it.t)} · <span class="pop-n">${esc(p.it.title)}</span></div>${p.it.cost?`<div class="pop-c">${esc(p.it.cost)}</div>`:''}<a class="pop-a" href="${gm(routeName(p))}" target="_blank" rel="noopener">Abrir en Google Maps</a>`);
      m.on('click', ()=>activate(d.id, i, {scroll:true}));
      return m;
    });
    MAPS[d.id] = {map, tiles, markers, segs, pins};
    fitDay(d.id);
  });
}
function fitDay(id){
  const m = MAPS[id]; if (!m) return;
  if (m.pins.length===1) m.map.setView([m.pins[0].lat, m.pins[0].lng], 13);
  else m.map.fitBounds(m.pins.map(p=>[p.lat,p.lng]), {padding:[28,28], maxZoom:16});
}

/* ---------- Map ↔ timeline sync ---------- */
function activate(dayId, idx, {scroll=false, pan=false}={}){
  const sec = $(dayId);
  sec.querySelectorAll('.item[data-pin]').forEach(li=>li.classList.toggle('active', +li.dataset.pin===idx));
  const m = MAPS[dayId];
  if (m) {
    m.markers.forEach((mk,i)=>{ const el = mk.getElement(); if (el) el.querySelector('.mk').classList.toggle('active', i===idx); });
    m.segs.forEach((s,i)=>{ const el = s.getElement(); if (el) el.classList.toggle('done', i+1<=idx); });
    if (pan) { const ll = m.markers[idx].getLatLng(); if (!m.map.getBounds().pad(-0.15).contains(ll)) m.map.panTo(ll); }
  }
  if (scroll){ const li = sec.querySelector(`.item[data-pin="${idx}"]`); if (li) li.scrollIntoView({block:'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }
}
$('days').addEventListener('click', e=>{
  if (e.target.closest('a, .opts, .visit, .edit-btn')) return;
  const li = e.target.closest('.item[data-pin]'); if (!li) return;
  const id = li.closest('.day').id, i = +li.dataset.pin;
  activate(id, i, {pan:true}); if (MAPS[id]) MAPS[id].markers[i].openPopup();
});
$('days').addEventListener('keydown', e=>{
  if (e.key!=='Enter' && e.key!==' ') return;
  const li = e.target.closest('.item[data-pin]'); if (!li || e.target!==li) return;
  e.preventDefault(); activate(li.closest('.day').id, +li.dataset.pin, {pan:true});
});

/* ---------- Day nav highlight ---------- */
const chips = [...document.querySelectorAll('[data-nav]')];
/* Scroll only the chip strip sideways; scrollIntoView would also move the page. */
function revealChip(c){
  const nav = $('dayNav'), l = c.offsetLeft - nav.offsetLeft, r = l + c.offsetWidth;
  if (l < nav.scrollLeft) nav.scrollTo({left:l - 8}); else if (r > nav.scrollLeft + nav.clientWidth) nav.scrollTo({left:r - nav.clientWidth + 8});
}
const io = new IntersectionObserver(entries=>{
  entries.forEach(en=>{ if (en.isIntersecting){ chips.forEach(c=>{ const on = c.dataset.nav===en.target.id; c.setAttribute('aria-current', on); if (on) revealChip(c); }); } });
}, {rootMargin:'-40% 0px -55% 0px'});
document.querySelectorAll('.day').forEach(s=>io.observe(s));

/* ---------- "Ahora" en vivo (hora local de cada día) ---------- */
const madridNow = () => localNow(TZ);
/* El día de hoy es aquel cuya fecha local (en su zona) coincide con su fecha. */
function today(){
  for (const d of DAYS){ const n = localNow(dayTz(d)); if (n.date===d.iso) return {d, min:n.min}; }
  return null;
}
const dayDiff = (a,b) => Math.round((Date.UTC(...b.split('-').map((v,i)=>i===1?v-1:+v)) - Date.UTC(...a.split('-').map((v,i)=>i===1?v-1:+v)))/864e5);
const inMin = n => n<60 ? `en ${n} min` : `en ${Math.floor(n/60)} h${n%60?` ${n%60} min`:''}`;
const hhmm = m => `${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

function dayStatus(d, now){
  const {items} = DAYDATA[d.id];
  const starts = items.map(e=>startMin(d, e.it));
  let cur = -1, next = -1;
  const st = items.map((e,i)=>{
    const end = i+1<items.length ? starts[i+1] : starts[i]+60;
    if (now>=end) return 'done';
    if (now>=starts[i]) { cur = i; return 'now'; }
    if (next<0) next = i;
    return 'later';
  });
  return {st, cur, next, starts, items};
}

let lastToday = null;
function updateLive(){
  const first = DAYS[0].iso, last = DAYS[DAYS.length-1].iso;
  const startDate = localNow(dayTz(DAYS[0])).date, endDate = localNow(dayTz(DAYS[DAYS.length-1])).date;
  const t = today();
  const pill = $('livePill'), bar = $('nowbar');
  document.querySelectorAll('.chip .today').forEach(x=>x.remove());
  document.querySelectorAll('.item.done, .item.now').forEach(li=>li.classList.remove('done','now'));
  document.querySelectorAll('.item .status').forEach(s=>{ s.hidden = true; s.className = 'status'; });
  document.querySelectorAll('.mk.now').forEach(x=>x.classList.remove('now'));
  bar.hidden = true; document.body.classList.remove('has-nowbar');

  if (!t && startDate < first) {
    const n = dayDiff(startDate, first);
    pill.className = 'live-pill'; pill.innerHTML = `<span class="dot"></span>${ME}, faltan ${n} ${n===1?'día':'días'} para su viaje · salen el ${esc(DAYS[0].date.replace('oct','de octubre'))}`;
    return;
  }
  if (!t && endDate > last) { pill.className = 'live-pill'; pill.innerHTML = `<span class="dot"></span>${ME}, qué bonito viaje con ${OTHER}. Gracias por cada parada.`; return; }

  if (!t) return;
  const d = t.d, min = t.min;
  pill.className = 'live-pill on'; pill.innerHTML = `<span class="dot"></span>${ME}, hoy es el día ${parseInt(d.n)} · ${esc(d.city)} · ${hhmm(min)}${dayTz(d)!==TZ?' (hora de Cancún)':''}`;
  const chip = document.querySelector(`.chip[data-nav="${d.id}"] b`); if (chip) chip.insertAdjacentHTML('beforeend','<span class="today">Hoy</span>');
  const sec = $(d.id), s = dayStatus(d, min);
  s.st.forEach((v,i)=>{
    const li = sec.querySelector(`.item[data-idx="${i}"]`); if (!li) return;
    const badge = li.querySelector('.status');
    if (v==='done') li.classList.add('done');
    if (v==='now') { li.classList.add('now'); badge.hidden = false; badge.classList.add('now'); badge.textContent = 'Ahora'; }
    if (i===s.next) { badge.hidden = false; badge.classList.add('next'); badge.textContent = `Siguiente · ${inMin(s.starts[i]-min)}`; }
  });
  const nowEntry = s.cur>=0 ? s.items[s.cur] : null, nextEntry = s.next>=0 ? s.items[s.next] : null;
  if (nowEntry && nowEntry.pin!=null && MAPS[d.id]) { const el = MAPS[d.id].markers[nowEntry.pin].getElement(); if (el) el.querySelector('.mk').classList.add('now'); }
  const parts = [];
  if (nowEntry) parts.push(`<span><b>${ME}, ahora están en:</b> ${esc(nowEntry.it.title)}${nextEntry?` · tienen ${durTxt(s.starts[s.next]-min)}`:''}</span>`);
  if (nextEntry) parts.push(`<span><b>${nowEntry?'Después:':`${ME}, lo siguiente:`}</b> a las ${esc(nextEntry.it.t)} ${esc(nextEntry.it.title)} (${inMin(s.starts[s.next]-min)})</span>`);
  if (!parts.length) parts.push(`<span><b>Día terminado, ${ME}.</b> A descansar.</span>`);
  $('nowText').innerHTML = parts.join('');
  const target = nowEntry || nextEntry;
  $('nowGo').onclick = () => {
    const li = target ? sec.querySelector(`.item[data-idx="${target.idx}"]`) : sec;
    li.scrollIntoView({block:'center', behavior:'smooth'});
    if (target && target.pin!=null) activate(d.id, target.pin, {pan:true});
  };
  bar.hidden = false; document.body.classList.add('has-nowbar');
  if (lastToday!==d.id && !location.hash) {
    lastToday = d.id;
    /* Esperar a que la página termine de cargar: si no, la restauración de scroll del navegador nos devuelve arriba. */
    const jump = () => requestAnimationFrame(()=>window.scrollTo({top: sec.getBoundingClientRect().top + scrollY - 72, behavior:'instant'}));
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (document.readyState==='complete') jump(); else window.addEventListener('load', jump, {once:true});
    if (target && target.pin!=null) activate(d.id, target.pin, {pan:true});
  }
}

/* ---------- Toast (avisos de ubicación, fotos, errores) ---------- */
function toast(html, actions=[], {sticky=false}={}){
  const t = $('toast');
  t.innerHTML = `<div class="toast-text">${html}</div><div class="toast-actions">${actions.map((a,i)=>`<button type="button" class="md-btn md-btn--sm${i===0?' primary':''}" data-i="${i}">${esc(a.label)}</button>`).join('')}<button type="button" class="toast-close" aria-label="Cerrar aviso">×</button></div>`;
  t.hidden = false;
  t.onclick = e=>{ const b = e.target.closest('button'); if (!b) return; if (b.dataset.i!=null) actions[+b.dataset.i].run(); t.hidden = true; };
  clearTimeout(t._t); if (!sticky) t._t = setTimeout(()=>{ t.hidden = true; }, 5000);
}
const todayId = () => { const t = today(); return t ? t.d.id : null; };

/* ---------- Boot ---------- */
initMaps();
DAYS.forEach(d=>{ if (DAYDATA[d.id].pins.length) activate(d.id, 0); });
updateLive();
setInterval(updateLive, 60000);
document.addEventListener('visibilitychange', ()=>{ if (!document.hidden) updateLive(); });
const V = window.Viaje = {user, ME, OTHER, key, store, esc, gm, DAYS, DAYDATA, MAPS, activate, toast, todayId, madridNow};
window.ViajeModules.forEach(init=>{ try { init(V); } catch(e){ console.error(e); } });
if (window.lucide) lucide.createIcons();
if ('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('sw.js').catch(()=>{});
};
