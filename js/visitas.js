/* Checklist de paradas + fotos con la cámara del celular (con su nota) + visor.
   El álbum/diario se pinta en js/diario.js con el evento "viaje:fotos".
   - Con Supabase: checks y fotos se comparten entre Moni y Nando, y llegan avisos en vivo.
     Si no hay internet, la foto queda "pendiente" en el celular y se sube sola al volver la conexión.
   - Sin Supabase (modo local): todo se guarda solo en este celular, separado por persona. */
window.ViajeModules = window.ViajeModules || [];
window.ViajeModules.push(function(V){
'use strict';
const {esc, store, key, DAYS, DAYDATA, toast, user, ME, OTHER} = V;
const N = window.Nube && window.Nube.enabled ? window.Nube : null;
const NAMES = {moni:'Moni', nando:'Nando'};
const $ = id => document.getElementById(id);
const vid = (day, pin) => `${day}-${pin}`;
const dayById = Object.fromEntries(DAYS.map(d=>[d.id,d]));
const stopName = (day, pin) => (DAYDATA[day] && DAYDATA[day].pins[pin] ? DAYDATA[day].pins[pin].l : 'una parada');

/* ---------- Visitas: {vid: {moni:bool, nando:bool}} ---------- */
const VKEY = key('viaje-visitas'), PKEY = key('viaje-visitas-pend');
const visits = {};
const mark = (k, who, on) => { (visits[k] = visits[k] || {})[who] = !!on; };
Object.entries(store.get(VKEY, {})).forEach(([k,on])=>mark(k, user, on));
const isVisited = (day, pin) => { const v = visits[vid(day,pin)]; return !!v && Object.values(v).some(Boolean); };
function whoLabel(day, pin){
  const v = visits[vid(day,pin)] || {};
  if (v.moni && v.nando) return 'Visitada por los dos';
  const other = user==='moni' ? 'nando' : 'moni';
  if (v[other] && !v[user]) return `Visitada por ${NAMES[other]}`;
  return 'Visitada';
}
function paint(day, pin){
  const on = isVisited(day, pin);
  const v = document.querySelector(`.visit[data-day="${day}"][data-pin="${pin}"]`);
  if (v) { v.querySelector('input').checked = on; v.querySelector('.v-label').textContent = on ? whoLabel(day, pin) : 'Visitada'; }
  const li = document.querySelector(`#${day} .item[data-pin="${pin}"]`);
  if (li) li.classList.toggle('visited', on);
}
function setVisited(day, pin, on){
  mark(vid(day,pin), user, on);
  const own = store.get(VKEY, {}); if (on) own[vid(day,pin)] = true; else delete own[vid(day,pin)]; store.set(VKEY, own);
  paint(day, pin); updateProgress();
  if (N) {
    const pend = store.get(PKEY, {}); pend[vid(day,pin)] = !!on; store.set(PKEY, pend);
    syncVisits();
  }
}
async function syncVisits(){
  if (!N || !navigator.onLine) return;
  const pend = store.get(PKEY, {});
  for (const [k, on] of Object.entries(pend)) {
    const [day, pin] = [k.slice(0, k.lastIndexOf('-')), +k.slice(k.lastIndexOf('-')+1)];
    try { await N.setVisit(day, pin, on); delete pend[k]; store.set(PKEY, pend); } catch(e){ break; }
  }
}
function updateProgress(){
  DAYS.forEach(d=>{
    const n = DAYDATA[d.id].pins.length; if (!n) return;
    const done = DAYDATA[d.id].pins.filter((_,i)=>isVisited(d.id,i)).length;
    const el = document.querySelector(`.visit-progress[data-day="${d.id}"]`);
    if (el) { el.textContent = `${done} / ${n} visitadas`; el.classList.toggle('complete', done===n); }
    const chip = document.querySelector(`.chip[data-nav="${d.id}"]`);
    if (chip) chip.classList.toggle('complete', done===n);
  });
}

/* ---------- IndexedDB: fotos locales (modo local) y pendientes de subir (modo nube) ---------- */
let dbp = null;
function db(){
  if (dbp) return dbp;
  dbp = new Promise((res, rej)=>{
    if (!('indexedDB' in window)) return rej(new Error('sin IndexedDB'));
    const r = indexedDB.open('viaje-fotos', 1);
    r.onupgradeneeded = ()=>{ const s = r.result.createObjectStore('fotos', {keyPath:'id'}); s.createIndex('owner','owner'); };
    r.onsuccess = ()=>res(r.result); r.onerror = ()=>rej(r.error);
  });
  return dbp;
}
const tx = (mode, fn) => db().then(d=>new Promise((res, rej)=>{ const t = d.transaction('fotos', mode); const out = fn(t.objectStore('fotos')); t.oncomplete = ()=>res(out && out.result); t.onerror = ()=>rej(t.error); }));
const localPhotos = () => tx('readonly', s=>s.index('owner').getAll(user)).then(r=>(r||[]).sort((a,b)=>a.ts-b.ts));
const putLocal = rec => tx('readwrite', s=>s.put(rec));
const delLocal = id => tx('readwrite', s=>s.delete(id));

async function shrink(file, max, q){
  let src;
  try { src = await createImageBitmap(file, {imageOrientation:'from-image'}); }
  catch(e){ src = await new Promise((res, rej)=>{ const i = new Image(); i.onload = ()=>res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); }
  const w = src.width, h = src.height, k = Math.min(1, max/Math.max(w,h));
  const c = document.createElement('canvas'); c.width = Math.round(w*k); c.height = Math.round(h*k);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return new Promise(res=>c.toBlob(res, 'image/jpeg', q));
}

/* Sube las fotos pendientes (modo nube). */
let syncing = false;
async function syncPhotos(){
  if (!N || syncing || !navigator.onLine) return 0;
  syncing = true; let n = 0;
  try {
    for (const p of (await localPhotos()).filter(p=>p.pending)) {
      try { await N.uploadPhoto(p); await delLocal(p.id); n++; } catch(e){ console.warn('subida pendiente', e); break; }
    }
  } catch(e){}
  syncing = false;
  if (n) refreshPhotos();
  return n;
}

/* ---------- Cámara ---------- */
const cam = document.createElement('input');
cam.type = 'file'; cam.accept = 'image/*'; cam.setAttribute('capture','environment'); cam.hidden = true; cam.id = 'camInput';
document.body.appendChild(cam);
let camTarget = null;
function openCamera(day, pin){ camTarget = {day, pin}; cam.value = ''; cam.click(); }
cam.addEventListener('change', async ()=>{
  const f = cam.files && cam.files[0]; if (!f || !camTarget) return;
  const {day, pin} = camTarget, ts = Date.now();
  try {
    const [full, thumb] = await Promise.all([shrink(f, 1600, .82), shrink(f, 480, .72)]);
    const rec = {id:`${user}:${day}-${pin}-${ts}`, owner:user, day, pin, ts, full, thumb, pending:!!N};
    let uploaded = false;
    if (N && navigator.onLine) { try { await N.uploadPhoto(rec); uploaded = true; } catch(e){ console.warn(e); } }
    if (!uploaded) await putLocal(rec);
    setVisited(day, pin, true);
    await refreshPhotos();
    const mine = photos.find(p=>p.day===day && p.pin===pin && p.ts===ts);
    toast(N
      ? (uploaded ? `Foto de <b>${esc(stopName(day,pin))}</b> compartida con ${esc(OTHER)}.` : `Foto de <b>${esc(stopName(day,pin))}</b> guardada. Se compartirá con ${esc(OTHER)} cuando haya internet.`)
      : `Foto guardada en <b>${esc(stopName(day,pin))}</b>. Guárdala también en tu galería desde la miniatura.`,
      mine ? [{label:'Escribir nota', run:()=>{ openLightbox(mine.id); setTimeout(()=>$('lbNotaInput').focus(), 50); }}] : []);
  } catch(e){
    console.error(e);
    toast('No se pudo guardar la foto. Revisa el espacio disponible o tómala con la app de cámara.');
  }
});

/* ---------- Controles de cada parada ---------- */
document.querySelectorAll('.visit').forEach(v=>{
  const day = v.dataset.day, pin = +v.dataset.pin, id = `v-${day}-${pin}`;
  v.innerHTML = `<label class="v-check" for="${id}"><input type="checkbox" id="${id}"><span class="v-label">Visitada</span></label>
    <button type="button" class="md-btn md-btn--outline md-btn--sm v-cam"><i data-lucide="camera"></i>Tomar foto</button>
    <div class="v-thumbs"></div>`;
  v.querySelector('input').addEventListener('change', e=>setVisited(day, pin, e.target.checked));
  v.querySelector('.v-cam').addEventListener('click', ()=>openCamera(day, pin));
});
function paintAll(){ DAYS.forEach(d=>DAYDATA[d.id].pins.forEach((_,i)=>paint(d.id,i))); updateProgress(); }
paintAll();

/* ---------- Fotos y visor ---------- */
let urls = [], photos = [];
const photoName = p => `viaje-${dayById[p.day].date.replace(' ','')}-${stopName(p.day,p.pin).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${p.ts}.jpg`;
const hourFmt = {};
/* Hora de la foto en la zona del día (Cancún o España). */
function photoTime(p){
  const tz = (dayById[p.day] && dayById[p.day].tz) || 'Europe/Madrid';
  const f = hourFmt[tz] || (hourFmt[tz] = new Intl.DateTimeFormat('es-MX', {hour:'numeric', minute:'2-digit', hourCycle:'h23', timeZone:tz}));
  try { return f.format(new Date(p.ts)); } catch(e){ return ''; }
}
async function fullBlob(p){ return p.full || await (await fetch(p.url)).blob(); }
async function saveFiles(list){
  let files;
  try { files = await Promise.all(list.map(async p=>new File([await fullBlob(p)], photoName(p), {type:'image/jpeg'}))); }
  catch(e){ toast('No se pudo descargar la foto. Revisa tu conexión.'); return; }
  try { if (navigator.canShare && navigator.canShare({files})) { await navigator.share({files, title:'Viaje Oct 2026'}); return; } }
  catch(e){ if (e && e.name==='AbortError') return; }
  files.forEach((f,i)=>setTimeout(()=>{ const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500); }, i*350));
}
async function refreshPhotos(){
  urls.forEach(u=>URL.revokeObjectURL(u)); urls = [];
  let local = [], cloud = [];
  try { local = await localPhotos(); } catch(e){}
  if (N) { try { cloud = (await N.listPhotos()).map(r=>({...r, ts:Date.parse(r.created_at), cloud:true})); } catch(e){ console.warn(e); } }
  photos = [...cloud, ...local.map(p=>({...p, who:user, local:true}))].sort((a,b)=>a.ts-b.ts);
  photos.forEach(p=>{ if (p.local) { p.thumbUrl = URL.createObjectURL(p.thumb); urls.push(p.thumbUrl); } });
  const pend = p => p.pending ? `<span class="pend-tag" title="Se subirá cuando haya internet">pendiente</span>` : '';
  /* Debajo de cada actividad: miniaturas y, si tienen, sus notas. */
  document.querySelectorAll('.v-thumbs').forEach(t=>{
    const v = t.closest('.visit'), list = photos.filter(p=>p.day===v.dataset.day && p.pin===+v.dataset.pin);
    t.innerHTML = list.map(p=>`<button type="button" class="thumb" data-id="${esc(p.id)}" aria-label="Ver foto de ${esc(NAMES[p.who]||'')}"><img src="${esc(p.thumbUrl||'')}" alt="">${pend(p)}</button>`).join('');
    const notes = list.filter(p=>p.nota);
    let ul = v.querySelector('.v-notes');
    if (!notes.length) { if (ul) ul.remove(); return; }
    if (!ul) { ul = document.createElement('ul'); ul.className = 'v-notes'; v.appendChild(ul); }
    ul.innerHTML = notes.map(p=>`<li>“${esc(p.nota)}”${N ? ` <span>· ${esc(NAMES[p.who]||'')}</span>` : ''}</li>`).join('');
  });
  window.dispatchEvent(new CustomEvent('viaje:fotos'));
}

const lb = $('lightbox');
let lbPhoto = null, lbUrl = null, lbList = [];
function openLightbox(id, list){
  lbPhoto = photos.find(p=>p.id===id); if (!lbPhoto) return;
  if (list) lbList = list.filter(x=>photos.some(p=>p.id===x));
  if (!lbList.includes(id)) lbList = photos.map(p=>p.id);
  if (lbUrl) URL.revokeObjectURL(lbUrl); lbUrl = null;
  if (lbPhoto.full) { lbUrl = URL.createObjectURL(lbPhoto.full); $('lbImg').src = lbUrl; } else $('lbImg').src = lbPhoto.url;
  const d = dayById[lbPhoto.day];
  $('lbImg').alt = `Foto de ${stopName(lbPhoto.day, lbPhoto.pin)}`;
  $('lbCaption').textContent = `${stopName(lbPhoto.day, lbPhoto.pin)} · Día ${parseInt(d.n)} · ${photoTime(lbPhoto)}${N ? ` · foto de ${NAMES[lbPhoto.who]||''}` : ''}`;
  $('lbNote').textContent = N ? (lbPhoto.pending ? 'Esta foto se compartirá cuando haya internet.' : `La ven los dos. Guárdala en tu galería si la quieres en tu celular.`) : 'La foto vive en este celular: guárdala en tu galería para no perderla.';
  const mine = lbPhoto.who===user;
  $('lbNota').hidden = mine || !lbPhoto.nota;
  $('lbNota').textContent = lbPhoto.nota ? `“${lbPhoto.nota}” · ${NAMES[lbPhoto.who]||''}` : '';
  $('lbNotaForm').hidden = !mine;
  $('lbNotaInput').value = lbPhoto.nota || '';
  $('lbDelete').hidden = !mine;
  const k = lbList.indexOf(id);
  $('lbPrev').hidden = k<=0; $('lbNext').hidden = k<0 || k>=lbList.length-1;
  if (lb.hidden) { lb.hidden = false; $('lbClose').focus(); }
}
function stepLightbox(dir){
  if (!lbPhoto) return;
  const k = lbList.indexOf(lbPhoto.id) + dir;
  if (k>=0 && k<lbList.length) openLightbox(lbList[k]);
}
function closeLightbox(){ lb.hidden = true; $('lbImg').removeAttribute('src'); if (lbUrl) URL.revokeObjectURL(lbUrl); lbUrl = null; lbPhoto = null; }
/* Una miniatura abre el visor; se puede pasar entre las fotos de su mismo grupo (la parada o el álbum). */
document.addEventListener('click', e=>{
  const t = e.target.closest('.thumb'); if (!t) return;
  const group = t.closest('[data-lb-group]') || t.closest('.v-thumbs');
  openLightbox(t.dataset.id, group ? [...group.querySelectorAll('.thumb')].map(x=>x.dataset.id) : null);
});
$('lbClose').addEventListener('click', closeLightbox);
$('lbPrev').addEventListener('click', ()=>stepLightbox(-1));
$('lbNext').addEventListener('click', ()=>stepLightbox(1));
lb.addEventListener('click', e=>{ if (e.target===lb) closeLightbox(); });
document.addEventListener('keydown', e=>{
  if (lb.hidden || e.target.closest('textarea, input')) return;
  if (e.key==='Escape') closeLightbox();
  if (e.key==='ArrowLeft') stepLightbox(-1);
  if (e.key==='ArrowRight') stepLightbox(1);
});
/* Deslizar a los lados para pasar de foto. */
let touchX = null;
lb.querySelector('.lb-stage').addEventListener('touchstart', e=>{ touchX = e.touches.length===1 ? e.touches[0].clientX : null; }, {passive:true});
lb.querySelector('.lb-stage').addEventListener('touchend', e=>{
  if (touchX==null) return;
  const dx = e.changedTouches[0].clientX - touchX; touchX = null;
  if (Math.abs(dx)>50) stepLightbox(dx<0 ? 1 : -1);
});
$('lbSave').addEventListener('click', ()=>{ if (lbPhoto) saveFiles([lbPhoto]); });
$('lbDelete').addEventListener('click', async ()=>{
  if (!lbPhoto || lbPhoto.who!==user) return;
  const btn = $('lbDelete');
  if (btn.dataset.confirm!=='1') { btn.dataset.confirm = '1'; btn.textContent = '¿Borrar? Toca otra vez'; setTimeout(()=>{ btn.dataset.confirm=''; btn.textContent='Borrar'; }, 3000); return; }
  btn.dataset.confirm = ''; btn.textContent = 'Borrar';
  try { if (lbPhoto.local) await delLocal(lbPhoto.id); else await N.deletePhoto(lbPhoto); }
  catch(e){ toast('No se pudo borrar. Revisa tu conexión.'); return; }
  closeLightbox(); refreshPhotos();
});

/* Nota de la foto: solo quien la tomó. */
async function setPhotoNote(p, text){
  const nota = (text||'').trim().slice(0, 280);
  if (p.local) {
    const rec = await tx('readonly', s=>s.get(p.id));
    if (rec) { rec.nota = nota; await putLocal(rec); }
  } else await N.setPhotoNote(p.id, nota);
  p.nota = nota;
}
$('lbNotaForm').addEventListener('submit', async e=>{
  e.preventDefault();
  if (!lbPhoto || lbPhoto.who!==user) return;
  const p = lbPhoto, btn = e.target.querySelector('button'); btn.disabled = true;
  try {
    await setPhotoNote(p, $('lbNotaInput').value);
    await refreshPhotos();
    toast(p.nota ? 'Nota guardada.' : 'Nota borrada.');
    if (lbPhoto && lbPhoto.id===p.id) openLightbox(p.id);
  } catch(x){
    console.warn(x);
    toast(N ? 'No se pudo guardar la nota. Revisa tu conexión (y que ya hayan corrido el SQL nuevo en Supabase).' : 'No se pudo guardar la nota.');
  } finally { btn.disabled = false; }
});

/* ---------- Modo nube: cargar lo compartido, migrar lo local y escuchar al otro ---------- */
async function bootCloud(){
  try { (await N.listVisits()).forEach(r=>mark(vid(r.day, r.pin), r.who, r.visited)); paintAll(); } catch(e){ console.warn(e); }
  /* Primera vez conectados: subir fotos y checks que ya estaban en este celular. */
  if (!store.get(key('viaje-migrado'), false)) {
    try {
      const old = (await localPhotos()).filter(p=>!p.pending);
      for (const p of old) await putLocal({...p, pending:true});
      const own = store.get(VKEY, {}); const pend = store.get(PKEY, {});
      Object.entries(own).forEach(([k,on])=>{ if (on) pend[k] = true; }); store.set(PKEY, pend);
      store.set(key('viaje-migrado'), true);
      if (old.length) toast(`Subiendo ${old.length} ${old.length===1?'foto':'fotos'} que tenías en este celular para que ${esc(OTHER)} también las vea.`);
    } catch(e){ console.warn(e); }
  }
  await syncVisits(); await syncPhotos(); await refreshPhotos();
  N.subscribe();
  window.addEventListener('online', ()=>{ syncVisits(); syncPhotos(); });
  window.addEventListener('nube:change', async e=>{
    const {table, type, row} = e.detail; if (!row || row.who===user) return;
    if (table==='visits') {
      mark(vid(row.day, row.pin), row.who, type!=='DELETE' && row.visited);
      paint(row.day, row.pin); updateProgress();
      if (type!=='DELETE' && row.visited) { if (navigator.vibrate) try { navigator.vibrate(80); } catch(x){}
        toast(`<b>${esc(NAMES[row.who])}</b> marcó <b>${esc(stopName(row.day,row.pin))}</b> como visitada.`); }
    }
    if (table==='photos') {
      await refreshPhotos();
      const p = photos.find(x=>x.id===row.id);
      const img = p && p.thumbUrl ? `<img class="toast-img" src="${esc(p.thumbUrl)}" alt="">` : '';
      const ver = [{label:'Ver', run:()=>{ if (window.ViajeTabs) ViajeTabs.go('#album'); openLightbox(row.id); }}];
      if (type==='INSERT') {
        if (navigator.vibrate) try { navigator.vibrate([80,40,80]); } catch(x){}
        if (window.ViajeTabs) ViajeTabs.dot(true);
        toast(`${img}<b>${esc(NAMES[row.who])} subió una foto</b><span>${esc(stopName(row.day,row.pin))}</span>`, ver, {sticky:true});
      } else if (type==='UPDATE' && row.nota) {
        toast(`${img}<b>${esc(NAMES[row.who])} escribió en su foto</b><span>${esc(stopName(row.day,row.pin))}: “${esc(row.nota)}”</span>`, ver);
      }
    }
  });
}
if (N) bootCloud(); else refreshPhotos();

V.visits = {isVisited, setVisited, openCamera, openLightbox, saveFiles, stopName, photoTime, photos: () => photos};
});
