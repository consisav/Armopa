-- Función para que un Super Administrador pueda cambiar el tipo de otro usuario
-- desde el panel "Administrar usuarios" del sitio.

create or replace function public.admin_actualizar_tipo(
  p_admin_usuario text,
  p_admin_hash text,
  p_usuario_objetivo text,
  p_nuevo_tipo text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin record;
  v_obj record;
  v_tipo text;
begin
  select * into v_admin from public.usuarios where usuario = p_admin_usuario;
  if v_admin is null or v_admin.hash_clave <> p_admin_hash or v_admin.tipo_usuario <> 'super_administrador' then
    return jsonb_build_object('status', 'no_autorizado');
  end if;

  select * into v_obj from public.usuarios where usuario = p_usuario_objetivo;
  if v_obj is null then
    return jsonb_build_object('status', 'no_encontrado');
  end if;

  v_tipo := case
    when p_nuevo_tipo in ('super_administrador','administrador','usuario_general') then p_nuevo_tipo
    else v_obj.tipo_usuario
  end;

  update public.usuarios set tipo_usuario = v_tipo where usuario = p_usuario_objetivo;
  return jsonb_build_object('status', 'ok', 'tipo_usuario', v_tipo);
end;
$$;

grant execute on function public.admin_actualizar_tipo(text, text, text, text) to anon, authenticated;
