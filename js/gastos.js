/* Pestaña Gastos: lista compartida de lo que van gastando.
   Totales por moneda (EUR/MXN), Europa contra el presupuesto, por categoría y
   "cuentas claras" (quién le debe a quién, dividiendo a la mitad lo de los dos).
   Con Supabase se comparte en vivo (tabla gastos); sin Supabase queda en este celular. */
window.ViajeModules = window.ViajeModules || [];
window.ViajeModules.push(function(V){
'use strict';
const {esc, store, DAYS, toast, user} = V;
const N = window.Nube && window.Nube.enabled ? window.Nube : null;
const NAMES = {moni:'Moni', nando:'Nando'};
const OTHER_ID = user==='moni' ? 'nando' : 'moni';
const $ = id => document.getElementById(id);
const LKEY = 'viaje-gastos', CKEY = 'viaje-gastos-cache', RKEY = 'viaje-tc';
const BUDGET_EUR = 634;
const CATS = [
  {id:'comida', n:'Comida', icon:'utensils'},
  {id:'transporte', n:'Transporte', icon:'train-front'},
  {id:'hospedaje', n:'Hospedaje', icon:'bed-double'},
  {id:'entradas', n:'Museos y entradas', icon:'ticket'},
  {id:'compras', n:'Compras', icon:'shopping-bag'},
  {id:'otros', n:'Otros', icon:'circle-ellipsis'}
];
const catOf = id => CATS.find(c=>c.id===id) || CATS[CATS.length-1];
const dayById = Object.fromEntries(DAYS.map(d=>[d.id, d]));
const dayLabel = id => id==='pre' ? 'Antes del viaje' : dayById[id] ? `Día ${parseInt(dayById[id].n)} · ${dayById[id].date} · ${dayById[id].city}` : id;

/* [{id, monto, moneda, concepto, categoria, dia, pago, para, who, ts}] */
let gastos = store.get(N ? CKEY : LKEY, []);
let rate = +store.get(RKEY, 20) || 20;
let editing = null;

const nfEur = new Intl.NumberFormat('es-ES', {minimumFractionDigits:2, maximumFractionDigits:2});
const nfMxn = new Intl.NumberFormat('es-MX', {minimumFractionDigits:0, maximumFractionDigits:2});
const money = (v, cur) => cur==='EUR' ? `${nfEur.format(v)} €` : `$${nfMxn.format(v)} MXN`;
const toEur = g => g.moneda==='EUR' ? +g.monto : +g.monto / rate;
const parseMonto = s => { const v = parseFloat(String(s).replace(/\s/g,'').replace(/,(?=\d{1,2}$)/, '.').replace(/,/g,'')); return isFinite(v) ? Math.round(v*100)/100 : NaN; };

/* Día por defecto: hoy si es día de viaje; antes del viaje → "pre"; después → último. */
function defaultDay(){
  const t = V.todayId(); if (t) return t;
  const f = new Intl.DateTimeFormat('en-CA', {timeZone:DAYS[0].tz || 'Europe/Madrid', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());
  return f < DAYS[0].iso ? 'pre' : DAYS[DAYS.length-1].id;
}
const defaultCur = day => (day!=='pre' && dayById[day] && dayById[day].tz==='America/Cancun') ? 'MXN' : 'EUR';

/* ---------- Formulario ---------- */
$('gaCats').innerHTML = CATS.map((c,i)=>`<label class="ga-cat"><input type="radio" name="gaCat" value="${c.id}"${i===0?' checked':''}><span><i data-lucide="${c.icon}"></i>${esc(c.n)}</span></label>`).join('');
$('gaDia').innerHTML = `<option value="pre">Antes del viaje</option>` + DAYS.map(d=>`<option value="${d.id}">${esc(dayLabel(d.id))}</option>`).join('');
$('gaRate').value = rate;
const radio = name => (document.querySelector(`#gaForm input[name="${name}"]:checked`)||{}).value;
const setRadio = (name, v) => { const r = document.querySelector(`#gaForm input[name="${name}"][value="${v}"]`); if (r) r.checked = true; };

function resetForm(){
  editing = null;
  $('gaForm').reset();
  const day = defaultDay();
  $('gaDia').value = day;
  setRadio('gaMoneda', defaultCur(day)); setRadio('gaCat', 'comida'); setRadio('gaPago', user); setRadio('gaPara', 'ambos');
  $('gaSubmit').textContent = 'Agregar gasto';
  $('gaCancel').hidden = $('gaDelete').hidden = true;
  $('gaFormTitle').textContent = 'Nuevo gasto';
  $('gaError').hidden = true;
}
function editGasto(id){
  const g = gastos.find(x=>x.id===id); if (!g) return;
  editing = id;
  $('gaMonto').value = String(g.monto).replace('.', ',');
  $('gaConcepto').value = g.concepto || '';
  $('gaDia').value = g.dia;
  setRadio('gaMoneda', g.moneda); setRadio('gaCat', g.categoria); setRadio('gaPago', g.pago); setRadio('gaPara', g.para);
  $('gaSubmit').textContent = 'Guardar cambios';
  $('gaCancel').hidden = $('gaDelete').hidden = false;
  $('gaFormTitle').textContent = 'Editar gasto';
  $('gaError').hidden = true;
  const top = $('gaForm').getBoundingClientRect().top + scrollY - (window.ViajeTabs ? ViajeTabs.offset() : 80);
  window.scrollTo({top, behavior:'smooth'});
  $('gaMonto').focus({preventScroll:true});
}
$('gaDia').addEventListener('change', ()=>{ if (!editing) setRadio('gaMoneda', defaultCur($('gaDia').value)); });

async function persist(g, del){
  store.set(N ? CKEY : LKEY, gastos);
  render();
  if (!N) return;
  try { if (del) await N.delGasto(g.id); else await N.saveGasto(g); }
  catch(e){ console.warn(e); toast('No se pudo guardar en la nube. Revisa tu conexión (y que ya hayan corrido el SQL nuevo en Supabase).'); }
}
$('gaForm').addEventListener('submit', e=>{
  e.preventDefault();
  const monto = parseMonto($('gaMonto').value);
  const err = $('gaError');
  if (!(monto>0)) { err.textContent = 'Escribe un monto mayor a cero.'; err.hidden = false; $('gaMonto').focus(); return; }
  const concepto = $('gaConcepto').value.trim().slice(0, 80) || catOf(radio('gaCat')).n;
  const base = editing ? gastos.find(x=>x.id===editing) : null;
  const g = {
    id: base ? base.id : (crypto.randomUUID ? crypto.randomUUID() : `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`),
    monto, moneda: radio('gaMoneda'), concepto, categoria: radio('gaCat'), dia: $('gaDia').value,
    pago: radio('gaPago'), para: radio('gaPara'), who: user, ts: base ? base.ts : Date.now()
  };
  gastos = base ? gastos.map(x=>x.id===g.id ? g : x) : [...gastos, g];
  const wasEdit = !!base;
  resetForm();
  persist(g);
  toast(wasEdit ? 'Gasto actualizado.' : `Agregado: ${esc(g.concepto)} · ${esc(money(g.monto, g.moneda))}`);
});
$('gaCancel').addEventListener('click', resetForm);
$('gaDelete').addEventListener('click', ()=>{
  const b = $('gaDelete');
  if (b.dataset.confirm!=='1') { b.dataset.confirm = '1'; b.textContent = '¿Borrar? Toca otra vez'; setTimeout(()=>{ b.dataset.confirm = ''; b.textContent = 'Borrar'; }, 3000); return; }
  b.dataset.confirm = ''; b.textContent = 'Borrar';
  const g = gastos.find(x=>x.id===editing); if (!g) return;
  gastos = gastos.filter(x=>x.id!==g.id);
  resetForm(); persist(g, true); toast('Gasto borrado.');
});
$('gaRate').addEventListener('change', ()=>{ const v = parseMonto($('gaRate').value); if (v>0) { rate = v; store.set(RKEY, rate); render(); } else $('gaRate').value = rate; });
$('gaList').addEventListener('click', e=>{ const r = e.target.closest('[data-gasto]'); if (r) editGasto(r.dataset.gasto); });

/* ---------- Resumen y lista ---------- */
function balance(){
  const net = {moni:0, nando:0};
  gastos.forEach(g=>{
    const v = toEur(g);
    net[g.pago] += v;
    if (g.para==='ambos') { net.moni -= v/2; net.nando -= v/2; } else net[g.para] -= v;
  });
  return net;
}
function render(){
  const eur = gastos.filter(g=>g.moneda==='EUR').reduce((s,g)=>s+ +g.monto, 0);
  const mxn = gastos.filter(g=>g.moneda==='MXN').reduce((s,g)=>s+ +g.monto, 0);
  const totalEur = eur + mxn/rate;
  const pct = Math.min(100, eur/BUDGET_EUR*100);
  const over = eur > BUDGET_EUR;
  const net = balance();
  const owed = Math.abs(net.moni) < 0.005 ? null : (net.moni>0 ? {from:'nando', to:'moni', v:net.moni} : {from:'moni', to:'nando', v:-net.moni});
  let cuentas;
  if (!gastos.length) cuentas = 'Cuando agreguen gastos, aquí verán quién le debe a quién.';
  else if (!owed) cuentas = 'Están a mano.';
  else if (owed.from===user) cuentas = `Le debes <b>${esc(money(owed.v,'EUR'))}</b> a ${NAMES[owed.to]} <small>(≈ ${esc(money(owed.v*rate,'MXN'))})</small>`;
  else if (owed.to===user) cuentas = `${NAMES[owed.from]} te debe <b>${esc(money(owed.v,'EUR'))}</b> <small>(≈ ${esc(money(owed.v*rate,'MXN'))})</small>`;
  else cuentas = `${NAMES[owed.from]} le debe <b>${esc(money(owed.v,'EUR'))}</b> a ${NAMES[owed.to]}`;
  const byCat = CATS.map(c=>({c, v:gastos.filter(g=>g.categoria===c.id).reduce((s,g)=>s+toEur(g), 0)})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  const maxCat = byCat.length ? byCat[0].v : 1;
  $('gaSummary').innerHTML = `
    <div class="ga-totals">
      <div class="stat"><div class="stat-num">${esc(money(eur,'EUR'))}</div><div class="stat-label">en euros</div></div>
      <div class="stat"><div class="stat-num">${esc(money(mxn,'MXN'))}</div><div class="stat-label">en pesos</div></div>
      <div class="stat span-2"><div class="stat-num">≈ ${esc(money(totalEur,'EUR'))}</div><div class="stat-label">todo junto · ≈ ${esc(money(totalEur*rate,'MXN'))}</div></div>
    </div>
    <div class="panel ga-budget${over?' over':''}">
      <div class="ga-budget-top"><span>Europa contra el presupuesto</span><b>${esc(money(eur,'EUR'))} de ~${BUDGET_EUR} €</b></div>
      <div class="progress" aria-hidden="true"><span style="width:${pct.toFixed(1)}%"></span></div>
      <p class="ga-budget-sub">${over ? `Se pasaron por ${esc(money(eur-BUDGET_EUR,'EUR'))}. No pasa nada: es su viaje.` : `Les quedan ${esc(money(BUDGET_EUR-eur,'EUR'))} del presupuesto de Europa.`}</p>
    </div>
    <div class="panel ga-cuentas"><p class="md-eyebrow-label muted">Cuentas claras</p><p class="ga-cuentas-txt">${cuentas}</p><p class="ga-budget-sub">Lo de "los dos" se divide a la mitad. Los pesos se convierten con el tipo de cambio de abajo.</p></div>
    ${byCat.length ? `<div class="panel ga-cats-sum"><p class="md-eyebrow-label muted">Por categoría</p>${byCat.map(x=>`<div class="ga-bar"><span class="ga-bar-l"><i data-lucide="${x.c.icon}"></i>${esc(x.c.n)}</span><span class="ga-bar-t"><span style="width:${(x.v/maxCat*100).toFixed(1)}%"></span></span><b>${esc(money(x.v,'EUR'))}</b></div>`).join('')}</div>` : ''}`;
  $('gaCsv').hidden = !gastos.length;
  const order = ['pre', ...DAYS.map(d=>d.id)];
  const days = order.filter(id=>gastos.some(g=>g.dia===id)).reverse();
  $('gaList').innerHTML = days.length ? days.map(id=>{
    const list = gastos.filter(g=>g.dia===id).sort((a,b)=>b.ts-a.ts);
    const sumE = list.filter(g=>g.moneda==='EUR').reduce((s,g)=>s+ +g.monto, 0), sumM = list.filter(g=>g.moneda==='MXN').reduce((s,g)=>s+ +g.monto, 0);
    const sums = [sumE ? money(sumE,'EUR') : '', sumM ? money(sumM,'MXN') : ''].filter(Boolean).join(' + ');
    return `<div class="ga-day"><div class="ga-day-head"><span class="md-eyebrow-label muted">${esc(dayLabel(id))}</span><b>${esc(sums)}</b></div>
      <ul class="ga-rows">${list.map(g=>{ const c = catOf(g.categoria);
        const para = g.para==='ambos' ? 'los dos' : g.para===user ? 'solo tú' : `solo ${NAMES[g.para]}`;
        return `<li><button type="button" class="ga-row" data-gasto="${esc(g.id)}"><span class="ga-ic"><i data-lucide="${c.icon}"></i></span><span class="ga-txt"><b>${esc(g.concepto)}</b><small>${g.pago===user ? 'Pagaste' : `Pagó ${NAMES[g.pago]}`} · ${esc(para)}</small></span><span class="ga-amt">${esc(money(+g.monto, g.moneda))}</span></button></li>`; }).join('')}</ul></div>`;
  }).join('') : `<div class="album-empty"><i data-lucide="wallet"></i><p>Aún no hay gastos. Agreguen el primero arriba: el café de la mañana también cuenta.</p></div>`;
  if (window.lucide) lucide.createIcons();
}

/* ---------- CSV para Excel o Numbers ---------- */
$('gaCsv').addEventListener('click', async ()=>{
  const q = v => `"${String(v).replace(/"/g,'""')}"`;
  const order = ['pre', ...DAYS.map(d=>d.id)];
  const rows = [...gastos].sort((a,b)=>order.indexOf(a.dia)-order.indexOf(b.dia) || a.ts-b.ts).map(g=>[
    g.dia==='pre' ? 'Antes del viaje' : `Día ${parseInt(dayById[g.dia].n)}`, g.dia==='pre' ? '' : dayById[g.dia].iso,
    g.concepto, catOf(g.categoria).n, (+g.monto).toFixed(2), g.moneda, NAMES[g.pago], g.para==='ambos' ? 'Los dos' : NAMES[g.para], toEur(g).toFixed(2)
  ]);
  const csv = '﻿' + [['Día','Fecha','Concepto','Categoría','Monto','Moneda','Pagó','Para','Equivalente EUR'], ...rows].map(r=>r.map(q).join(',')).join('\r\n');
  const file = new File([csv], 'gastos-viaje-oct-2026.csv', {type:'text/csv'});
  try { if (navigator.canShare && navigator.canShare({files:[file]})) { await navigator.share({files:[file], title:'Gastos del viaje'}); return; } }
  catch(e){ if (e && e.name==='AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
});

$('gaIntro').textContent = N ? `Lo que agregue cualquiera de los dos aparece al momento en el celular de ${NAMES[OTHER_ID]}.` : 'Se guarda en este celular.';
resetForm();
render();

if (N) {
  const fromRow = r => ({id:r.id, monto:+r.monto, moneda:r.moneda, concepto:r.concepto, categoria:r.categoria, dia:r.dia, pago:r.pago, para:r.para, who:r.who, ts:Date.parse(r.created_at)});
  N.listGastos().then(rows=>{ gastos = rows.map(fromRow); store.set(CKEY, gastos); render(); }).catch(e=>console.warn('gastos', e));
  window.addEventListener('nube:change', e=>{
    const {table, type, row} = e.detail; if (table!=='gastos' || !row) return;
    if (type==='DELETE') gastos = gastos.filter(g=>g.id!==row.id);
    else { const g = fromRow(row); gastos = gastos.some(x=>x.id===g.id) ? gastos.map(x=>x.id===g.id ? g : x) : [...gastos, g]; }
    store.set(CKEY, gastos); render();
    if (type==='INSERT' && row.who!==user) toast(`<b>${esc(NAMES[row.who])}</b> agregó un gasto<span>${esc(row.concepto)} · ${esc(money(+row.monto, row.moneda))}</span>`,
      [{label:'Ver', run:()=>window.ViajeTabs && ViajeTabs.go('#gastos')}]);
  });
}
});
