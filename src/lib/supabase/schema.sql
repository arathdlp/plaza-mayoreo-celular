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

alter table public.clientes
  add column if not exists is_admin boolean not null default false;

comment on column public.clientes.is_admin is 'Acceso al panel /admin (RLS app_user_is_admin)';

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

-- Checkout: método de pago (ejecutar en proyectos ya creados)
alter table public.pedidos
  add column if not exists metodo_pago text default 'contra_entrega';

update public.pedidos set metodo_pago = 'contra_entrega' where metodo_pago is null;

alter table public.pedidos drop constraint if exists pedidos_metodo_pago_check;
alter table public.pedidos
  add constraint pedidos_metodo_pago_check check (
    metodo_pago in ('mercado_pago', 'contra_entrega')
  );

comment on column public.pedidos.metodo_pago is 'mercado_pago | contra_entrega';

-- Mercado Pago: estado del cobro y referencia al pago
alter table public.pedidos
  add column if not exists estado_pago text;

alter table public.pedidos
  add column if not exists mp_payment_id text;

alter table public.pedidos drop constraint if exists pedidos_estado_pago_check;
alter table public.pedidos
  add constraint pedidos_estado_pago_check check (
    estado_pago is null
    or estado_pago in ('pendiente', 'pagado', 'fallido')
  );

comment on column public.pedidos.estado_pago is 'pendiente | pagado | fallido (Mercado Pago)';
comment on column public.pedidos.mp_payment_id is 'ID del pago en Mercado Pago';

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
  tipo text not null default 'local',
  estado text not null default 'pendiente',
  lat_actual numeric(10, 7),
  lng_actual numeric(10, 7),
  destino_lat numeric(10, 7),
  destino_lng numeric(10, 7),
  direccion_destino text,
  repartidor_nombre text,
  repartidor_telefono text,
  paqueteria_empresa text,
  numero_guia text,
  repartidor_token uuid not null default gen_random_uuid(),
  tiempo_estimado_minutos integer,
  updated_at timestamptz not null default now(),
  constraint envios_tipo_check check (tipo in ('local', 'paqueteria')),
  constraint envios_estado_check check (estado in ('pendiente', 'en_camino', 'entregado'))
);

comment on table public.envios is 'Seguimiento de entrega por pedido';
comment on column public.envios.lat_actual is 'Latitud GPS actual del repartidor';
comment on column public.envios.lng_actual is 'Longitud GPS actual del repartidor';
comment on column public.envios.repartidor_token is 'Token en URL /repartidor/[id]?token=…';

create index if not exists envios_pedido_id_idx on public.envios (pedido_id);
create unique index if not exists envios_repartidor_token_idx on public.envios (repartidor_token);

-- Migración en proyectos existentes
alter table public.envios add column if not exists tipo text not null default 'local';
alter table public.envios add column if not exists destino_lat numeric(10, 7);
alter table public.envios add column if not exists destino_lng numeric(10, 7);
alter table public.envios add column if not exists direccion_destino text;
alter table public.envios add column if not exists repartidor_nombre text;
alter table public.envios add column if not exists repartidor_telefono text;
alter table public.envios add column if not exists paqueteria_empresa text;
alter table public.envios add column if not exists numero_guia text;
alter table public.envios add column if not exists repartidor_token uuid default gen_random_uuid();
alter table public.envios add column if not exists tiempo_estimado_minutos integer;

update public.envios set repartidor_token = gen_random_uuid() where repartidor_token is null;
alter table public.envios alter column repartidor_token set not null;

alter table public.envios drop constraint if exists envios_estado_check;
alter table public.envios
  add constraint envios_estado_check check (estado in ('pendiente', 'en_camino', 'entregado'));

alter table public.envios drop constraint if exists envios_tipo_check;
alter table public.envios
  add constraint envios_tipo_check check (tipo in ('local', 'paqueteria'));

-- Historial GPS (cada ~15 s desde app repartidor)
create table if not exists public.ubicaciones_envio (
  id bigint generated always as identity primary key,
  envio_id bigint not null references public.envios (id) on delete cascade,
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  created_at timestamptz not null default now()
);

comment on table public.ubicaciones_envio is 'Puntos GPS del repartidor por envío';

create index if not exists ubicaciones_envio_envio_id_idx on public.ubicaciones_envio (envio_id);
create index if not exists ubicaciones_envio_created_at_idx on public.ubicaciones_envio (envio_id, created_at desc);

alter table public.ubicaciones_envio enable row level security;

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

-- Admin: rol por fila en clientes.is_admin (usado en políticas RLS)
create or replace function public.app_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select c.is_admin from public.clientes c where c.id = auth.uid()),
    false
  );
$$;

comment on function public.app_user_is_admin() is 'true si auth.uid() tiene clientes.is_admin';

grant execute on function public.app_user_is_admin() to authenticated;

-- Productos: lectura pública de activos; admins ven/editan todo
drop policy if exists "productos_select_activos" on public.productos;
create policy "productos_select_activos"
  on public.productos
  for select
  to anon, authenticated
  using (activo = true or public.app_user_is_admin());

drop policy if exists "productos_admin_insert" on public.productos;
create policy "productos_admin_insert"
  on public.productos
  for insert
  to authenticated
  with check (public.app_user_is_admin());

drop policy if exists "productos_admin_update" on public.productos;
create policy "productos_admin_update"
  on public.productos
  for update
  to authenticated
  using (public.app_user_is_admin())
  with check (public.app_user_is_admin());

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

drop policy if exists "clientes_select_admin" on public.clientes;
create policy "clientes_select_admin"
  on public.clientes
  for select
  to authenticated
  using (public.app_user_is_admin());

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

drop policy if exists "pedidos_select_admin" on public.pedidos;
create policy "pedidos_select_admin"
  on public.pedidos
  for select
  to authenticated
  using (public.app_user_is_admin());

drop policy if exists "pedidos_update_admin" on public.pedidos;
create policy "pedidos_update_admin"
  on public.pedidos
  for update
  to authenticated
  using (public.app_user_is_admin())
  with check (public.app_user_is_admin());

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

drop policy if exists "pedido_items_select_admin" on public.pedido_items;
create policy "pedido_items_select_admin"
  on public.pedido_items
  for select
  to authenticated
  using (public.app_user_is_admin());

-- Envíos: lectura si el pedido es del usuario
drop policy if exists "envios_select_own" on public.envios;
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

drop policy if exists "envios_select_admin" on public.envios;
create policy "envios_select_admin"
  on public.envios
  for select
  to authenticated
  using (public.app_user_is_admin());

drop policy if exists "envios_insert_admin" on public.envios;
create policy "envios_insert_admin"
  on public.envios
  for insert
  to authenticated
  with check (public.app_user_is_admin());

drop policy if exists "envios_update_admin" on public.envios;
create policy "envios_update_admin"
  on public.envios
  for update
  to authenticated
  using (public.app_user_is_admin())
  with check (public.app_user_is_admin());

drop policy if exists "ubicaciones_select_own" on public.ubicaciones_envio;
create policy "ubicaciones_select_own"
  on public.ubicaciones_envio
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.envios e
      join public.pedidos p on p.id = e.pedido_id
      where e.id = envio_id
        and p.cliente_id = auth.uid()
    )
  );

drop policy if exists "ubicaciones_select_admin" on public.ubicaciones_envio;
create policy "ubicaciones_select_admin"
  on public.ubicaciones_envio
  for select
  to authenticated
  using (public.app_user_is_admin());

-- Realtime (Supabase Dashboard): habilitar replication en envios y ubicaciones_envio

-- ---------------------------------------------------------------------------
-- 6. solicitudes_servicio
-- ---------------------------------------------------------------------------
create table if not exists public.solicitudes_servicio (
  id bigint generated always as identity primary key,
  nombre text not null,
  telefono text not null,
  email text not null,
  tipo_servicio text not null,
  marca_equipo text,
  modelo_equipo text,
  descripcion text not null,
  estado text not null default 'nueva',
  created_at timestamptz not null default now(),
  constraint solicitudes_servicio_tipo_check check (
    tipo_servicio in ('reparacion', 'desbloqueo', 'instalacion', 'asesoria')
  ),
  constraint solicitudes_servicio_estado_check check (
    estado in ('nueva', 'en_proceso', 'resuelta', 'cancelada')
  )
);

comment on table public.solicitudes_servicio is 'Solicitudes de servicio técnico desde /servicios';

create index if not exists solicitudes_servicio_estado_idx on public.solicitudes_servicio (estado);
create index if not exists solicitudes_servicio_created_at_idx on public.solicitudes_servicio (created_at desc);

alter table public.solicitudes_servicio enable row level security;

drop policy if exists "solicitudes_insert_public" on public.solicitudes_servicio;
create policy "solicitudes_insert_public"
  on public.solicitudes_servicio
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "solicitudes_select_admin" on public.solicitudes_servicio;
create policy "solicitudes_select_admin"
  on public.solicitudes_servicio
  for select
  to authenticated
  using (public.app_user_is_admin());

drop policy if exists "solicitudes_update_admin" on public.solicitudes_servicio;
create policy "solicitudes_update_admin"
  on public.solicitudes_servicio
  for update
  to authenticated
  using (public.app_user_is_admin())
  with check (public.app_user_is_admin());

-- ---------------------------------------------------------------------------
-- 7. favoritos
-- ---------------------------------------------------------------------------
create table if not exists public.favoritos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  producto_id bigint not null references public.productos (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (cliente_id, producto_id)
);

comment on table public.favoritos is 'Productos guardados por cliente';

create index if not exists favoritos_cliente_id_idx on public.favoritos (cliente_id);
create index if not exists favoritos_producto_id_idx on public.favoritos (producto_id);

alter table public.favoritos enable row level security;

drop policy if exists "favoritos_select_own" on public.favoritos;
create policy "favoritos_select_own"
  on public.favoritos
  for select
  to authenticated
  using (auth.uid() = cliente_id);

drop policy if exists "favoritos_insert_own" on public.favoritos;
create policy "favoritos_insert_own"
  on public.favoritos
  for insert
  to authenticated
  with check (auth.uid() = cliente_id);

drop policy if exists "favoritos_delete_own" on public.favoritos;
create policy "favoritos_delete_own"
  on public.favoritos
  for delete
  to authenticated
  using (auth.uid() = cliente_id);

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
