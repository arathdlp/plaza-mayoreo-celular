-- Plaza Mayoreo del Celular — esquema de base de datos
-- Ejecutar en Supabase: SQL Editor → New query → Run
-- https://supabase.com/dashboard/project/_/sql

-- ---------------------------------------------------------------------------
-- Extensiones (gen_random_uuid ya está en pgcrypto en proyectos Supabase)
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tipos auxiliares (CHECK en columnas text)
-- ---------------------------------------------------------------------------
-- productos.categoria:
--   Pantalla | Bateria | Tapa Trasera | Placa de Carga | Accesorio | Celular
-- pedidos.estado:
--   pendiente | preparando | enviado | entregado

-- ---------------------------------------------------------------------------
-- 1. productos
-- ---------------------------------------------------------------------------
create table if not exists public.productos (
  id bigint generated always as identity primary key,
  nombre text not null,
  marca text not null,
  modelo text not null,
  categoria text not null,
  costo numeric(12, 2) not null check (costo >= 0),
  precio numeric(12, 2) not null check (precio >= 0),
  imagen_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  constraint productos_categoria_check check (
    categoria in (
      'Pantalla',
      'Bateria',
      'Tapa Trasera',
      'Placa de Carga',
      'Accesorio',
      'Celular'
    )
  )
);

comment on table public.productos is 'Catálogo de refacciones y equipos';
comment on column public.productos.costo is 'Costo de adquisición';
comment on column public.productos.precio is 'Precio de venta al público';

create index if not exists productos_categoria_idx on public.productos (categoria);
create index if not exists productos_activo_idx on public.productos (activo) where activo = true;

-- Campos opcionales para ficha de producto (ejecutar si la tabla ya existía)
alter table public.productos
  add column if not exists descripcion text,
  add column if not exists stock integer check (stock is null or stock >= 0);

comment on column public.productos.descripcion is 'Descripción larga para la página de detalle';
comment on column public.productos.stock is 'Unidades disponibles; null = no se controla stock';

-- ---------------------------------------------------------------------------
-- 2. clientes
-- id = auth.users.id al registrarse con Supabase Auth (recomendado)
-- ---------------------------------------------------------------------------
create table if not exists public.clientes (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  email text not null unique,
  telefono text not null,
  direccion text,
  created_at timestamptz not null default now()
);

comment on table public.clientes is 'Perfil de cliente vinculado a Supabase Auth';

create index if not exists clientes_email_idx on public.clientes (email);

-- ---------------------------------------------------------------------------
-- 3. pedidos
-- ---------------------------------------------------------------------------
create table if not exists public.pedidos (
  id bigint generated always as identity primary key,
  cliente_id uuid not null references public.clientes (id) on delete restrict,
  total numeric(12, 2) not null check (total >= 0),
  estado text not null default 'pendiente',
  direccion_entrega text not null,
  created_at timestamptz not null default now(),
  constraint pedidos_estado_check check (
    estado in ('pendiente', 'preparando', 'enviado', 'entregado')
  )
);

comment on table public.pedidos is 'Órdenes de compra';

create index if not exists pedidos_cliente_id_idx on public.pedidos (cliente_id);
create index if not exists pedidos_estado_idx on public.pedidos (estado);
create index if not exists pedidos_created_at_idx on public.pedidos (created_at desc);

-- ---------------------------------------------------------------------------
-- 4. pedido_items
-- ---------------------------------------------------------------------------
create table if not exists public.pedido_items (
  id bigint generated always as identity primary key,
  pedido_id bigint not null references public.pedidos (id) on delete cascade,
  producto_id bigint not null references public.productos (id) on delete restrict,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(12, 2) not null check (precio_unitario >= 0),
  constraint pedido_items_pedido_producto_unique unique (pedido_id, producto_id)
);

comment on table public.pedido_items is 'Líneas de cada pedido';

create index if not exists pedido_items_pedido_id_idx on public.pedido_items (pedido_id);
create index if not exists pedido_items_producto_id_idx on public.pedido_items (producto_id);

-- ---------------------------------------------------------------------------
-- 5. envios (tracking GPS)
-- ---------------------------------------------------------------------------
create table if not exists public.envios (
  id bigint generated always as identity primary key,
  pedido_id bigint not null unique references public.pedidos (id) on delete cascade,
  lat_actual numeric(10, 7),
  lng_actual numeric(10, 7),
  estado text not null default 'pendiente',
  updated_at timestamptz not null default now()
);

comment on table public.envios is 'Seguimiento de entrega por pedido';
comment on column public.envios.lat_actual is 'Latitud GPS actual';
comment on column public.envios.lng_actual is 'Longitud GPS actual';

create index if not exists envios_pedido_id_idx on public.envios (pedido_id);

-- Actualizar updated_at en cada cambio
create or replace function public.set_envios_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists envios_set_updated_at on public.envios;
create trigger envios_set_updated_at
  before update on public.envios
  for each row
  execute function public.set_envios_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS) — recomendado en Supabase
-- ---------------------------------------------------------------------------
alter table public.productos enable row level security;
alter table public.clientes enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;
alter table public.envios enable row level security;

-- Productos: lectura pública de activos; escritura solo service_role / admin (ajustar según roles)
create policy "productos_select_activos"
  on public.productos
  for select
  to anon, authenticated
  using (activo = true);

-- Clientes: cada usuario ve y edita solo su fila
create policy "clientes_select_own"
  on public.clientes
  for select
  to authenticated
  using (auth.uid() = id);

create policy "clientes_insert_own"
  on public.clientes
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "clientes_update_own"
  on public.clientes
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Pedidos: el cliente solo ve los suyos
create policy "pedidos_select_own"
  on public.pedidos
  for select
  to authenticated
  using (auth.uid() = cliente_id);

create policy "pedidos_insert_own"
  on public.pedidos
  for insert
  to authenticated
  with check (auth.uid() = cliente_id);

-- Items: visibles si el pedido pertenece al usuario
create policy "pedido_items_select_own"
  on public.pedido_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.pedidos p
      where p.id = pedido_id
        and p.cliente_id = auth.uid()
    )
  );

create policy "pedido_items_insert_own"
  on public.pedido_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.pedidos p
      where p.id = pedido_id
        and p.cliente_id = auth.uid()
    )
  );

-- Envíos: lectura si el pedido es del usuario
create policy "envios_select_own"
  on public.envios
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.pedidos p
      where p.id = pedido_id
        and p.cliente_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Trigger: crear fila en clientes al registrarse (opcional)
-- Usa metadata de signUp: full_name, phone
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user_cliente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.clientes (id, nombre, email, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update set
    nombre = excluded.nombre,
    email = excluded.email,
    telefono = excluded.telefono;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_cliente on auth.users;
create trigger on_auth_user_created_cliente
  after insert on auth.users
  for each row
  execute function public.handle_new_user_cliente();
