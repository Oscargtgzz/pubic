-- Base de datos para FleetFox
CREATE DATABASE IF NOT EXISTS fleetfox_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fleetfox_db;

-- Tabla de marcas
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de modelos
CREATE TABLE IF NOT EXISTS models (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
    UNIQUE KEY unique_model_brand (name, brand_id)
);

-- Tabla de tipos de servicio
CREATE TABLE IF NOT EXISTS service_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de talleres
CREATE TABLE IF NOT EXISTS workshops (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    manager_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(36) PRIMARY KEY,
    plate VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    status ENUM('Operativo', 'En Taller', 'Siniestrado', 'Baja') NOT NULL,
    current_mileage INT NOT NULL,
    next_service_date DATE,
    next_service_mileage INT,
    next_verification_date DATE,
    photo_url TEXT,
    serial_number VARCHAR(100),
    engine_number VARCHAR(100),
    color VARCHAR(50),
    insurance_policy VARCHAR(100),
    insurance_expiry_date DATE,
    circulation_card VARCHAR(100),
    notes TEXT,
    acquisition_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_plate (plate),
    INDEX idx_status (status)
);

-- Tabla de eventos de mantenimiento
CREATE TABLE IF NOT EXISTS maintenance_events (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    vehicle_plate VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    mileage INT NOT NULL,
    type ENUM('Servicio', 'Verificación') NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    workshop VARCHAR(255),
    cost DECIMAL(10, 2),
    notes TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_date (date)
);

-- Tabla de siniestros
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    vehicle_plate VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    description TEXT NOT NULL,
    damage_level ENUM('Leve', 'Moderado', 'Pérdida Total') NOT NULL,
    status ENUM('Abierto', 'En Evaluación', 'Esperando Refacciones', 'En Reparación', 'Reparado/Esperando Entrega', 'Cerrado') NOT NULL,
    location VARCHAR(255),
    third_party_name VARCHAR(255),
    third_party_vehicle_plate VARCHAR(20),
    third_party_insurance VARCHAR(255),
    notes TEXT,
    workshop VARCHAR(255),
    estimated_resolution_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status)
);

-- Tabla de reglas de mantenimiento
CREATE TABLE IF NOT EXISTS maintenance_rules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    vehicle_type VARCHAR(100),
    assigned_vehicle_ids JSON,
    mileage_interval INT,
    time_interval_months INT,
    service_tasks TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (básica)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('Servicio', 'Verificación', 'Siniestro', 'General') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    severity ENUM('Info', 'Warning', 'Critical') NOT NULL,
    vehicle_id VARCHAR(36),
    vehicle_plate VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_is_read (is_read),
    INDEX idx_date (date)
);

-- Tabla de preferencias de notificación
CREATE TABLE IF NOT EXISTS notification_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    maintenance_upcoming BOOLEAN DEFAULT TRUE,
    maintenance_overdue BOOLEAN DEFAULT TRUE,
    verification_upcoming BOOLEAN DEFAULT TRUE,
    incident_new BOOLEAN DEFAULT TRUE,
    incident_status_update BOOLEAN DEFAULT TRUE,
    document_expiry BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar datos de ejemplo para marcas
INSERT INTO brands (id, name) VALUES 
('brand-1', 'Ford'),
('brand-2', 'Chevrolet'),
('brand-3', 'Nissan'),
('brand-4', 'Toyota'),
('brand-5', 'Volkswagen');

-- Insertar datos de ejemplo para modelos
INSERT INTO models (id, name, brand_id) VALUES 
('model-1', 'Ranger', 'brand-1'),
('model-2', 'Focus', 'brand-1'),
('model-3', 'Spark', 'brand-2'),
('model-4', 'Aveo', 'brand-2'),
('model-5', 'Versa', 'brand-3'),
('model-6', 'Sentra', 'brand-3'),
('model-7', 'Yaris', 'brand-4'),
('model-8', 'Corolla', 'brand-4'),
('model-9', 'Jetta', 'brand-5'),
('model-10', 'Polo', 'brand-5');

-- Insertar datos de ejemplo para tipos de servicio
INSERT INTO service_types (id, name) VALUES 
('service-1', 'Cambio de Aceite y Filtro'),
('service-2', 'Servicio Menor (10,000km)'),
('service-3', 'Servicio Mayor (30,000km)'),
('service-4', 'Revisión de Frenos'),
('service-5', 'Alineación y Balanceo'),
('service-6', 'Verificación Emisiones Semestral');

-- Insertar datos de ejemplo para talleres
INSERT INTO workshops (id, name, manager_name, address, city, state, phone, email) VALUES 
('workshop-1', 'Taller Central FleetFox', 'Juan Pérez', 'Av. Principal 123, Col. Centro', 'Ciudad de México', 'CDMX', '55-1234-5678', 'contacto@tallercentralff.com'),
('workshop-2', 'ServiAuto Express', 'Ana López', 'Calle Norte 45, Industrial Vallejo', 'Ciudad de México', 'CDMX', '55-9876-5432', 'servicios@serviautoexpress.com.mx'),
('workshop-3', 'Mecánica Especializada del Sur', 'Carlos Gómez', 'Insurgentes Sur 1020, Del Valle', 'Ciudad de México', 'CDMX', '55-5555-4444', 'citas@mecanicadelsur.mx');