-- ============================================================
-- ARMOPA — Cotizaciones
-- Migracion: guardar TODOS los campos del bloque "Solicitar cotizacion"
-- directamente en la tabla cotizaciones (el registro maestro de cada
-- solicitud), no solo en las filas de solicitudes_servicio.
-- ============================================================

ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS nombre_cliente VARCHAR(150);
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS telefono_cliente VARCHAR(20);
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS correo_cliente VARCHAR(150);
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS fecha_servicio DATE;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS direccion_general VARCHAR(255);
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS presupuesto_asignado VARCHAR(50);
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS tipo_servicio_resumen TEXT;
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS enviada BOOLEAN NOT NULL DEFAULT false;
