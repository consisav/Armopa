-- ============================================================
-- ARMOPA — Precalificacion bancaria
-- Migracion: soporte para Persona Individual y Persona Juridica (Empresa)
-- Ejecutar DESPUES de precalificacion.sql (agrega columnas, no reemplaza nada)
-- ============================================================

-- 1. Nueva columna para distinguir el tipo de solicitante
ALTER TABLE expedientes_precalificacion
  ADD COLUMN tipo_solicitante TEXT NOT NULL DEFAULT 'individual'
    CHECK (tipo_solicitante IN ('individual', 'juridica'));

-- 2. Columnas nuevas, exclusivas para Persona Juridica (quedan en NULL para Persona Individual)
ALTER TABLE expedientes_precalificacion ADD COLUMN razon_social VARCHAR(150);
ALTER TABLE expedientes_precalificacion ADD COLUMN nit_empresa VARCHAR(15);
ALTER TABLE expedientes_precalificacion ADD COLUMN rep_legal_nombre VARCHAR(150);
ALTER TABLE expedientes_precalificacion ADD COLUMN rep_legal_dpi CHAR(13);

-- 3. Las columnas de Persona Individual ya no son obligatorias
--    (para una Persona Juridica no aplican y se dejan en NULL)
ALTER TABLE expedientes_precalificacion ALTER COLUMN cui_dpi DROP NOT NULL;
ALTER TABLE expedientes_precalificacion ALTER COLUMN nit_sat DROP NOT NULL;
ALTER TABLE expedientes_precalificacion ALTER COLUMN tipo_perfil DROP NOT NULL;

-- 4. Ampliar los destinos de credito para incluir opciones tipicas de empresa
--    (el nombre de la restriccion puede variar; si este ALTER da error,
--    revisa el nombre real en Supabase: Table Editor > expedientes_precalificacion > Constraints)
ALTER TABLE expedientes_precalificacion
  DROP CONSTRAINT IF EXISTS expedientes_precalificacion_destino_credito_check;
ALTER TABLE expedientes_precalificacion
  ADD CONSTRAINT expedientes_precalificacion_destino_credito_check
  CHECK (destino_credito IN (
    'Vivienda', 'Vehículo', 'Consumo Personal',
    'Capital de trabajo', 'Compra de equipo', 'Expansión del negocio'
  ));

-- No se necesitan cambios en documentos_expediente: los tipos de documento
-- de Persona Juridica usan codigos distintos (ver lista en el sitio), asi que
-- conviven sin conflicto con los de Persona Individual en la misma tabla.
