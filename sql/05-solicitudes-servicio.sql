-- ============================================================================
-- Solicitudes de servicio: tabla, contador de numeración y funciones RPC.
-- Visible/usable en el sitio solo para Administrador y Super administrador.
-- El sitio NO usa Supabase Auth: cada función vuelve a verificar, dentro de la
-- base de datos, que quien la llama es realmente un Administrador o Super
-- administrador (usuario + hash de su propia clave), igual que las funciones
-- "admin_*" ya existentes para "Administrar usuarios".
-- Ejecutar en: Supabase > SQL Editor (proyecto ARMOPA).
-- ============================================================================

-- 1) Tabla principal de solicitudes
create table if not exists public.solicitudes_servicio (
  id bigint generated always as identity primary key,
  numero_solicitud text not null unique,
  anio int not null,
  tipo_servicio_idx int not null,        -- 0..8, igual al orden de las 9 tarjetas del sitio
  tipo_servicio_codigo text not null,    -- ALQ, CAM, REN, MTO, PLE, JUR, PRE, MOV, ADM
  correlativo int not null,
  cliente_usuario text not null,
  cliente_codigo text not null,          -- = codigo_usuario del cliente en la tabla usuarios
  estado text not null default 'solicitado'
    check (estado in ('solicitado','presupuesto_enviado','aprobado','en_proceso','ejecutado','anulado')),
  creado_por text not null,              -- usuario del administrador que la creó
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists solicitudes_servicio_tipo_idx
  on public.solicitudes_servicio (tipo_servicio_idx);

-- 2) Contador atómico del correlativo, por año + tipo de servicio
create table if not exists public.solicitudes_contador (
  anio int not null,
  tipo_servicio_codigo text not null,
  ultimo int not null default 0,
  primary key (anio, tipo_servicio_codigo)
);

-- 3) Seguridad: sin acceso directo desde el navegador. Todo pasa por las
--    funciones de abajo, que verifican la clave del administrador.
alter table public.solicitudes_servicio enable row level security;
alter table public.solicitudes_contador enable row level security;

-- 4) Verifica que usuario + hash correspondan a un Administrador o Super administrador
create or replace function public._es_admin_valido(p_usuario text, p_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tipo text;
begin
  select tipo_usuario into v_tipo
  from public.usuarios
  where usuario = p_usuario and hash_clave = p_hash;
  return v_tipo in ('administrador', 'super_administrador');
end;
$$;

-- 5) Genera el siguiente número de solicitud para un tipo de servicio (atómico)
create or replace function public._siguiente_numero_solicitud(p_codigo text)
returns table(numero text, correlativo int, anio int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anio int := extract(year from now())::int;
  v_correlativo int;
begin
  insert into public.solicitudes_contador (anio, tipo_servicio_codigo, ultimo)
  values (v_anio, p_codigo, 1)
  on conflict (anio, tipo_servicio_codigo)
  do update set ultimo = public.solicitudes_contador.ultimo + 1
  returning ultimo into v_correlativo;

  return query select
    v_anio::text || '-' || p_codigo || '-' || lpad(v_correlativo::text, 4, '0'),
    v_correlativo,
    v_anio;
end;
$$;

-- 6) Buscar un cliente (usuario registrado) para enlazarlo a una solicitud.
--    Permitido para Administrador y Super administrador (a diferencia de
--    admin_buscar_usuario, que es exclusivo de Super administrador).
create or replace function public.buscar_cliente_solicitud(
  p_usuario text, p_hash text, p_cliente_usuario text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_obj record;
begin
  if not public._es_admin_valido(p_usuario, p_hash) then
    return jsonb_build_object('status', 'no_autorizado');
  end if;

  select * into v_obj from public.usuarios where usuario = p_cliente_usuario;
  if v_obj is null then
    return jsonb_build_object('status', 'no_encontrado');
  end if;

  return jsonb_build_object('status', 'ok', 'usuario', v_obj.usuario, 'codigo_usuario', v_obj.codigo_usuario);
end;
$$;

-- 7) Crear una solicitud de servicio
create or replace function public.crear_solicitud_servicio(
  p_usuario text, p_hash text,
  p_tipo_servicio_idx int, p_tipo_servicio_codigo text,
  p_cliente_usuario text,
  p_estado text default 'solicitado'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente_codigo text;
  v_num record;
  v_id bigint;
  v_estado text := coalesce(p_estado, 'solicitado');
begin
  if not public._es_admin_valido(p_usuario, p_hash) then
    return jsonb_build_object('status', 'no_autorizado');
  end if;

  select codigo_usuario into v_cliente_codigo
  from public.usuarios where usuario = p_cliente_usuario;

  if v_cliente_codigo is null then
    return jsonb_build_object('status', 'cliente_no_existe');
  end if;

  select * into v_num from public._siguiente_numero_solicitud(p_tipo_servicio_codigo);

  insert into public.solicitudes_servicio
    (numero_solicitud, anio, tipo_servicio_idx, tipo_servicio_codigo, correlativo,
     cliente_usuario, cliente_codigo, estado, creado_por)
  values
    (v_num.numero, v_num.anio, p_tipo_servicio_idx, p_tipo_servicio_codigo, v_num.correlativo,
     p_cliente_usuario, v_cliente_codigo, v_estado, p_usuario)
  returning id into v_id;

  return jsonb_build_object(
    'status', 'ok',
    'id', v_id,
    'numero_solicitud', v_num.numero,
    'cliente_usuario', p_cliente_usuario,
    'cliente_codigo', v_cliente_codigo,
    'estado', v_estado
  );
end;
$$;

-- 8) Listar las solicitudes de un tipo de servicio (0..8)
create or replace function public.listar_solicitudes_servicio(
  p_usuario text, p_hash text, p_tipo_servicio_idx int
)
returns setof public.solicitudes_servicio
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public._es_admin_valido(p_usuario, p_hash) then
    return;
  end if;
  return query
    select * from public.solicitudes_servicio
    where tipo_servicio_idx = p_tipo_servicio_idx
    order by created_at desc;
end;
$$;

-- 9) Modificar una solicitud (cliente y/o estado)
create or replace function public.actualizar_solicitud_servicio(
  p_usuario text, p_hash text, p_id bigint,
  p_cliente_usuario text, p_estado text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente_codigo text;
begin
  if not public._es_admin_valido(p_usuario, p_hash) then
    return jsonb_build_object('status', 'no_autorizado');
  end if;

  select codigo_usuario into v_cliente_codigo
  from public.usuarios where usuario = p_cliente_usuario;

  if v_cliente_codigo is null then
    return jsonb_build_object('status', 'cliente_no_existe');
  end if;

  update public.solicitudes_servicio
  set cliente_usuario = p_cliente_usuario,
      cliente_codigo = v_cliente_codigo,
      estado = p_estado,
      updated_at = now()
  where id = p_id;

  if not found then
    return jsonb_build_object('status', 'no_existe');
  end if;

  return jsonb_build_object('status', 'ok');
end;
$$;

-- 10) Eliminar una solicitud
create or replace function public.eliminar_solicitud_servicio(
  p_usuario text, p_hash text, p_id bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public._es_admin_valido(p_usuario, p_hash) then
    return jsonb_build_object('status', 'no_autorizado');
  end if;

  delete from public.solicitudes_servicio where id = p_id;

  if not found then
    return jsonb_build_object('status', 'no_existe');
  end if;

  return jsonb_build_object('status', 'ok');
end;
$$;

-- 11) Permisos: el sitio llama estas funciones como usuario anónimo de Supabase.
--     La protección real está dentro de cada función (_es_admin_valido), no aquí.
grant execute on function public.buscar_cliente_solicitud(text, text, text) to anon, authenticated;
grant execute on function public.crear_solicitud_servicio(text, text, int, text, text, text) to anon, authenticated;
grant execute on function public.listar_solicitudes_servicio(text, text, int) to anon, authenticated;
grant execute on function public.actualizar_solicitud_servicio(text, text, bigint, text, text) to anon, authenticated;
grant execute on function public.eliminar_solicitud_servicio(text, text, bigint) to anon, authenticated;

-- ============================================================================
-- Verificación rápida (opcional): no debe dar error.
-- select public._es_admin_valido('usuario_que_no_existe', 'x');
-- ============================================================================
