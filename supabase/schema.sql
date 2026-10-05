-- Mytravel · base de datos compartida (Supabase)
-- Pega todo este archivo en Supabase → SQL Editor → New query → Run.
-- Se puede ejecutar más de una vez sin romper nada.

-- ---------- Perfiles: quién es cada usuario (moni / nando) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  who text not null check (who in ('moni','nando')),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_read on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
create policy profiles_read   on public.profiles for select to authenticated using (true);
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------- Paradas visitadas ----------
create table if not exists public.visits (
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  who text not null check (who in ('moni','nando')),
  day text not null,
  pin int not null,
  visited boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (owner, day, pin)
);
alter table public.visits enable row level security;
drop policy if exists visits_read on public.visits;
drop policy if exists visits_write on public.visits;
create policy visits_read  on public.visits for select to authenticated using (true);
create policy visits_write on public.visits for all    to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

-- ---------- Fotos (el archivo vive en Storage, aquí la ficha) ----------
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  who text not null check (who in ('moni','nando')),
  day text not null,
  pin int not null,
  path text not null,
  thumb_path text not null,
  created_at timestamptz not null default now()
);
-- Nota de la foto (pie de foto del diario); solo la edita quien tomó la foto.
alter table public.photos add column if not exists nota text;
alter table public.photos enable row level security;
drop policy if exists photos_read on public.photos;
drop policy if exists photos_write on public.photos;
create policy photos_read  on public.photos for select to authenticated using (true);
create policy photos_write on public.photos for all    to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

-- ---------- Cambios al itinerario (hora y nota por parada), compartidos ----------
create table if not exists public.edits (
  day text not null,
  item_t text not null,          -- hora original de la parada (identifica la parada)
  hora text,                     -- hora nueva (HH:MM) o null
  nota text,                     -- nota corta o null
  who text not null check (who in ('moni','nando')),
  updated_at timestamptz not null default now(),
  primary key (day, item_t)
);
alter table public.edits enable row level security;
drop policy if exists edits_read on public.edits;
drop policy if exists edits_write on public.edits;
create policy edits_read  on public.edits for select to authenticated using (true);
create policy edits_write on public.edits for all    to authenticated using (true) with check (true);

-- ---------- Checklist "Antes de viajar" (compartido) ----------
create table if not exists public.prechecks (
  item_id text primary key,       -- id fijo de js/itinerario.js o 'x-…' para cosas agregadas
  done boolean not null default false,
  label text,                     -- solo para cosas agregadas por ustedes
  custom boolean not null default false,
  who text not null check (who in ('moni','nando')),
  updated_at timestamptz not null default now()
);
alter table public.prechecks enable row level security;
drop policy if exists prechecks_read on public.prechecks;
drop policy if exists prechecks_write on public.prechecks;
create policy prechecks_read  on public.prechecks for select to authenticated using (true);
create policy prechecks_write on public.prechecks for all    to authenticated using (true) with check (true);

-- ---------- Diario: "Nuestro día", una nota por día que escriben los dos ----------
create table if not exists public.diario (
  day text primary key,
  texto text not null default '',
  who text not null check (who in ('moni','nando')),
  updated_at timestamptz not null default now()
);
alter table public.diario enable row level security;
drop policy if exists diario_read on public.diario;
drop policy if exists diario_write on public.diario;
create policy diario_read  on public.diario for select to authenticated using (true);
create policy diario_write on public.diario for all    to authenticated using (true) with check (true);

-- ---------- Avisos en vivo (Realtime) ----------
alter table public.visits replica identity full;
alter table public.photos replica identity full;
alter table public.edits  replica identity full;
alter table public.prechecks replica identity full;
alter table public.diario replica identity full;
do $$
begin
  begin alter publication supabase_realtime add table public.visits; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.photos; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.edits;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.prechecks; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.diario; exception when duplicate_object then null; end;
end $$;

-- ---------- Storage: bucket privado "fotos" ----------
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', false)
on conflict (id) do nothing;
drop policy if exists fotos_read on storage.objects;
drop policy if exists fotos_insert on storage.objects;
drop policy if exists fotos_delete on storage.objects;
-- Leer: cualquiera de los dos. Subir y borrar: solo dentro de su propia carpeta (<id de usuario>/...).
create policy fotos_read   on storage.objects for select to authenticated using (bucket_id = 'fotos');
create policy fotos_insert on storage.objects for insert to authenticated with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy fotos_delete on storage.objects for delete to authenticated using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

-- IMPORTANTE (no es SQL): en Authentication → Sign In / Providers → desactiva
-- "Allow new users to sign up", y crea los dos usuarios en Authentication → Users → Add user.
