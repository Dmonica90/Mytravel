/* Nube: envoltorio sobre Supabase (login, visitas, fotos, cambios al itinerario y avisos en vivo).
   Si no hay clave en js/config.js, Nube.enabled es false y la app sigue en modo local. */
(function(){
'use strict';
const cfg = window.VIAJE_CONFIG || {};
const enabled = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && !/PEGA_AQUI/.test(cfg.supabaseAnonKey) && window.supabase && window.supabase.createClient);
const N = window.Nube = {enabled};
if (!enabled) return;

const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {auth:{persistSession:true, autoRefreshToken:true}});
let uid = null, who = null;
const ok = r => { if (r && r.error) throw r.error; return r ? r.data : null; };

N.session = async () => {
  const s = ok(await sb.auth.getSession()).session;
  if (!s) return null;
  uid = s.user.id;
  const p = ok(await sb.from('profiles').select('who').eq('id', uid).maybeSingle());
  who = p && p.who;
  return {uid, who, email:s.user.email};
};
N.login = async (email, password, whoSel) => {
  const d = ok(await sb.auth.signInWithPassword({email, password}));
  uid = d.user.id;
  ok(await sb.from('profiles').upsert({id:uid, who:whoSel, updated_at:new Date().toISOString()}));
  who = whoSel;
  return {uid, who};
};
N.logout = async () => { try { await sb.auth.signOut(); } catch(e){} uid = who = null; };
N.me = () => ({uid, who});

/* Visitas */
N.listVisits = async () => ok(await sb.from('visits').select('*')) || [];
N.setVisit = async (day, pin, visited) => {
  ok(await sb.from('visits').upsert({owner:uid, who, day, pin, visited, updated_at:new Date().toISOString()}, {onConflict:'owner,day,pin'}));
};

/* Fotos */
N.listPhotos = async () => {
  const rows = ok(await sb.from('photos').select('*').order('created_at')) || [];
  if (!rows.length) return [];
  const paths = rows.flatMap(r => [r.path, r.thumb_path]);
  const urls = ok(await sb.storage.from('fotos').createSignedUrls(paths, 60*60*6)) || [];
  const m = Object.fromEntries(urls.map(u => [u.path, u.signedUrl]));
  return rows.map(r => ({...r, url:m[r.path], thumbUrl:m[r.thumb_path]}));
};
N.thumbUrl = async (path) => (ok(await sb.storage.from('fotos').createSignedUrls([path], 60*60)) || [])[0]?.signedUrl;
N.uploadPhoto = async ({day, pin, full, thumb, ts}) => {
  const base = `${uid}/${day}-${pin}-${ts}`;
  const st = sb.storage.from('fotos');
  ok(await st.upload(`${base}.jpg`, full, {contentType:'image/jpeg', upsert:true}));
  ok(await st.upload(`${base}-t.jpg`, thumb, {contentType:'image/jpeg', upsert:true}));
  ok(await sb.from('photos').insert({owner:uid, who, day, pin, path:`${base}.jpg`, thumb_path:`${base}-t.jpg`, created_at:new Date(ts).toISOString()}));
};
N.deletePhoto = async (row) => {
  ok(await sb.storage.from('fotos').remove([row.path, row.thumb_path]));
  ok(await sb.from('photos').delete().eq('id', row.id));
};

/* Cambios al itinerario */
N.listEdits = async () => ok(await sb.from('edits').select('*')) || [];
N.saveEdit = async (day, item_t, hora, nota) => {
  ok(await sb.from('edits').upsert({day, item_t, hora:hora||null, nota:nota||null, who, updated_at:new Date().toISOString()}, {onConflict:'day,item_t'}));
};
N.clearEdit = async (day, item_t) => { ok(await sb.from('edits').delete().eq('day', day).eq('item_t', item_t)); };

/* Avisos en vivo: cada cambio llega como evento "nube:change" con {table, type, row}. */
N.subscribe = () => {
  const emit = (table) => (p) => {
    const row = p.new && Object.keys(p.new).length ? p.new : p.old;
    window.dispatchEvent(new CustomEvent('nube:change', {detail:{table, type:p.eventType, row}}));
  };
  sb.channel('viaje')
    .on('postgres_changes', {event:'*', schema:'public', table:'visits'}, emit('visits'))
    .on('postgres_changes', {event:'*', schema:'public', table:'photos'}, emit('photos'))
    .on('postgres_changes', {event:'*', schema:'public', table:'edits'}, emit('edits'))
    .subscribe();
};
})();
