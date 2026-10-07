// Edge Function "avisos": manda las notificaciones push del viaje.
// Modos (body JSON):
//   {tipo:'cron'}                      → avisos programados que ya tocan (lo llama pg_cron cada 5 min)
//   {tipo:'evento', tabla, id|day}     → "Nando subió una foto" / "escribió en el diario" (lo llama un trigger)
//   {tipo:'prueba'}                    → notificación de prueba a quien la pide (con su sesión)
// Ningún modo acepta texto libre: los mensajes salen de la base de datos, así que nadie puede usar
// esta función para mandar spam. La clave secreta (service role) solo existe aquí dentro de Supabase.
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'mailto:viaje-oct-2026@example.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

const NAMES: Record<string, string> = { moni: 'Moni', nando: 'Nando' };
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

type Msg = { title: string; body: string; url: string; tag?: string };

/** Manda a todas las suscripciones de una persona ('ambos' = a los dos). Borra las caducadas. */
async function sendTo(who: string, msg: Msg) {
  let q = sb.from('push_subs').select('*');
  if (who !== 'ambos') q = q.eq('who', who);
  const { data: subs, error } = await q;
  if (error) throw error;
  let ok = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(msg), { TTL: 3600 });
      ok++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await sb.from('push_subs').delete().eq('endpoint', s.endpoint);
      else console.error('push', code, e);
    }
  }
  return ok;
}

async function cron() {
  const now = Date.now();
  const { data, error } = await sb.from('avisos').select('*').is('sent_at', null).lte('send_at', new Date(now).toISOString()).order('send_at').limit(50);
  if (error) throw error;
  let sent = 0, skipped = 0;
  for (const a of data ?? []) {
    // Si se quedó atrás más de 2 horas (p. ej. se configuró tarde), ya no tiene sentido mandarlo.
    const stale = now - Date.parse(a.send_at) > 2 * 3600e3;
    if (!stale) sent += await sendTo(a.who, { title: a.titulo, body: a.cuerpo, url: a.url || '#viaje', tag: a.id });
    else skipped++;
    await sb.from('avisos').update({ sent_at: new Date().toISOString() }).eq('id', a.id);
  }
  return { sent, skipped };
}

async function evento(tabla: string, key: string) {
  const id = `ev:${tabla}:${key}`;
  // Una sola vez por evento.
  const { error: dup } = await sb.from('avisos').insert({ id, send_at: new Date().toISOString(), who: 'ambos', titulo: '', cuerpo: '', url: '', sent_at: new Date().toISOString() });
  if (dup) return { duplicado: true };
  if (tabla === 'photos') {
    const { data: p } = await sb.from('photos').select('*').eq('id', key).maybeSingle();
    if (!p) return { sinFila: true };
    const otro = p.who === 'moni' ? 'nando' : 'moni';
    return { sent: await sendTo(otro, { title: `${NAMES[p.who]} subió una foto`, body: p.nota ? `“${p.nota}”` : 'Ábrela en el álbum del viaje.', url: '#album', tag: id }) };
  }
  if (tabla === 'diario') {
    // key = '<día>:<momento>' para avisar de nuevo si lo vuelven a editar más tarde.
    const { data: d } = await sb.from('diario').select('*').eq('day', key.split(':')[0]).maybeSingle();
    if (!d || !d.texto) return { sinFila: true };
    const otro = d.who === 'moni' ? 'nando' : 'moni';
    return { sent: await sendTo(otro, { title: `${NAMES[d.who]} escribió en el diario`, body: d.texto.slice(0, 160), url: `#jr-${d.day}`, tag: id }) };
  }
  return { tablaDesconocida: tabla };
}

async function prueba(req: Request) {
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: u } = await sb.auth.getUser(jwt);
  if (!u?.user) return json({ error: 'Inicia sesión en la app.' }, 401);
  const { data: prof } = await sb.from('profiles').select('who').eq('id', u.user.id).maybeSingle();
  if (!prof) return json({ error: 'Sin perfil.' }, 400);
  const sent = await sendTo(prof.who, { title: `¡Listo, ${NAMES[prof.who]}!`, body: 'Las notificaciones del viaje ya llegan a este celular.', url: '#ajustes', tag: 'prueba' });
  return json({ sent });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json().catch(() => ({}));
    if (body.tipo === 'cron') return json(await cron());
    if (body.tipo === 'evento') return json(await evento(String(body.tabla), String(body.id ?? body.day)));
    if (body.tipo === 'prueba') return await prueba(req);
    return json({ error: 'tipo desconocido' }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});
