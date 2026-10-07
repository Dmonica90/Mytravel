/* Pestañas tipo app: Viaje · Álbum · Pendientes · Gastos · Más.
   Cada bloque de la página lleva data-tab="…" y solo se ven los de la pestaña activa.
   La pestaña vive en el hash (#album, #pendientes…), así funcionan "atrás" y los enlaces
   internos (#d3 abre Viaje y baja al día 3). En el celular la barra va abajo; en
   pantallas anchas se mueve al header. También maneja "Instalar en el celular". */
(function(){
'use strict';
const TABS = ['viaje','album','pendientes','gastos','mas'];
const $ = id => document.getElementById(id);
const scrollPos = {}, listeners = {};
let cur = null;

function offset(tab){
  const bar = document.querySelector('.bar'), day = document.querySelector('.daybar');
  return (bar ? bar.offsetHeight : 0) + ((tab||cur)==='viaje' && day ? day.offsetHeight : 0) + 8;
}
/* "#d3" → {tab:'viaje', el:<section d3>}; "#album" → {tab:'album'} */
function resolve(hash){
  const id = decodeURIComponent((hash||'').replace(/^#/,''));
  if (!id) return {tab:'viaje'};
  if (TABS.includes(id)) return {tab:id};
  const el = document.getElementById(id);
  const host = el && el.closest('[data-tab]');
  return host ? {tab:host.dataset.tab, el} : {tab:'viaje'};
}
function show(tab, el){
  const changed = cur!==tab;
  if (cur && changed) scrollPos[cur] = scrollY;
  cur = tab;
  document.body.dataset.view = tab;
  document.querySelectorAll('[data-tab]').forEach(x=>{ x.hidden = x.dataset.tab!==tab; });
  document.querySelectorAll('[data-tab-link]').forEach(a=>a.setAttribute('aria-current', a.dataset.tabLink===tab ? 'page' : 'false'));
  if (changed) (listeners[tab]||[]).forEach(f=>{ try { f(); } catch(e){ console.error(e); } });
  if (el) requestAnimationFrame(()=>window.scrollTo({top:Math.max(0, el.getBoundingClientRect().top + scrollY - offset(tab)), behavior:'instant'}));
  else if (changed) window.scrollTo({top:scrollPos[tab]||0, behavior:'instant'});
}
function go(hash, {replace=false}={}){
  const h = hash.startsWith('#') ? hash : `#${hash}`;
  if (location.hash!==h) history[replace?'replaceState':'pushState'](null, '', h);
  const r = resolve(h); show(r.tab, r.el);
}
document.addEventListener('click', e=>{
  const a = e.target.closest('a[href^="#"]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
  const h = a.getAttribute('href'); if (h.length<2) return;
  e.preventDefault();
  /* Tocar la pestaña en la que ya están: volver arriba. */
  if (a.dataset.tabLink && a.dataset.tabLink===cur) { window.scrollTo({top:0, behavior:'smooth'}); return; }
  go(h);
});
window.addEventListener('popstate', ()=>{ const r = resolve(location.hash); show(r.tab, r.el); });

/* Insignias: lo que falta en Pendientes y punto en Álbum cuando llega una foto del otro. */
function badge(n){ const b = $('badgePend'); if (!b) return; b.textContent = n>99 ? '99+' : String(n); b.hidden = !n; }
function dot(on){ const d = $('dotAlbum'); if (d) d.hidden = !on || cur==='album'; }
const on = (tab, f) => { (listeners[tab] = listeners[tab] || []).push(f); };
on('album', ()=>dot(false));

/* Escritorio: la barra de pestañas sube al header. */
const tabbar = $('tabbar'), wide = matchMedia('(min-width: 900px)');
function place(){
  if (!tabbar) return;
  if (wide.matches) $('barTabs').appendChild(tabbar);
  else document.querySelector('.bar').after(tabbar);
}
wide.addEventListener('change', place); place();

const r0 = resolve(location.hash); show(r0.tab, null);

window.ViajeTabs = {
  go, on, badge, dot, offset,
  current: () => cur,
  /* Después de pintar el itinerario: si el enlace apuntaba a un día (#d3), bajar hasta él. */
  refresh(){ const r = resolve(location.hash); show(r.tab, location.hash && !TABS.includes(location.hash.slice(1)) ? r.el : null); }
};

/* ---------- Instalar en el celular ---------- */
let deferred = null;
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone===true;
const ua = navigator.userAgent;
const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
const isAndroid = /android/i.test(ua);
function paintInstall(){
  const l = $('installLbl'); if (!l) return;
  l.textContent = standalone() ? 'Ya está instalada en este celular' : deferred ? 'Toca para instalarla' : 'Como app, en la pantalla de inicio';
}
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferred = e; paintInstall(); });
window.addEventListener('appinstalled', ()=>{ deferred = null; paintInstall(); });
const step = (n, html) => `<li><span class="k">${n}</span><span>${html}</span></li>`;
function steps(){
  if (standalone()) return '<p class="sheet-sub">Ya la están usando como app. Si la borran, se vuelve a instalar desde el navegador.</p>';
  if (isIOS) return `<ol class="plain-list install-steps">
    ${step(1, 'Abre esta página en <b>Safari</b> (en Chrome también funciona en iOS 16.4 o más nuevo).')}
    ${step(2, 'Toca <b>Compartir</b>: el cuadrito con la flecha hacia arriba, abajo en la pantalla.')}
    ${step(3, 'Baja y elige <b>Agregar a inicio</b>.')}
    ${step(4, 'Toca <b>Agregar</b>. Aparece el ícono "Viaje Oct 2026" junto a tus apps.')}
  </ol>`;
  if (isAndroid) return `<ol class="plain-list install-steps">
    ${step(1, 'Abre esta página en <b>Chrome</b>.')}
    ${step(2, 'Toca el menú <b>⋮</b> arriba a la derecha.')}
    ${step(3, 'Elige <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>.')}
    ${step(4, 'Confirma con <b>Instalar</b>. Aparece el ícono "Viaje Oct 2026" junto a tus apps.')}
  </ol>`;
  return `<ol class="plain-list install-steps">
    ${step(1, 'En el celular, abre esta misma dirección en el navegador.')}
    ${step(2, 'iPhone: Safari → <b>Compartir</b> → <b>Agregar a inicio</b>.')}
    ${step(3, 'Android: Chrome → menú <b>⋮</b> → <b>Instalar app</b>.')}
  </ol><p class="sheet-sub">En la computadora, Chrome y Edge muestran un ícono de instalar en la barra de direcciones.</p>`;
}
const sheet = $('installSheet');
function openSheet(){ $('installSteps').innerHTML = steps(); sheet.hidden = false; $('installClose').focus(); }
if ($('installBtn')) $('installBtn').addEventListener('click', async ()=>{
  if (deferred && !standalone()) {
    const d = deferred; deferred = null;
    try { d.prompt(); await d.userChoice; } catch(e){ openSheet(); }
    paintInstall(); return;
  }
  openSheet();
});
if (sheet) {
  $('installClose').addEventListener('click', ()=>{ sheet.hidden = true; });
  sheet.addEventListener('click', e=>{ if (e.target===sheet) sheet.hidden = true; });
}
paintInstall();
})();
