/* Checklist de paradas + fotos con la cámara del celular.
   Las fotos se guardan en IndexedDB de este dispositivo (separadas por usuario);
   "Guardar en galería" usa la hoja de compartir nativa o, si no existe, una descarga. */
window.ViajeModules = window.ViajeModules || [];
window.ViajeModules.push(function(V){
'use strict';
const {esc, store, key, DAYS, DAYDATA, toast, user} = V;
const $ = id => document.getElementById(id);
const VKEY = key('viaje-visitas');
const visits = store.get(VKEY, {});
const vid = (day, pin) => `${day}-${pin}`;
const isVisited = (day, pin) => !!visits[vid(day,pin)];

/* ---------- IndexedDB ---------- */
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
const allPhotos = () => tx('readonly', s=>s.index('owner').getAll(user)).then(r=>(r||[]).sort((a,b)=>a.ts-b.ts));
const putPhoto = rec => tx('readwrite', s=>s.put(rec));
const delPhoto = id => tx('readwrite', s=>s.delete(id));

/* ---------- Imagen: reducir para no llenar el teléfono ---------- */
async function shrink(file, max, q){
  let src;
  try { src = await createImageBitmap(file, {imageOrientation:'from-image'}); }
  catch(e){ src = await new Promise((res, rej)=>{ const i = new Image(); i.onload = ()=>res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); }
  const w = src.width, h = src.height, k = Math.min(1, max/Math.max(w,h));
  const c = document.createElement('canvas'); c.width = Math.round(w*k); c.height = Math.round(h*k);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return new Promise(res=>c.toBlob(res, 'image/jpeg', q));
}

/* ---------- Cámara ---------- */
const cam = document.createElement('input');
cam.type = 'file'; cam.accept = 'image/*'; cam.setAttribute('capture','environment'); cam.hidden = true; cam.id = 'camInput';
document.body.appendChild(cam);
let camTarget = null;
function openCamera(day, pin){ camTarget = {day, pin}; cam.value = ''; cam.click(); }
cam.addEventListener('change', async ()=>{
  const f = cam.files && cam.files[0]; if (!f || !camTarget) return;
  const {day, pin} = camTarget;
  try {
    const [full, thumb] = await Promise.all([shrink(f, 1600, .82), shrink(f, 240, .7)]);
    await putPhoto({id:`${user}:${day}-${pin}-${Date.now()}`, owner:user, day, pin, ts:Date.now(), full, thumb});
    setVisited(day, pin, true);
    await refreshPhotos();
    const p = DAYDATA[day].pins[pin];
    toast(`Foto guardada en <b>${esc(p.l)}</b>. Guárdala también en tu galería desde la miniatura.`);
  } catch(e){
    console.error(e);
    toast('No se pudo guardar la foto en este celular. Revisa el espacio disponible o tómala con la app de cámara.');
  }
});

/* ---------- Checklist ---------- */
function setVisited(day, pin, on){
  if (on) visits[vid(day,pin)] = true; else delete visits[vid(day,pin)];
  store.set(VKEY, visits);
  const box = document.querySelector(`.visit[data-day="${day}"][data-pin="${pin}"] input`);
  if (box) box.checked = on;
  const li = document.querySelector(`#${day} .item[data-pin="${pin}"]`);
  if (li) li.classList.toggle('visited', on);
  updateProgress();
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
document.querySelectorAll('.visit').forEach(v=>{
  const day = v.dataset.day, pin = +v.dataset.pin, id = `v-${day}-${pin}`;
  v.innerHTML = `<label class="v-check" for="${id}"><input type="checkbox" id="${id}"${isVisited(day,pin)?' checked':''}><span>Visitada</span></label>
    <button type="button" class="md-btn md-btn--outline md-btn--sm v-cam"><i data-lucide="camera"></i>Tomar foto</button>
    <div class="v-thumbs"></div>`;
  if (isVisited(day,pin)) v.closest('.item').classList.add('visited');
  v.querySelector('input').addEventListener('change', e=>setVisited(day, pin, e.target.checked));
  v.querySelector('.v-cam').addEventListener('click', ()=>openCamera(day, pin));
});
updateProgress();

/* ---------- Miniaturas, álbum y visor ---------- */
let urls = [], photos = [];
const dayById = Object.fromEntries(DAYS.map(d=>[d.id,d]));
function fileFor(p){
  const stop = DAYDATA[p.day].pins[p.pin].l.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/gi,'-').toLowerCase();
  return new File([p.full], `viaje-${dayById[p.day].date.replace(' ','')}-${stop}-${p.ts}.jpg`, {type:'image/jpeg'});
}
async function saveFiles(files){
  try {
    if (navigator.canShare && navigator.canShare({files})) { await navigator.share({files, title:'Viaje Oct 2026'}); return; }
  } catch(e){ if (e && e.name==='AbortError') return; }
  files.forEach((f,i)=>setTimeout(()=>{ const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500); }, i*350));
}
async function refreshPhotos(){
  urls.forEach(u=>URL.revokeObjectURL(u)); urls = [];
  try { photos = await allPhotos(); }
  catch(e){ photos = []; $('albumGrid').innerHTML = `<p class="muted">Este navegador no permite guardar fotos. El checklist sí funciona.</p>`; return; }
  const thumbUrl = p => { const u = URL.createObjectURL(p.thumb); urls.push(u); return u; };
  document.querySelectorAll('.v-thumbs').forEach(t=>{
    const v = t.closest('.visit'), list = photos.filter(p=>p.day===v.dataset.day && p.pin===+v.dataset.pin);
    t.innerHTML = list.map(p=>`<button type="button" class="thumb" data-id="${esc(p.id)}" aria-label="Ver foto"><img src="${thumbUrl(p)}" alt=""></button>`).join('');
  });
  const byDay = DAYS.map(d=>({d, list:photos.filter(p=>p.day===d.id)})).filter(g=>g.list.length);
  $('albumCount').textContent = photos.length ? `${photos.length} ${photos.length===1?'foto':'fotos'}` : '';
  $('albumSaveAll').hidden = !photos.length;
  $('albumGrid').innerHTML = byDay.length ? byDay.map(({d,list})=>`<div class="album-day"><p class="md-eyebrow-label muted">Día ${parseInt(d.n)} · ${esc(d.date)} · ${esc(d.city)}</p><div class="album-row">${list.map(p=>`<button type="button" class="thumb lg" data-id="${esc(p.id)}" aria-label="Ver foto de ${esc(DAYDATA[p.day].pins[p.pin].l)}"><img src="${thumbUrl(p)}" alt=""><span>${esc(DAYDATA[p.day].pins[p.pin].l)}</span></button>`).join('')}</div></div>`).join('')
    : `<div class="album-empty"><i data-lucide="camera"></i><p>Toma la primera foto desde cualquier parada con el botón <b>Tomar foto</b>.</p></div>`;
  if (window.lucide) lucide.createIcons();
}
const lb = $('lightbox');
let lbUrl = null, lbPhoto = null;
function openLightbox(id){
  lbPhoto = photos.find(p=>p.id===id); if (!lbPhoto) return;
  if (lbUrl) URL.revokeObjectURL(lbUrl);
  lbUrl = URL.createObjectURL(lbPhoto.full);
  const pin = DAYDATA[lbPhoto.day].pins[lbPhoto.pin];
  $('lbImg').src = lbUrl; $('lbImg').alt = `Foto de ${pin.l}`;
  $('lbCaption').textContent = `${pin.l} · Día ${parseInt(dayById[lbPhoto.day].n)}`;
  lb.hidden = false; $('lbClose').focus();
}
function closeLightbox(){ lb.hidden = true; $('lbImg').removeAttribute('src'); if (lbUrl) URL.revokeObjectURL(lbUrl); lbUrl = null; lbPhoto = null; }
document.addEventListener('click', e=>{ const t = e.target.closest('.thumb'); if (t) openLightbox(t.dataset.id); });
$('lbClose').addEventListener('click', closeLightbox);
lb.addEventListener('click', e=>{ if (e.target===lb) closeLightbox(); });
document.addEventListener('keydown', e=>{ if (e.key==='Escape' && !lb.hidden) closeLightbox(); });
$('lbSave').addEventListener('click', ()=>{ if (lbPhoto) saveFiles([fileFor(lbPhoto)]); });
$('lbDelete').addEventListener('click', async ()=>{
  if (!lbPhoto) return;
  const btn = $('lbDelete');
  if (btn.dataset.confirm!=='1') { btn.dataset.confirm = '1'; btn.textContent = '¿Borrar? Toca otra vez'; setTimeout(()=>{ btn.dataset.confirm=''; btn.textContent='Borrar'; }, 3000); return; }
  btn.dataset.confirm = ''; btn.textContent = 'Borrar';
  await delPhoto(lbPhoto.id); closeLightbox(); refreshPhotos();
});
$('albumSaveAll').addEventListener('click', ()=>saveFiles(photos.map(fileFor)));

refreshPhotos();
V.visits = {isVisited, setVisited, openCamera};
});
