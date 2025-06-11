
# Plan para Aterrizar Datos Inventados en localStorage

Este documento describe el plan para poblar la aplicación FleetFox con datos de ejemplo coherentes utilizando `localStorage`. El objetivo es tener una base de datos inicial rica para demostraciones al cliente.

## Estrategia General

1.  **Crear un Módulo de Datos Simulados (`src/lib/mock-data.ts`):**
    *   Este archivo centralizará todos los datos de ejemplo.
    *   Exportará constantes (arrays/objetos) para cada entidad principal de la aplicación.
    *   Los datos serán coherentes entre sí (IDs relacionados, fechas lógicas, etc.).

2.  **Modificar Páginas Existentes:**
    *   Cada página que actualmente lee datos de `localStorage` (ej. listados de vehículos, mantenimientos, siniestros, catálogos, perfil, notificaciones) será modificada.
    *   En su lógica de carga inicial (generalmente en un `useEffect`), se verificará si la clave respectiva en `localStorage` está vacía o no existe.
    *   Si está vacía, se utilizarán los datos correspondientes del módulo `src/lib/mock-data.ts` para:
        *   Inicializar el estado local de la página.
        *   Guardar estos datos iniciales en `localStorage` para que persistan en sesiones futuras.
    *   Esto asegura que la primera vez que un usuario (o el cliente) acceda a estas secciones, la aplicación se sienta poblada.

## Claves de `localStorage` y Datos a Generar

A continuación, se detallan las claves de `localStorage` y los datos de ejemplo que se generarán en `src/lib/mock-data.ts`:

1.  **`fleetfox_user_profile`**:
    *   **Cantidad**: 1 registro.
    *   **Estructura**: Objeto `User` (nombre, email, avatarUrl).

2.  **`fleetfox_notification_preferences`**:
    *   **Cantidad**: 1 registro.
    *   **Estructura**: Objeto `NotificationPreferences` con valores booleanos por defecto.

3.  **`fleetfox_catalog_brands`**:
    *   **Cantidad**: 5-7 marcas.
    *   **Estructura**: Array de `CatalogItem` (`id`, `name`).

4.  **`fleetfox_catalog_models`**:
    *   **Cantidad**: 3-5 modelos por cada marca generada.
    *   **Estructura**: Array de `ModelCatalogItem` (`id`, `name`, `brandId`). `brandId` debe corresponder a un ID de `fleetfox_catalog_brands`.

5.  **`fleetfox_catalog_service_types`**:
    *   **Cantidad**: 5-7 tipos de servicio.
    *   **Estructura**: Array de `CatalogItem` (`id`, `name`).

6.  **`fleetfox_catalog_workshops`**:
    *   **Cantidad**: 5-7 talleres.
    *   **Estructura**: Array de `CatalogItem` (`id`, `name`).

7.  **`vehicles`**:
    *   **Cantidad**: ~20 vehículos.
    *   **Estructura**: Array de `Vehicle`.
        *   Utilizar marcas y modelos de los catálogos generados.
        *   Variedad en `status`, `currentMileage`, `year`.
        *   Incluir algunos con `nextServiceDate`, `nextServiceMileage`, `nextVerificationDate`.
        *   `photoUrl` puede usar `placehold.co` o URLs de ejemplo.

8.  **`maintenance_events`**:
    *   **Cantidad**: ~25 eventos.
    *   **Estructura**: Array de `MaintenanceEvent`.
        *   `vehicleId` y `vehiclePlate` deben corresponder a vehículos existentes en `vehicles`.
        *   `serviceType` y `workshop` (si aplica) deben usar nombres de los catálogos generados.
        *   Fechas y kilometrajes coherentes con los datos del vehículo y la cronología.

9.  **`incidents`**:
    *   **Cantidad**: ~10 siniestros.
    *   **Estructura**: Array de `Incident`.
        *   `vehicleId` y `vehiclePlate` deben corresponder a vehículos existentes en `vehicles`.
        *   Variedad en `damageLevel` y `status`.
        *   Fechas coherentes.

10. **`fleetfox_maintenance_rules`**:
    *   **Cantidad**: 3-4 reglas.
    *   **Estructura**: Array de `MaintenanceRule`.
        *   Intervalos y tareas de ejemplo.

11. **`fleetfox_notifications`**:
    *   **Cantidad**: 10-15 notificaciones.
    *   **Estructura**: Array de `NotificationItem`.
        *   Variedad de tipos (`Servicio`, `Siniestro`, `General`).
        *   Algunas `isRead: true`, otras `isRead: false`.
        *   `vehicleId` y `vehiclePlate` (si aplica) deben corresponder a vehículos existentes.
        *   Fechas y mensajes relevantes.

## Consideraciones

*   **IDs**: Todos los IDs serán generados usando `crypto.randomUUID()` dentro de `src/lib/mock-data.ts`.
*   **Fechas**: Se usarán fechas relativas al día actual (ej. "hace X días", "en X días") o fechas fijas que mantengan la coherencia cronológica.
*   **Actualización del TODO.md principal**: Una vez completada la generación de datos y la modificación de las páginas, esta fase se marcará como completada en el `TODO.md` general del proyecto.

Este plan permitirá una inicialización automática de datos de ejemplo, mejorando significativamente la experiencia de la primera ejecución de la aplicación para demostraciones.
