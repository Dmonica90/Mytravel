/* Conexión con Supabase. La URL y la clave "anon public" (o "Publishable key")
   están en Supabase → Project Settings → API. Esta clave es pública: la seguridad
   la ponen las reglas de supabase/schema.sql. NUNCA pongas aquí la "service_role".
   Mientras la clave sea el marcador, la app funciona en modo local (cada celular por su lado). */
window.VIAJE_CONFIG = {
  supabaseUrl: 'https://roletggfyygjuvgcxwqo.supabase.co',
  supabaseAnonKey: 'PEGA_AQUI_LA_ANON_KEY'
};
