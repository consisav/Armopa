-- Renombra "Préstamos CHN" a "Gestión de Préstamos Bancarios" en la tabla
-- "servicios" de Supabase (nombre, descripción y categoría), por si el
-- texto antiguo quedó guardado en cualquiera de esas columnas.
-- Ejecutar en: Supabase > SQL Editor (proyecto ARMOPA).

update public.servicios
set
  nombre = replace(nombre, 'Préstamos CHN', 'Gestión de Préstamos Bancarios'),
  descripcion = replace(descripcion, 'Préstamos CHN', 'Gestión de Préstamos Bancarios'),
  categoria = replace(categoria, 'Préstamos CHN', 'Gestión de Préstamos Bancarios')
where
  nombre ilike '%Préstamos CHN%'
  or descripcion ilike '%Préstamos CHN%'
  or categoria ilike '%Préstamos CHN%';

-- Verificación: debe devolver 0 filas después de ejecutar el UPDATE.
select id, nombre, descripcion, categoria
from public.servicios
where nombre ilike '%Préstamos CHN%'
   or descripcion ilike '%Préstamos CHN%'
   or categoria ilike '%Préstamos CHN%';
