-- ============================================================
-- ARMOPA — Solicitudes de servicio
-- Migracion: agregar fecha de la cotizacion adjunta
-- Ejecutar DESPUES de solicitudes_servicio.sql
-- ============================================================

ALTER TABLE solicitudes_servicio ADD COLUMN IF NOT EXISTS fecha_cotizacion DATE;
