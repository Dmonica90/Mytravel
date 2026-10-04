/* Checklist "Antes de viajar": porcentaje 0–100 %, grupos, "Ver solo lo que falta" y cosas propias.
   Con Supabase se comparte entre los dos (tabla prechecks) y llegan avisos en vivo;
   sin Supabase se guarda en este celular. */
window.ViajeModules = window.ViajeModules || [];
window.ViajeModules.push(function(V){
'use strict';
const {esc, store, toast, user} = V;
const N = window.Nube && window.Nube.enabled ? window.Nube : null;
const NAMES = {moni:'Moni', nando:'Nando'};
const $ = id => document.getElementById(id);
const LKEY = 'viaje-previaje', CKEY = 'viaje-previaje-cache', FKEY = 'viaje-previaje-filtro';
const base = (window.PREVIAJE || []).map(g=>({g:g.g, items:g.items.map(i=>({...i}))}));
/* Estado: {done:{id:bool}, custom:[{id, t, who}]} */
let state = N ? store.get(CKEY, {done:{}, custom:[]}) : store.get(LKEY, {done:{}, custom:[]});
let onlyMissing = store.get(FKEY, false);

const groups = () => state.custom.length ? [...base, {g:'Agregado por ustedes', custom:true, items:state.custom.map(c=>({id:c.id, t:c.t, who:c.who}))}] : base;
const allItems = () => groups().flatMap(g=>g.items);
const saveLocal = () => store.set(N ? CKEY : LKEY, state);

function render(){
  const items = allItems(), total = items.length, done = items.filter(i=>state.done[i.id]).length;
  const pct = total ? Math.round(done/total*100) : 0;
  const C = 2*Math.PI*52;
  $('preRing').innerHTML = `<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" cx="60" cy="60" r="52" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pct/100)).toFixed(1)}" transform="rotate(-90 60 60)"/></svg><span class="ring-num">${pct}<small>%</small></span>`;
  $('preRing').setAttribute('aria-label', `${pct} % listo`);
  $('preStatus').textContent = pct===100 ? 'Todo listo para el viaje.' : `Llevan ${done} de ${total} · ${total-done===1 ? 'falta 1' : `faltan ${total-done}`}`;
  $('preSub').textContent = N ? 'Lo que marca uno lo ve el otro.' : 'Se guarda en este celular.';
  $('preFilter').setAttribute('aria-pressed', onlyMissing);
  $('preFilter').querySelector('span').textContent = onlyMissing ? 'Ver todo' : 'Ver solo lo que falta';
  $('preGrid').innerHTML = groups().map(g=>{
    const n = g.items.length, d = g.items.filter(i=>state.done[i.id]).length;
    const visible = g.items.filter(i=>!onlyMissing || !state.done[i.id]);
    return `<div class="panel pre-group${d===n?' complete':''}"><div class="pre-head"><h3>${esc(g.g)}</h3><span class="pre-count">${d}/${n}</span></div>
      ${visible.length ? `<ul class="checks">${visible.map(i=>`<li><label for="pre-${esc(i.id)}"><input type="checkbox" id="pre-${esc(i.id)}" data-pre="${esc(i.id)}"${state.done[i.id]?' checked':''}><span>${esc(i.t)}${i.who?` <em class="pre-who">· ${esc(NAMES[i.who]||'')}</em>`:''}</span></label>${g.custom?`<button type="button" class="pre-del" data-del="${esc(i.id)}" aria-label="Quitar ${esc(i.t)}">×</button>`:''}</li>`).join('')}</ul>`
        : `<p class="pre-done">Completo.</p>`}</div>`;
  }).join('');
}

async function setDone(id, on){
  state.done[id] = on; saveLocal(); render();
  if (N) { try { const c = state.custom.find(x=>x.id===id); await N.setPrecheck(id, on, c && c.t); } catch(e){ toast('No se pudo guardar. Se intentará de nuevo con conexión.'); } }
}
async function addItem(t){
  const id = `x-${Date.now().toString(36)}`;
  state.custom.push({id, t, who:user}); saveLocal(); render();
  if (N) { try { await N.setPrecheck(id, false, t); } catch(e){ toast('No se pudo guardar. Revisa tu conexión.'); } }
}
async function delItem(id){
  state.custom = state.custom.filter(c=>c.id!==id); delete state.done[id]; saveLocal(); render();
  if (N) { try { await N.delPrecheck(id); } catch(e){ toast('No se pudo quitar. Revisa tu conexión.'); } }
}

$('preGrid').addEventListener('change', e=>{ const id = e.target.dataset.pre; if (id) setDone(id, e.target.checked); });
$('preGrid').addEventListener('click', e=>{ const b = e.target.closest('[data-del]'); if (b) delItem(b.dataset.del); });
$('preFilter').addEventListener('click', ()=>{ onlyMissing = !onlyMissing; store.set(FKEY, onlyMissing); render(); });
$('preAdd').addEventListener('submit', e=>{ e.preventDefault(); const t = $('preAddText').value.trim().slice(0, 80); if (!t) return; $('preAddText').value = ''; addItem(t); });

render();

if (N) {
  N.listPrechecks().then(rows=>{
    state = {done:{}, custom:[]};
    rows.forEach(r=>{ state.done[r.item_id] = !!r.done; if (r.custom) state.custom.push({id:r.item_id, t:r.label||'', who:r.who}); });
    saveLocal(); render();
  }).catch(()=>{});
  window.addEventListener('nube:change', e=>{
    const {table, type, row} = e.detail; if (table!=='prechecks' || !row) return;
    if (type==='DELETE') { state.custom = state.custom.filter(c=>c.id!==row.item_id); delete state.done[row.item_id]; }
    else {
      state.done[row.item_id] = !!row.done;
      if (row.custom && !state.custom.find(c=>c.id===row.item_id)) state.custom.push({id:row.item_id, t:row.label||'', who:row.who});
    }
    saveLocal(); render();
    if (row.who===user || type==='DELETE') return;
    const item = allItems().find(i=>i.id===row.item_id);
    if (type==='INSERT' && row.custom) toast(`<b>${esc(NAMES[row.who])}</b> agregó: ${esc(row.label||'')}`);
    else if (row.done && item) toast(`<b>${esc(NAMES[row.who])}</b> marcó: ${esc(item.t)}`);
  });
}
});
