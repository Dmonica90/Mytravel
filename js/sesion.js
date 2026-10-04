/* Entrada: quién eres (Moni o Nando) + clave compartida.
   El repositorio es público, así que esto es una puerta para curiosos y no seguridad
   real: el código guarda solo el hash SHA-256 de la clave, no la clave. */
(function(){
'use strict';
const HASH = 'a6d59a456d20bc5c92bd945e122470854f6ef98946e5f62673de21ccca79153a';
const KEY = 'viaje-user';
const $ = id => document.getElementById(id);
const valid = u => u==='moni' || u==='nando';
const get = () => { try { return localStorage.getItem(KEY); } catch(e){ return null; } };

async function sha256(text){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

function enter(user){
  document.body.classList.remove('locked');
  $('gate').hidden = true;
  window.ViajeStart(user);
}

const saved = get();
if (valid(saved)) { enter(saved); return; }

document.body.classList.add('locked');
$('gate').hidden = false;
const form = $('gateForm'), err = $('gateError');
form.addEventListener('submit', async e=>{
  e.preventDefault();
  const who = (form.querySelector('input[name="who"]:checked')||{}).value;
  const pass = $('gatePass').value;
  err.hidden = true;
  if (!valid(who)) { err.textContent = 'Elige quién eres: Moni o Nando.'; err.hidden = false; return; }
  let ok = false;
  try { ok = (await sha256(pass)) === HASH; }
  catch(x){ err.textContent = 'Este navegador no puede comprobar la contraseña. Ábrela desde la dirección https://.'; err.hidden = false; return; }
  if (!ok) { err.textContent = 'Contraseña incorrecta.'; err.hidden = false; $('gatePass').select(); return; }
  try { localStorage.setItem(KEY, who); } catch(x){}
  enter(who);
});
})();
