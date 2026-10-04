/* Personalizar el día: cambiar la hora de una parada o dejarle una nota.
   Con Supabase se comparte entre los dos (tabla "edits"); sin Supabase se guarda en este celular.
   Los cambios se aplican a DAYS antes de dibujar la app (ViajeEdits.load). */
(function(){
'use strict';
const N = () => (window.Nube && window.Nube.enabled ? window.Nube : null);
const LKEY = 'viaje-edits-local', CKEY = 'viaje-edits-cache';
const read = k => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch(e){ return []; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
const NAMES = {moni:'Moni', nando:'Nando'};

function apply(rows){
  rows.forEach(r=>{
    const d = DAYS.find(x=>x.id===r.day); if (!d) return;
    d.blocks.forEach(b=>b.items.forEach(it=>{
      if ((it.t0||it.t)!==r.item_t) return;
      it.t0 = it.t0 || it.t;
      if (r.hora) it.t = r.hora;
      if (r.nota) { it.nota = r.nota; it.notaWho = r.who; }
    }));
  });
}

window.ViajeEdits = {
  rows: [],
  async load(){
    let rows;
    if (N()) {
      try { rows = await N().listEdits(); write(CKEY, rows); }
      catch(e){ rows = read(CKEY); }
    } else rows = read(LKEY);
    this.rows = rows || [];
    apply(this.rows);
  }
};

window.ViajeModules = window.ViajeModules || [];
window.ViajeModules.push(function(V){
  const {esc, DAYS, toast, user, ME} = V;
  const $ = id => document.getElementById(id);
  const sheet = $('editSheet');

  /* Botón "Editar" en cada parada del itinerario principal. */
  DAYS.forEach(d=>{
    const items = V.DAYDATA[d.id].items;
    items.forEach((e,i)=>{
      const li = document.querySelector(`#${d.id} .item[data-idx="${i}"] .item-head`); if (!li) return;
      li.insertAdjacentHTML('beforeend', `<button type="button" class="edit-btn" data-day="${d.id}" data-idx="${i}" aria-label="Editar ${esc(e.it.title)}"><i data-lucide="pencil"></i></button>`);
    });
  });

  let cur = null;
  function open(dayId, idx){
    const items = V.DAYDATA[dayId].items, it = items[idx].it;
    cur = {dayId, idx, it, prev: items[idx-1] && items[idx-1].it, next: items[idx+1] && items[idx+1].it};
    $('editTitle').textContent = it.title;
    $('editOriginal').textContent = it.t0 && it.t0!==it.t ? `Hora original: ${it.t0}` : '';
    $('editHora').value = it.t;
    $('editNota').value = it.nota || '';
    $('editError').hidden = true;
    $('editShared').textContent = N() ? `Los cambios los ve también ${V.OTHER}.` : 'Los cambios se guardan solo en este celular.';
    sheet.hidden = false; $('editHora').focus();
  }
  const close = () => { sheet.hidden = true; cur = null; };
  document.addEventListener('click', e=>{ const b = e.target.closest('.edit-btn'); if (b) { e.stopPropagation(); open(b.dataset.day, +b.dataset.idx); } }, true);
  $('editCancel').addEventListener('click', close);
  sheet.addEventListener('click', e=>{ if (e.target===sheet) close(); });
  document.addEventListener('keydown', e=>{ if (e.key==='Escape' && !sheet.hidden) close(); });

  async function persist(row, remove){
    if (N()) {
      if (remove) await N().clearEdit(row.day, row.item_t); else await N().saveEdit(row.day, row.item_t, row.hora, row.nota);
    } else {
      const rows = read(LKEY).filter(r=>!(r.day===row.day && r.item_t===row.item_t));
      if (!remove) rows.push({...row, who:user});
      write(LKEY, rows);
    }
  }
  $('editForm').addEventListener('submit', async e=>{
    e.preventDefault(); if (!cur) return;
    const hora = $('editHora').value, nota = $('editNota').value.trim().slice(0, 140);
    /* La hora nueva debe quedar entre la parada anterior y la siguiente, para no desordenar el día. */
    if (!/^\d{2}:\d{2}$/.test(hora)) { $('editError').textContent = 'Escribe la hora como 18:30.'; $('editError').hidden = false; return; }
    if ((cur.prev && hora < cur.prev.t) || (cur.next && hora > cur.next.t)) {
      $('editError').textContent = `La hora tiene que quedar entre ${cur.prev ? cur.prev.t : 'el inicio del día'} y ${cur.next ? cur.next.t : 'el final del día'}.`;
      $('editError').hidden = false; return;
    }
    const item_t = cur.it.t0 || cur.it.t;
    const same = hora===item_t && !nota;
    try { await persist({day:cur.dayId, item_t, hora: hora===item_t ? null : hora, nota: nota || null}, same); }
    catch(x){ $('editError').textContent = 'No se pudo guardar. Revisa tu conexión.'; $('editError').hidden = false; return; }
    location.reload();
  });
  $('editRestore').addEventListener('click', async ()=>{
    if (!cur) return;
    try { await persist({day:cur.dayId, item_t:cur.it.t0 || cur.it.t}, true); } catch(x){ $('editError').textContent = 'No se pudo restaurar. Revisa tu conexión.'; $('editError').hidden = false; return; }
    location.reload();
  });

  /* Cambios del otro en vivo. */
  window.addEventListener('nube:change', e=>{
    const {table, row} = e.detail; if (table!=='edits' || !row || row.who===user) return;
    const d = DAYS.find(x=>x.id===row.day);
    const it = d && d.blocks.flatMap(b=>b.items).find(x=>(x.t0||x.t)===row.item_t);
    const what = row.hora ? `cambió la hora de <b>${esc(it ? it.title : 'una parada')}</b> a ${esc(row.hora)}` : row.nota ? `dejó una nota en <b>${esc(it ? it.title : 'una parada')}</b>` : `restauró <b>${esc(it ? it.title : 'una parada')}</b>`;
    toast(`<b>${esc(NAMES[row.who]||'')}</b> ${what}.`, [{label:'Actualizar', run:()=>location.reload()}], {sticky:true});
  });
});
})();
