-- ============================================================
-- ARMOPA — Solicitudes de servicio (Especialistas para cada necesidad)
-- Registra cada solicitud enviada por un cliente desde el formulario
-- "Solicitar cotización", con el detalle de cada servicio marcado.
-- ============================================================

CREATE TABLE solicitudes_servicio (
    id SERIAL PRIMARY KEY,

    -- Datos de contacto del cliente (del formulario principal de cotización)
    nombre_cliente VARCHAR(150) NOT NULL,
    telefono_cliente VARCHAR(20) NOT NULL,
    correo_cliente VARCHAR(150),

    -- Datos propios de este servicio en particular
    servicio VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    necesidad TEXT,
    tiempo_estimado VARCHAR(100),
    fecha_inicio DATE,
    prioridad TEXT CHECK (prioridad IN ('alta', 'media', 'baja')),
    cotizacion_pdf VARCHAR(255),

    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_solicitudes_servicio_fecha ON solicitudes_servicio (fecha_creacion DESC);
