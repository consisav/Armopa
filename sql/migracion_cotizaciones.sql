-- ============================================================
-- ARMOPA — Numero de cotizacion correlativo
-- ============================================================

CREATE TABLE cotizaciones (
    id SERIAL PRIMARY KEY,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE solicitudes_servicio ADD COLUMN IF NOT EXISTS cotizacion_id INT REFERENCES cotizaciones(id);
