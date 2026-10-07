-- Funciones para el panel "Administrar usuarios" (solo visible para Super Administrador en el sitio).
-- Cada función vuelve a verificar, dentro de la base de datos, que quien la llama
-- es realmente un Super Administrador (usuario + hash de su propia clave), porque
-- el sitio no usa el sistema de sesiones de Supabase Auth.

-- 1) Buscar un usuario: devuelve su tipo de usuario y su código ascendente.
create or replace function public.admin_buscar_usuario(
  p_admin_usuario text,
  p_admin_hash text,
  p_usuario_buscar text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin record;
  v_obj record;
begin
  select * into v_admin from public.usuarios where usuario = p_admin_usuario;
  if v_admin is null or v_admin.hash_clave <> p_admin_hash or v_admin.tipo_usuario <> 'super_administrador' then
    return jsonb_build_object('status', 'no_autorizado');
  end if;

  select * into v_obj from public.usuarios where usuario = p_usuario_buscar;
  if v_obj is null then
    return jsonb_build_object('status', 'no_encontrado');
  end if;

  return jsonb_build_object('status', 'ok', 'usuario', v_obj.usuario, 'tipo_usuario', v_obj.tipo_usuario, 'codigo_usuario', v_obj.codigo_usuario);
end;
$$;

grant execute on function public.admin_buscar_usuario(text, text, text) to anon, authenticated;

-- 2) Actualizar la clave de cualquier otro usuario.
create or replace function public.admin_actualizar_clave(
  p_admin_usuario text,
  p_admin_hash text,
  p_usuario_objetivo text,
  p_nuevo_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin record;
  v_obj record;
begin
  select * into v_admin from public.usuarios where usuario = p_admin_usuario;
  if v_admin is null or v_admin.hash_clave <> p_admin_hash or v_admin.tipo_usuario <> 'super_administrador' then
    return jsonb_build_object('status', 'no_autorizado');
  end if;

  select * into v_obj from public.usuarios where usuario = p_usuario_objetivo;
  if v_obj is null then
    return jsonb_build_object('status', 'no_encontrado');
  end if;

  update public.usuarios set hash_clave = p_nuevo_hash where usuario = p_usuario_objetivo;
  return jsonb_build_object('status', 'ok');
end;
$$;

grant execute on function public.admin_actualizar_clave(text, text, text, text) to anon, authenticated;
