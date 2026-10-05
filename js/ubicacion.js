/* "Estoy cerca": con la app abierta, muestra tu posición en los mapas, la distancia
   a cada parada y avisa al llegar (≤ 150 m) a una parada que aún no está visitada.
   Una web no puede seguir la ubicación con la app cerrada. */
window.ViajeModules = window.ViajeModules || [];
window.ViajeModules.push(function(V){
'use strict';
const {esc, store, key, DAYS, DAYDATA, MAPS, toast, todayId, ME} = V;
const $ = id => document.getElementById(id);
const PREF = key('viaje-ubicacion');
const ARRIVE_M = 150;
const btns = [$('locBtn'), $('nowLoc'), $('setLoc')].filter(Boolean);
let watchId = null, me = null, centered = false;
const notified = new Set();

const toRad = x => x*Math.PI/180;
function meters(a, b){
  const R = 6371000, dLat = toRad(b.lat-a.lat), dLng = toRad(b.lng-a.lng);
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
const fmt = m => m<30 ? 'aquí' : m<1000 ? `a ${Math.round(m/10)*10} m` : m<100000 ? `a ${(m/1000).toFixed(1).replace('.',',')} km` : `a ${Math.round(m/1000)} km`;

function setButtons(on, label){
  btns.forEach(b=>{ b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); const t = b.querySelector('.lbl'); if (t) t.textContent = label || (on ? 'Ubicación activa' : 'Usar mi ubicación'); });
}

function drawMe(pos){
  const ll = [pos.lat, pos.lng];
  Object.entries(MAPS).forEach(([id, m])=>{
    if (!m.me) {
      m.meAcc = L.circle(ll, {radius:pos.acc, className:'me-acc', interactive:false}).addTo(m.map);
      m.me = L.marker(ll, {icon:L.divIcon({className:'mk-wrap', html:'<span class="me-dot"></span>', iconSize:[18,18], iconAnchor:[9,9]}), keyboard:false, zIndexOffset:1000}).bindTooltip(`${esc(ME)} (tú)`, {direction:'top', offset:[0,-10], className:'mk-label'}).addTo(m.map);
    } else { m.me.setLatLng(ll); m.meAcc.setLatLng(ll).setRadius(pos.acc); }
  });
  const t = todayId();
  if (!centered && t && MAPS[t]) {
    centered = true;
    const near = MAPS[t].pins.some(p=>meters(pos, p) < 20000);
    if (near) MAPS[t].map.panTo(ll);
  }
}

function updateDistances(pos){
  DAYS.forEach(d=>DAYDATA[d.id].pins.forEach((p,i)=>{
    const el = document.querySelector(`#${d.id} .item[data-pin="${i}"] .dist`); if (!el) return;
    el.textContent = fmt(meters(pos, p)); el.hidden = false;
  }));
}

function checkArrival(pos){
  const t = todayId();
  const days = t ? [DAYS.find(d=>d.id===t)] : DAYS;
  let best = null;
  days.forEach(d=>DAYDATA[d.id].pins.forEach((p,i)=>{
    if (V.visits && V.visits.isVisited(d.id, i)) return;
    const k = `${d.id}-${i}`; if (notified.has(k)) return;
    const m = meters(pos, p);
    if (m<=ARRIVE_M && (!best || m<best.m)) best = {d, i, p, m, k};
  }));
  if (!best) return;
  notified.add(best.k);
  if (navigator.vibrate) { try { navigator.vibrate([120, 60, 120]); } catch(e){} }
  V.activate(best.d.id, best.i, {pan:true});
  toast(`<b>${esc(ME)}, ¡llegaron a ${esc(best.p.l)}!</b><span>Día ${parseInt(best.d.n)} · ${esc(best.p.it.t)}</span>`, [
    {label:'Tomar foto', run:()=>V.visits && V.visits.openCamera(best.d.id, best.i)},
    {label:'Marcar visitada', run:()=>V.visits && V.visits.setVisited(best.d.id, best.i, true)}
  ], {sticky:true});
}

function onPos(g){
  me = {lat:g.coords.latitude, lng:g.coords.longitude, acc:Math.min(g.coords.accuracy||50, 500)};
  setButtons(true);
  drawMe(me); updateDistances(me); checkArrival(me);
}
let warned = false;
function onErr(err){
  /* Un timeout suelto mientras ya hay posición no merece aviso; el seguimiento continúa. */
  if (err && err.code!==1 && (me || warned)) return;
  warned = true;
  const msg = err && err.code===1 ? 'Permiso de ubicación denegado. Actívalo en los ajustes del navegador para esta página.' : 'No pudimos obtener tu ubicación. Revisa que el GPS esté encendido.';
  toast(esc(msg));
  if (err && err.code===1) { stop(); store.set(PREF, false); }
}
function start(){
  if (!('geolocation' in navigator)) { toast('Este navegador no permite usar la ubicación.'); return; }
  if (watchId!==null) return;
  setButtons(true, 'Buscando…');
  watchId = navigator.geolocation.watchPosition(onPos, onErr, {enableHighAccuracy:true, maximumAge:15000, timeout:30000});
  store.set(PREF, true);
}
function stop(){
  if (watchId!==null) navigator.geolocation.clearWatch(watchId);
  watchId = null; me = null; centered = false;
  Object.values(MAPS).forEach(m=>{ if (m.me){ m.me.remove(); m.meAcc.remove(); m.me = m.meAcc = null; } });
  document.querySelectorAll('.item .dist').forEach(d=>{ d.hidden = true; });
  setButtons(false);
}
btns.forEach(b=>b.addEventListener('click', ()=>{ if (watchId===null) start(); else { stop(); store.set(PREF, false); } }));

if (store.get(PREF, false) && navigator.permissions && navigator.permissions.query) {
  navigator.permissions.query({name:'geolocation'}).then(s=>{ if (s.state==='granted') start(); }).catch(()=>{});
}
});
