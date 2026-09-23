-- ============================================================
-- ARMOPA — Propiedades
-- Migracion: agregar columnas sector y zona a cada ubicacion
-- ============================================================

ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS sector VARCHAR(100);
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS zona VARCHAR(100);
