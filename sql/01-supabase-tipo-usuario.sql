-- 1) Secuencias para el código ascendente, una por cada tipo de usuario
create sequence if not exists public.seq_codigo_super_administrador;
create sequence if not exists public.seq_codigo_administrador;
create sequence if not exists public.seq_codigo_usuario_general;

-- 2) Nuevas columnas en la tabla usuarios
alter table public.usuarios
  add column if not exists tipo_usuario text not null default 'usuario_general'
    check (tipo_usuario in ('super_administrador','administrador','usuario_general')),
  add column if not exists codigo_usuario integer;

-- 3) Reemplazar la función conectar_usuario
--    Ahora recibe también el tipo de usuario y una bandera p_crear:
--      p_crear = true  -> comportamiento de "Crear usuario" (crea la cuenta si no existe)
--      p_crear = false -> comportamiento de "Conectarse" (NO crea cuentas nuevas;
--                          si el usuario no existe responde status = 'no_existe')
drop function if exists public.conectar_usuario(text, text);
drop function if exists public.conectar_usuario(text, text, text);

create or replace function public.conectar_usuario(
  p_usuario text,
  p_hash text,
  p_tipo_usuario text default 'usuario_general',
  p_crear boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existente record;
  v_codigo integer;
  v_tipo text;
begin
  select * into v_existente from public.usuarios where usuario = p_usuario;

  if v_existente is null then
    if not p_crear then
      return jsonb_build_object('status', 'no_existe');
    end if;

    v_tipo := case
      when p_tipo_usuario in ('super_administrador','administrador','usuario_general') then p_tipo_usuario
      else 'usuario_general'
    end;

    if v_tipo = 'super_administrador' then
      v_codigo := nextval('public.seq_codigo_super_administrador');
    elsif v_tipo = 'administrador' then
      v_codigo := nextval('public.seq_codigo_administrador');
    else
      v_codigo := nextval('public.seq_codigo_usuario_general');
    end if;

    insert into public.usuarios (usuario, hash_clave, tipo_usuario, codigo_usuario)
    values (p_usuario, p_hash, v_tipo, v_codigo);

    return jsonb_build_object('status', 'creado', 'tipo_usuario', v_tipo, 'codigo_usuario', v_codigo);
  else
    if v_existente.hash_clave = p_hash then
      return jsonb_build_object('status', 'ok', 'tipo_usuario', v_existente.tipo_usuario, 'codigo_usuario', v_existente.codigo_usuario);
    else
      return jsonb_build_object('status', 'error');
    end if;
  end if;
end;
$$;

grant execute on function public.conectar_usuario(text, text, text, boolean) to anon, authenticated;

-- 4) Si ya tenías usuarios creados antes de este cambio, asignarles código de "usuario_general"
do $$
declare
  r record;
begin
  for r in
    select usuario from public.usuarios
    where codigo_usuario is null
    order by coalesce(created_at, now()), usuario
  loop
    update public.usuarios
    set codigo_usuario = nextval('public.seq_codigo_usuario_general')
    where usuario = r.usuario;
  end loop;
end $$;
