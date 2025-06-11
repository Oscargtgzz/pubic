# FleetFox Backend API

Backend en PHP para la aplicación FleetFox de gestión de flotillas.

## Requisitos

- PHP 7.4 o superior
- MySQL 5.7 o superior
- Apache con mod_rewrite habilitado

## Instalación

1. **Configurar la base de datos:**
   ```bash
   # Crear la base de datos ejecutando el archivo schema.sql
   mysql -u root -p < database/schema.sql
   ```

2. **Configurar la conexión a la base de datos:**
   Editar `config/database.php` con tus credenciales:
   ```php
   private $host = 'localhost';
   private $db_name = 'fleetfox_db';
   private $username = 'tu_usuario';
   private $password = 'tu_password';
   ```

3. **Configurar el servidor web:**
   - Copiar todos los archivos a tu directorio web (ej: `/var/www/html/fleetfox-api/`)
   - Asegurar que mod_rewrite esté habilitado en Apache
   - El archivo `.htaccess` ya está configurado para las rutas de la API

## Estructura de la API

### Endpoints principales:

#### Vehículos
- `GET /api/vehicles` - Listar todos los vehículos
- `GET /api/vehicles/{id}` - Obtener un vehículo específico
- `POST /api/vehicles/create.php` - Crear nuevo vehículo
- `PUT /api/vehicles/update.php` - Actualizar vehículo
- `DELETE /api/vehicles/delete.php` - Eliminar vehículo

#### Mantenimiento
- `GET /api/maintenance` - Listar eventos de mantenimiento
- `GET /api/maintenance?vehicle_id={id}` - Filtrar por vehículo
- `POST /api/maintenance/create.php` - Crear evento de mantenimiento

#### Siniestros
- `GET /api/incidents` - Listar siniestros
- `GET /api/incidents?vehicle_id={id}` - Filtrar por vehículo
- `POST /api/incidents/create.php` - Crear siniestro
- `PUT /api/incidents/update.php` - Actualizar siniestro

#### Catálogos
- `GET /api/catalogs/brands` - Listar marcas
- `GET /api/catalogs/models` - Listar modelos
- `GET /api/catalogs/models?brand_id={id}` - Modelos por marca
- `GET /api/catalogs/service-types` - Tipos de servicio
- `GET /api/catalogs/workshops` - Talleres
- `POST /api/catalogs/brands/create.php` - Crear marca
- `POST /api/catalogs/models/create.php` - Crear modelo

#### Dashboard
- `GET /api/dashboard/stats` - Estadísticas del dashboard

## Configuración CORS

El backend está configurado para permitir requests desde `http://localhost:3000` (frontend Next.js).
Para cambiar esto, editar `config/cors.php`.

## Estructura de archivos

```
backend/
├── config/
│   ├── database.php      # Configuración de base de datos
│   └── cors.php          # Configuración CORS
├── models/
│   ├── Vehicle.php       # Modelo de vehículos
│   ├── MaintenanceEvent.php # Modelo de mantenimiento
│   ├── Incident.php      # Modelo de siniestros
│   └── Catalog.php       # Modelo de catálogos
├── api/
│   ├── vehicles/         # Endpoints de vehículos
│   ├── maintenance/      # Endpoints de mantenimiento
│   ├── incidents/        # Endpoints de siniestros
│   ├── catalogs/         # Endpoints de catálogos
│   └── dashboard/        # Endpoints del dashboard
├── database/
│   └── schema.sql        # Esquema de la base de datos
├── .htaccess            # Configuración de Apache
└── README.md
```

## Uso con el Frontend

El frontend Next.js debe configurarse para hacer requests a este backend.
Cambiar las URLs de localStorage por llamadas a la API REST.

Ejemplo de uso desde JavaScript:
```javascript
// Obtener vehículos
const response = await fetch('http://localhost/fleetfox-api/api/vehicles');
const data = await response.json();
const vehicles = data.records;

// Crear vehículo
const response = await fetch('http://localhost/fleetfox-api/api/vehicles/create.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(vehicleData)
});
```

## Seguridad

- Todos los datos de entrada son sanitizados
- Se usan prepared statements para prevenir SQL injection
- CORS configurado para el dominio del frontend

## Desarrollo

Para desarrollo local:
1. Usar XAMPP, WAMP o similar
2. Colocar los archivos en `htdocs/fleetfox-api/`
3. Acceder via `http://localhost/fleetfox-api/`