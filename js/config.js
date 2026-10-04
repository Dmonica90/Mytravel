/* Conexión con Supabase. La URL y la clave "anon public" (o "Publishable key")
   están en Supabase → Project Settings → API. Esta clave es pública: la seguridad
   la ponen las reglas de supabase/schema.sql. NUNCA pongas aquí la "service_role".
   Mientras la clave sea el marcador, la app funciona en modo local (cada celular por su lado). */
window.VIAJE_CONFIG = {
  supabaseUrl: 'https://roletggfyygjuvgcxwqo.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbGV0Z2dmeXlnanV2Z2N4d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNTIyNjMsImV4cCI6MjEwNjcyODI2M30.jChUApaXP53FbAxcT3zRb1XvNSIGAA6CR7VQKZGp9iQ'
};
