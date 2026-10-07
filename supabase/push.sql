-- Notificaciones push: tarea cada 5 minutos y avisos al instante de fotos y diario.
-- Córrelo en el SQL Editor DESPUÉS de crear la Edge Function "avisos" (ver README).
-- La URL y la clave pública (anon) son las mismas de js/config.js: no son secretas.
create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.viaje_llamar_avisos(payload jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://roletggfyygjuvgcxwqo.supabase.co/functions/v1/avisos',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbGV0Z2dmeXlnanV2Z2N4d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNTIyNjMsImV4cCI6MjEwNjcyODI2M30.jChUApaXP53FbAxcT3zRb1XvNSIGAA6CR7VQKZGp9iQ'),
    body := payload);
end $$;

-- Cada 5 minutos: mandar los avisos programados que ya tocan.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'viaje-avisos') then perform cron.unschedule('viaje-avisos'); end if;
end $$;
select cron.schedule('viaje-avisos', '*/5 * * * *', $$ select public.viaje_llamar_avisos('{"tipo":"cron"}'::jsonb) $$);

-- Al instante: foto nueva o diario escrito → aviso al otro (aunque tenga la app cerrada).
create or replace function public.viaje_evento_foto() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.viaje_llamar_avisos(jsonb_build_object('tipo', 'evento', 'tabla', 'photos', 'id', new.id));
  return new;
end $$;
drop trigger if exists viaje_push_foto on public.photos;
create trigger viaje_push_foto after insert on public.photos for each row execute function public.viaje_evento_foto();

create or replace function public.viaje_evento_diario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.texto, '') <> '' then
    perform public.viaje_llamar_avisos(jsonb_build_object('tipo', 'evento', 'tabla', 'diario', 'day', new.day || ':' || extract(epoch from new.updated_at)::bigint));
  end if;
  return new;
end $$;
drop trigger if exists viaje_push_diario on public.diario;
create trigger viaje_push_diario after insert or update on public.diario for each row execute function public.viaje_evento_diario();
