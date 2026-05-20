-- Ejecutar en Supabase SQL Editor

-- Ticket email idempotencia
alter table public.pedidos add column if not exists ticket_enviado_at timestamptz;

-- Repartidores con cuenta
create table if not exists public.repartidores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null,
  email text unique not null,
  password_hash text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.repartidores enable row level security;

drop policy if exists "Admins manage repartidores" on public.repartidores;
create policy "Admins manage repartidores"
  on public.repartidores
  for all
  to authenticated
  using (public.app_user_is_admin())
  with check (public.app_user_is_admin());

alter table public.envios add column if not exists repartidor_id uuid references public.repartidores (id);

create index if not exists envios_repartidor_id_idx on public.envios (repartidor_id);

-- Estado llegando (si aún no está)
alter table public.envios drop constraint if exists envios_estado_check;
alter table public.envios
  add constraint envios_estado_check check (
    estado in ('pendiente', 'en_camino', 'llegando', 'entregado')
  );
