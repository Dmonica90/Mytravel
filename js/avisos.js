/* Ajustes → "Agregar a mi calendario" y "Activar notificaciones".
   - Calendario: suscripción webcal:// al .ics de quien inició sesión (calendario/viaje-<yo>.ics),
     generado por tools/calendario.mjs. Se actualiza solo y el iPhone avisa con sus alarmas.
   - Push: en iPhone solo funciona con la app instalada en la pantalla de inicio (iOS 16.4+).
     La suscripción se guarda en Supabase (push_subs) y la Edge Function "avisos" manda los avisos. */
window.ViajeModules = window.ViajeModules || [];
window.ViajeModules.push(function(V){
'use strict';
const {toast, user} = V;
const N = window.Nube && window.Nube.enabled ? window.Nube : null;
const cfg = window.VIAJE_CONFIG || {};
const $ = id => document.getElementById(id);

/* ---------- Calendario ---------- */
const icsPath = `calendario/viaje-${user}.ics`;
const icsUrl = new URL(icsPath, location.href);
const sheet = $('calSheet');
$('calBtn').addEventListener('click', ()=>{ sheet.hidden = false; $('calClose').focus(); });
$('calSub').href = `webcal://${icsUrl.host}${icsUrl.pathname}`;
$('calDl').href = icsPath;
$('calDl').setAttribute('download', `viaje-oct-2026-${user}.ics`);
$('calClose').addEventListener('click', ()=>{ sheet.hidden = true; });
sheet.addEventListener('click', e=>{ if (e.target===sheet) sheet.hidden = true; });

/* ---------- Notificaciones push ---------- */
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone===true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const lbl = t => { $('pushLbl').textContent = t; };
function b64ToBytes(s){
  const b = atob((s + '='.repeat((4 - s.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(b, c=>c.charCodeAt(0));
}
async function currentSub(){
  if (!supported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}
async function paint(){
  $('pushTest').hidden = true;
  if (!N || !cfg.vapidPublicKey) return lbl('Necesita la conexión con Supabase');
  if (!supported()) return lbl(isIOS && !standalone() ? 'Primero instala la app en la pantalla de inicio' : 'Este navegador no permite notificaciones');
  if (Notification.permission==='denied') return lbl('Bloqueadas: actívalas en Ajustes del iPhone → Notificaciones → Viaje Oct 2026');
  const sub = await currentSub().catch(()=>null);
  if (sub && Notification.permission==='granted') { lbl('Activadas en este celular · toca para apagarlas'); $('pushTest').hidden = false; return; }
  lbl('Check-in, "en 30 min…" y fotos de los dos, con la app cerrada');
}
async function enable(){
  if (!N || !cfg.vapidPublicKey) { toast('Primero hay que conectar Supabase.'); return; }
  if (!supported()) {
    if (isIOS && !standalone()) { toast('En iPhone, primero instala la app en la pantalla de inicio y ábrela desde ese ícono.'); $('installBtn').click(); }
    else toast('Este navegador no permite notificaciones.');
    return;
  }
  const existing = await currentSub().catch(()=>null);
  if (existing && Notification.permission==='granted') {
    try { await N.delPush(existing.endpoint); } catch(e){}
    await existing.unsubscribe().catch(()=>{});
    toast('Notificaciones apagadas en este celular.'); return paint();
  }
  const perm = await Notification.requestPermission();
  if (perm!=='granted') { toast('Sin permiso no se pueden mandar avisos. Puedes activarlo en Ajustes del iPhone → Notificaciones.'); return paint(); }
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64ToBytes(cfg.vapidPublicKey)});
    await N.savePush(sub);
    toast('¡Listo! Te llegarán los avisos del viaje. Toca "Probar notificación" para ver uno.');
  } catch(e){
    console.warn(e);
    toast('No se pudieron activar. Revisa tu conexión (y que ya hayan corrido el SQL nuevo en Supabase).');
  }
  paint();
}
$('pushBtn').addEventListener('click', enable);
$('pushTest').addEventListener('click', async ()=>{
  try { const r = await N.testPush(); toast(r && r.sent ? 'Enviada: debería llegar en unos segundos.' : 'No encontré este celular en la lista. Apaga y vuelve a activar las notificaciones.'); }
  catch(e){ console.warn(e); toast('Aún no funciona: falta crear la función "avisos" en Supabase (ver los pasos).'); }
});
paint();
});
