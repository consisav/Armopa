-- ============================================================
-- ARMOPA — Cotizaciones
-- Migracion: fecha y PDF de cotizacion general (bloque principal
-- "Solicitar cotizacion", separado de los adjuntos por servicio)
-- ============================================================

ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS fecha_cotizacion_general DATE;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS cotizacion_pdf_general VARCHAR(255);
