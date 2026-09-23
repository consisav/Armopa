-- ============================================================
-- ARMOPA — Precalificacion bancaria
-- Migracion: grado de escolaridad y profesion (Persona Individual)
-- Ejecutar DESPUES de precalificacion.sql y migracion_persona_juridica.sql
-- ============================================================

ALTER TABLE expedientes_precalificacion ADD COLUMN grado_escolaridad TEXT
  CHECK (grado_escolaridad IN (
    'Sin estudios', 'Primaria', 'Básicos', 'Diversificado',
    'Técnico', 'Universitario', 'Postgrado', 'Otro'
  ));

ALTER TABLE expedientes_precalificacion ADD COLUMN profesion VARCHAR(100);
