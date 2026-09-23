-- ============================================================
-- ARMOPA — Precalificacion bancaria
-- Version corregida para PostgreSQL / Supabase
-- ============================================================

-- 1. Tabla principal de expedientes de clientes
CREATE TABLE expedientes_precalificacion (
    id_expediente SERIAL PRIMARY KEY,
    banco_preferencia VARCHAR(100) NOT NULL,
    monto_solicitado DECIMAL(12, 2) NOT NULL,

    -- Postgres no soporta ENUM(...) dentro de CREATE TABLE como MySQL;
    -- se usa TEXT + CHECK, que es mas simple de modificar despues
    -- (agregar un valor nuevo solo requiere cambiar este CHECK, no un ALTER TYPE)
    destino_credito TEXT NOT NULL
        CHECK (destino_credito IN ('Vivienda', 'Vehículo', 'Consumo Personal')),

    -- Datos de Identidad (DPI de 13 digitos y NIT guatemalteco)
    cui_dpi CHAR(13) NOT NULL UNIQUE,
    nit_sat VARCHAR(15) NOT NULL,

    -- Datos de Contacto
    telefono_celular VARCHAR(12) NOT NULL,
    correo_electronico VARCHAR(150) NOT NULL,

    -- Logica de negocio segmentada
    tipo_perfil TEXT NOT NULL
        CHECK (tipo_perfil IN ('asalariado', 'independiente')),

    -- Auditoria del sistema
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- En MySQL "ON UPDATE CURRENT_TIMESTAMP" actualiza esta columna sola;
    -- en Postgres eso no existe como opcion de columna, se hace con un trigger (ver mas abajo)
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),

    estado_evaluacion TEXT NOT NULL DEFAULT 'Pendiente'
        CHECK (estado_evaluacion IN ('Pendiente', 'En Revisión', 'Aprobado', 'Rechazado'))
);

-- 2. Tabla para el control y rutas de los archivos PDF adjuntos
CREATE TABLE documentos_expediente (
    id_documento SERIAL PRIMARY KEY,
    id_expediente INT NOT NULL,

    -- Nombre interno del requisito (ej: 'req-dpi', 'req-boletas', etc.)
    tipo_documento VARCHAR(50) NOT NULL,

    -- Ruta fisica en el servidor / storage (ej: '/storage/expedientes/2541874510101/req-dpi.pdf')
    ruta_archivo_pdf VARCHAR(255) NOT NULL,

    -- Metadata tecnica util para validaciones
    tamano_bytes INT NOT NULL,
    fecha_subida TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Llave foranea para amarrar los documentos al expediente del cliente
    CONSTRAINT fk_expediente
        FOREIGN KEY (id_expediente) REFERENCES expedientes_precalificacion(id_expediente)
        ON DELETE CASCADE,

    -- Evita que se duplique un mismo tipo de requisito para el mismo cliente
    -- (la sintaxis "UNIQUE KEY nombre (...)" es de MySQL; en Postgres es CONSTRAINT ... UNIQUE (...))
    CONSTRAINT unis_cliente_documento UNIQUE (id_expediente, tipo_documento)
);

-- ============================================================
-- Trigger: mantiene fecha_actualizacion al dia en cada UPDATE
-- (esto reemplaza el "ON UPDATE CURRENT_TIMESTAMP" que no existe en Postgres)
-- ============================================================
CREATE OR REPLACE FUNCTION set_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expedientes_fecha_actualizacion
BEFORE UPDATE ON expedientes_precalificacion
FOR EACH ROW
EXECUTE FUNCTION set_fecha_actualizacion();
