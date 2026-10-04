/* Entrada a la app.
   - Con Supabase (js/config.js con clave): ¿Quién eres? + correo + contraseña de su usuario.
   - Sin Supabase (modo local): ¿Quién eres? + la clave compartida. El código solo guarda su
     hash SHA-256; como el repo es público, esto es una puerta para curiosos, no seguridad real. */
(function(){
'use strict';
const HASH = 'a6d59a456d20bc5c92bd945e122470854f6ef98946e5f62673de21ccca79153a';
const KEY = 'viaje-user';
const N = window.Nube && window.Nube.enabled ? window.Nube : null;
const $ = id => document.getElementById(id);
const valid = u => u==='moni' || u==='nando';
const get = () => { try { return localStorage.getItem(KEY); } catch(e){ return null; } };
const set = u => { try { localStorage.setItem(KEY, u); } catch(e){} };

async function sha256(text){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function enter(user){
  set(user);
  document.body.classList.remove('locked');
  $('gate').hidden = true;
  if (window.ViajeEdits) { try { await window.ViajeEdits.load(user); } catch(e){ console.error(e); } }
  window.ViajeStart(user);
}
function showGate(){
  document.body.classList.add('locked');
  $('gate').hidden = false;
  $('gateEmailWrap').hidden = !N;
  $('gateHint').textContent = N ? 'Entra con el correo y la contraseña de tu usuario.' : '';
}

const form = $('gateForm'), err = $('gateError');
const fail = msg => { err.textContent = msg; err.hidden = false; };

if (N) {
  N.session().then(s => { if (s && valid(s.who)) enter(s.who); else showGate(); }).catch(() => {
    /* Sin conexión pero con sesión previa en este celular: abrir con el usuario guardado. */
    const saved = get(); if (valid(saved)) enter(saved); else showGate();
  });
} else {
  const saved = get();
  if (valid(saved)) enter(saved); else showGate();
}

form.addEventListener('submit', async e=>{
  e.preventDefault();
  const who = (form.querySelector('input[name="who"]:checked')||{}).value;
  const pass = $('gatePass').value;
  err.hidden = true;
  if (!valid(who)) return fail('Elige quién eres: Moni o Nando.');
  const btn = form.querySelector('.gate-btn'); btn.disabled = true;
  try {
    if (N) {
      const email = $('gateEmail').value.trim();
      if (!email) return fail('Escribe tu correo.');
      try { await N.login(email, pass, who); }
      catch(x){ return fail(/invalid login|invalid_credentials/i.test(x && (x.message||x.code)||'') ? 'Correo o contraseña incorrectos.' : 'No se pudo entrar. Revisa tu conexión e inténtalo de nuevo.'); }
      return enter(who);
    }
    let ok = false;
    try { ok = (await sha256(pass)) === HASH; }
    catch(x){ return fail('Este navegador no puede comprobar la contraseña. Ábrela desde la dirección https://.'); }
    if (!ok) { $('gatePass').select(); return fail('Contraseña incorrecta.'); }
    enter(who);
  } finally { btn.disabled = false; }
});
})();
