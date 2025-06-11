
-- Habilitar la extensión para UUIDs si se planea generar UUIDs desde la base de datos.
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------
-- Table `Users`
-- (Simulada, ya que la app actual no tiene un sistema de usuarios completo con roles y FKs en otras entidades)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  avatarUrl TEXT
  -- role VARCHAR(50) -- Podría añadirse si se desarrolla la gestión de roles
);

-- -----------------------------------------------------
-- Table `Brands` (Catálogo de Marcas)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Brands (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- -----------------------------------------------------
-- Table `Models` (Catálogo de Modelos, depende de Marca)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Models (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brandId UUID NOT NULL,
  CONSTRAINT fk_model_brand
    FOREIGN KEY (brandId)
    REFERENCES Brands (id)
    ON DELETE CASCADE,
  UNIQUE (name, brandId)
);

-- -----------------------------------------------------
-- Table `ServiceTypes` (Catálogo de Tipos de Servicio)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ServiceTypes (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- -----------------------------------------------------
-- Table `Workshops` (Catálogo de Talleres)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Workshops (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- -----------------------------------------------------
-- Table `Vehicles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Vehicles (
  id UUID PRIMARY KEY,
  plate VARCHAR(20) NOT NULL UNIQUE,
  brand VARCHAR(255) NOT NULL,         -- En la app actual, se guarda el nombre de la marca.
  model VARCHAR(255) NOT NULL,         -- En la app actual, se guarda el nombre del modelo.
  year INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Operativo', 'En Taller', 'Siniestrado', 'Baja')),
  currentMileage INTEGER NOT NULL,
  nextServiceDate DATE,
  nextServiceMileage INTEGER,
  nextVerificationDate DATE,
  photoUrl TEXT,
  serialNumber VARCHAR(100),
  engineNumber VARCHAR(100), -- Este campo no está en el tipo actual, pero es común. Se omite para alinear.
  color VARCHAR(50),
  insurancePolicy VARCHAR(100),
  insuranceExpiryDate DATE,
  circulationCard VARCHAR(100),
  notes TEXT,
  lastUpdated TIMESTAMP WITH TIME ZONE NOT NULL
  -- userId UUID, -- Si los vehículos estuvieran asignados a usuarios
  -- CONSTRAINT fk_vehicle_user
  --   FOREIGN KEY (userId)
  --   REFERENCES Users (id)
  --   ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON Vehicles (plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON Vehicles (status);

-- -----------------------------------------------------
-- Table `Vehicle_Documents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Vehicle_Documents (
  id UUID PRIMARY KEY,
  vehicleId UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR(100),
  size INTEGER,
  lastModified BIGINT, -- Timestamp Unix en milisegundos
  CONSTRAINT fk_vehicledoc_vehicle
    FOREIGN KEY (vehicleId)
    REFERENCES Vehicles (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vehicledoc_vehicleid ON Vehicle_Documents (vehicleId);

-- -----------------------------------------------------
-- Table `MaintenanceEvents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS MaintenanceEvents (
  id UUID PRIMARY KEY,
  vehicleId UUID NOT NULL,
  date DATE NOT NULL,
  mileage INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Servicio', 'Verificación')),
  serviceType VARCHAR(255) NOT NULL, -- En la app actual, se guarda el nombre del tipo de servicio.
  workshop VARCHAR(255),           -- En la app actual, se guarda el nombre del taller.
  cost DECIMAL(10, 2),
  notes TEXT,
  lastUpdated TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT fk_maintenance_vehicle
    FOREIGN KEY (vehicleId)
    REFERENCES Vehicles (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_maintenanceevents_vehicleid ON MaintenanceEvents (vehicleId);
CREATE INDEX IF NOT EXISTS idx_maintenanceevents_date ON MaintenanceEvents (date);

-- -----------------------------------------------------
-- Table `Maintenance_Documents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Maintenance_Documents (
  id UUID PRIMARY KEY,
  maintenanceEventId UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR(100),
  size INTEGER,
  lastModified BIGINT,
  CONSTRAINT fk_maintenancedoc_event
    FOREIGN KEY (maintenanceEventId)
    REFERENCES MaintenanceEvents (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_maintenancedoc_eventid ON Maintenance_Documents (maintenanceEventId);

-- -----------------------------------------------------
-- Table `Incidents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Incidents (
  id UUID PRIMARY KEY,
  vehicleId UUID NOT NULL,
  date DATE NOT NULL,
  time TIME,
  description TEXT NOT NULL,
  damageLevel VARCHAR(50) NOT NULL CHECK (damageLevel IN ('Leve', 'Moderado', 'Pérdida Total')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Abierto', 'En Evaluación', 'Esperando Refacciones', 'En Reparación', 'Reparado/Esperando Entrega', 'Cerrado')),
  location VARCHAR(255),
  thirdPartyName VARCHAR(255),
  thirdPartyVehiclePlate VARCHAR(20),
  thirdPartyInsurance VARCHAR(255),
  workshop VARCHAR(255),
  estimatedResolutionDate DATE,
  notes TEXT,
  lastUpdated TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT fk_incident_vehicle
    FOREIGN KEY (vehicleId)
    REFERENCES Vehicles (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incidents_vehicleid ON Incidents (vehicleId);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON Incidents (status);

-- -----------------------------------------------------
-- Table `Incident_Documents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Incident_Documents (
  id UUID PRIMARY KEY,
  incidentId UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR(100),
  size INTEGER,
  lastModified BIGINT,
  CONSTRAINT fk_incidentdoc_incident
    FOREIGN KEY (incidentId)
    REFERENCES Incidents (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incidentdoc_incidentid ON Incident_Documents (incidentId);

-- -----------------------------------------------------
-- Table `Incident_Photos` (Asumiendo estructura similar a documentos)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Incident_Photos (
  id UUID PRIMARY KEY,
  incidentId UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR(100),
  size INTEGER,
  CONSTRAINT fk_incidentphoto_incident
    FOREIGN KEY (incidentId)
    REFERENCES Incidents (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incidentphoto_incidentid ON Incident_Photos (incidentId);

-- -----------------------------------------------------
-- Table `MaintenanceRules`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS MaintenanceRules (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  vehicleType VARCHAR(100),
  mileageInterval INTEGER,
  timeIntervalMonths INTEGER,
  serviceTasks TEXT NOT NULL,
  lastUpdated TIMESTAMP WITH TIME ZONE NOT NULL
);

-- -----------------------------------------------------
-- Table `NotificationPreferences`
-- (Asumiendo que las preferencias son por usuario, necesitaría un userId)
-- Si es una configuración global, la tabla sería diferente.
-- Para este ejemplo, se omite el userId ya que la app no tiene un sistema de usuarios con FKs.
-- Si fuera por usuario:
-- CREATE TABLE IF NOT EXISTS NotificationPreferences (
--  userId UUID PRIMARY KEY,
--  ... (campos booleanos para cada preferencia) ...,
--  CONSTRAINT fk_notifpref_user
--    FOREIGN KEY (userId)
--    REFERENCES Users (id)
--    ON DELETE CASCADE
-- );
-- Como la app actual guarda un solo objeto en localStorage, esta tabla podría ser una sola fila
-- si las preferencias son globales, o no ser una tabla SQL y manejarse en la app.
-- Para este esquema, asumiré que es una configuración que la app maneja y no se almacena directamente
-- en una tabla relacional de la misma manera que en localStorage por ahora,
-- o se podría serializar un JSON en una tabla de configuración general.
-- -----------------------------------------------------


-- -----------------------------------------------------
-- Table `Notifications`
-- (Para persistir notificaciones generadas si se desea, no solo las de localStorage.
--  La app actual las maneja en localStorage)
-- -----------------------------------------------------
-- CREATE TABLE IF NOT EXISTS Notifications (
--   id UUID PRIMARY KEY,
--   userId UUID, -- A quién va dirigida
--   type VARCHAR(50) NOT NULL,
--   title VARCHAR(255) NOT NULL,
--   message TEXT NOT NULL,
--   date TIMESTAMP WITH TIME ZONE NOT NULL,
--   isRead BOOLEAN NOT NULL DEFAULT FALSE,
--   link TEXT,
--   severity VARCHAR(50) NOT NULL CHECK (severity IN ('Info', 'Warning', 'Critical')),
--   vehicleId UUID,
--   CONSTRAINT fk_notification_user
--     FOREIGN KEY (userId)
--     REFERENCES Users (id)
--     ON DELETE CASCADE,
--   CONSTRAINT fk_notification_vehicle
--     FOREIGN KEY (vehicleId)
--     REFERENCES Vehicles (id)
--     ON DELETE SET NULL
-- );
-- CREATE INDEX IF NOT EXISTS idx_notifications_userid ON Notifications (userId);
-- CREATE INDEX IF NOT EXISTS idx_notifications_isread ON Notifications (isRead);

-- Datos Iniciales para Catálogos (Ejemplo)
-- Estos se gestionarían desde la app, pero se pueden precargar.

-- INSERT INTO Brands (id, name) VALUES (uuid_generate_v4(), 'Ford');
-- INSERT INTO Brands (id, name) VALUES (uuid_generate_v4(), 'Chevrolet');
-- INSERT INTO Brands (id, name) VALUES (uuid_generate_v4(), 'Nissan');

-- INSERT INTO ServiceTypes (id, name) VALUES (uuid_generate_v4(), 'Cambio de Aceite');
-- INSERT INTO ServiceTypes (id, name) VALUES (uuid_generate_v4(), 'Servicio Menor');

-- INSERT INTO Workshops (id, name) VALUES (uuid_generate_v4(), 'Taller Central');
-- INSERT INTO Workshops (id, name) VALUES (uuid_generate_v4(), 'ServiFast Norte');

