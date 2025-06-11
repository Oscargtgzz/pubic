
# Lista de Tareas Pendientes para FleetFox (MVP con localStorage)

Esta lista de tareas nos guiará para completar un prototipo funcional de FleetFox utilizando `localStorage` para la persistencia de datos temporal. El objetivo es tener una demo interactiva para el cliente.

## I. Gestión Central de Vehículos (Flotilla) - `localStorage`

-   **Nuevo Vehículo (`/fleet/new`):**
    -   `[X]` Implementar manejo de formulario (`react-hook-form` y `zod`).
    -   `[X]` Implementar acción "Guardar Vehículo" (guardar en `localStorage`).
    -   `[ ]` Subida de archivo para foto del vehículo (actualmente URL de texto, mantener como URL para `localStorage` o explorar DataURL).
    -   `[ ]` Subida de archivos para documentos (similar a foto, mantener como URL/lista de URLs para `localStorage`).
    -   `[X]` Añadir validación al formulario.
    -   `[X]` Poblar opciones de selección (Marca) desde Catálogos en `localStorage`.
    -   `[X]` Integrar selección de Modelos (dependiente de Marca) en formulario.
-   **Editar Vehículo (`/fleet/[id]/edit`):**
    -   `[X]` Cargar datos del vehículo desde `localStorage`.
    -   `[X]` Implementar manejo de formulario (`react-hook-form` y `zod`).
    -   `[X]` Implementar acción "Actualizar Vehículo" (actualizar en `localStorage`).
    -   `[X]` Poblar opciones de selección (Marca) desde Catálogos en `localStorage`.
    -   `[X]` Integrar selección de Modelos (dependiente de Marca) en formulario.
-   **Listado de Vehículos (`/fleet`):**
    -   `[X]` Cargar vehículos desde `localStorage`.
    -   `[X]` Implementar tabla avanzada con:
        -   `[X]` Ordenamiento (básico, por columnas clickeables).
        -   `[X]` Filtrado (básico, por texto en campos principales).
        -   `[ ]` Paginación (si la lista es muy larga).
    -   `[X]` Asegurar que los enlaces "Ver Detalles" funcionen con datos de `localStorage`.
-   **Detalle del Vehículo (`/fleet/[id]`):**
    -   `[X]` Cargar y mostrar datos del vehículo desde `localStorage`.
    -   `[X]` Implementar funcionalidad del botón "Editar Datos Maestros" (lleva a `/fleet/[id]/edit`).
    -   `[X]` Implementar funcionalidad del botón "Actualizar Kilometraje" (modal o input para guardar nuevo kilometraje en `localStorage`).
    -   `[X]` Mostrar historial de mantenimiento real desde `localStorage`.
    -   `[X]` Mostrar historial de siniestros real desde `localStorage`.
    -   `[ ]` Mostrar documentos (si se implementa la opción de guardar URLs de documentos).

## II. Gestión de Mantenimiento - `localStorage`

-   **Nuevo Evento de Mantenimiento (`/maintenance/new`):**
    -   `[X]` Implementar manejo de formulario con `react-hook-form` y `zod`.
    -   `[ ]` Validar que la fecha del mantenimiento no sea anterior a la fecha de adquisición del vehículo (requiere añadir `acquisitionDate` a `Vehicle`).
    -   `[ ]` Validar que el kilometraje del mantenimiento sea mayor al último registrado para ese vehículo.
    -   `[X]` Implementar acción "Guardar Mantenimiento" (guardar en `localStorage`, asociado al `vehicleId`).
    -   `[X]` Poblar selección de vehículos desde `localStorage`.
    -   `[X]` Poblar selección de Tipos de Servicio desde Catálogos en `localStorage`.
    -   `[X]` Poblar selección de Talleres desde Catálogos en `localStorage`.
    -   `[ ]` (Opcional) Actualizar `nextServiceDate` y `nextServiceMileage` en el vehículo en `localStorage` si aplica, al registrar un mantenimiento.
-   **Listado/Calendario de Mantenimiento (`/maintenance`):**
    -   `[X]` Cargar y mostrar eventos de mantenimiento desde `localStorage`.
    -   `[X]` Implementar filtrado básico (por vehículo).
    -   `[ ]` Implementar filtrado avanzado (próximos, vencidos, completados).
    -   `[ ]` (Opcional) Vista de calendario.
-   **Pestaña de Mantenimiento en Detalle del Vehículo (`/fleet/[id]`):**
    -   `[X]` Asegurar que el botón "Registrar Mantenimiento" enlace a `/maintenance/new` pre-rellenado para el vehículo actual (ID y Placa en URL).
    -   `[X]` Mostrar lista de eventos de mantenimiento del vehículo desde `localStorage`.

## III. Gestión de Siniestros - `localStorage`

-   **Nuevo Siniestro (`/incidents/new`):**
    -   `[X]` Implementar manejo de formulario con `react-hook-form` y `zod`.
    -   `[X]` Implementar acción "Guardar Siniestro" (guardar en `localStorage`, asociado al `vehicleId`).
    -   `[X]` Poblar selección de vehículos desde `localStorage`.
-   **Listado de Siniestros (`/incidents`):**
    -   `[X]` Cargar y mostrar siniestros desde `localStorage`.
    -   `[X]` Implementar filtrado básico (por vehículo, estado).
    -   `[ ]` Permitir actualizar estado de cada siniestro desde la lista (ej. un dropdown para cambiar estado y guardar en `localStorage`).
-   **Pestaña de Siniestros en Detalle del Vehículo (`/fleet/[id]`):**
    -   `[X]` Asegurar que el botón "Registrar Siniestro" enlace a `/incidents/new` pre-rellenado para el vehículo actual (ID y Placa en URL).
    -   `[X]` Mostrar lista de siniestros del vehículo desde `localStorage`.

## IV. Integración de Herramientas de IA (POSTERGAR HASTA AUTORIZACIÓN)

-   **Mantenimiento Predictivo (Pestaña "Predicciones IA" en `/fleet/[id]`):**
    -   `[ ]` Activar el botón "Obtener Predicción IA".
    -   `[ ]` Al hacer clic, recopilar ID del vehículo e historial de mantenimiento (desde `localStorage`).
    -   `[ ]` Llamar al flow de Genkit `predictMaintenanceNeeds` con los datos recopilados.
    -   `[ ]` Mostrar la salida estructurada del flow.
    -   `[ ]` Manejar estados de carga y error.
-   **Priorizar Problemas de Mantenimiento (`/ai-tools/prioritize-issues`):**
    -   `[ ]` Activar el botón "Analizar y Priorizar".
    -   `[ ]` Implementar un `Textarea` para que los usuarios peguen datos históricos de mantenimiento (o simular carga desde `localStorage` de todos los vehículos).
    -   `[ ]` Al hacer clic, llamar al flow de Genkit `prioritizeMaintenanceIssues`.
    -   `[ ]` Mostrar la lista priorizada de problemas del flow.
    -   `[ ]` Manejar estados de carga y error.

## V. Dashboard (`/dashboard`)

-   `[X]` Calcular `kpiData` dinámicamente desde datos en `localStorage`.
-   `[X]` `activityFeedItems` dinámicos basados en datos recientes de `localStorage`.
-   `[X]` Mostrar recuentos básicos de estado de flotilla (Operativos, En Taller, Siniestrados) desde `localStorage`.

## VI. Alertas y Notificaciones - `localStorage`

-   **Página de Notificaciones (`/notifications`):**
    -   `[X]` Cargar notificaciones desde `localStorage` (o inicializar con mock si vacío).
    -   `[X]` "Marcar como leída" y persistir estado en `localStorage`.
    -   `[X]` Permitir eliminar notificaciones (actualizando `localStorage`).
    -   `[X]` Permitir "Marcar todas como leídas".
    -   `[X]` Permitir "Limpiar leídas".
-   **Configuración de Notificaciones (`/settings/notifications`):**
    -   `[X]` Guardar preferencias de notificación del usuario en `localStorage` (o inicializar con mock si vacío).

## VII. Autenticación de Usuarios y Perfil - `localStorage`

-   **Login (`/` - `LoginForm`):**
    -   `[X]` Simulación de login y redirección (no guarda sesión real, solo redirige).
-   **Perfil de Usuario (`/profile`):**
    -   `[X]` Cargar datos del usuario simulado desde `localStorage` (o inicializar con mock si vacío).
    -   `[X]` Implementar manejo de formulario para actualizar nombre, correo electrónico, URL de avatar y guardar en `localStorage`.
    -   `[ ]` (Opcional) Sincronizar avatar en `UserNav` con el del perfil (requiere recargar `UserNav` o un estado global/contexto).

## VIII. Configuración - `localStorage`

-   **Catálogos (`/settings/catalogs`):**
    -   `[X]` Cargar ítems de catálogo (Marcas, Tipos de Servicio, Talleres) desde/hacia `localStorage` (o inicializar con mock si vacío).
    -   `[X]` Implementar funcionalidad "Agregar" para estos catálogos.
    -   `[X]` Implementar funcionalidad "Editar" para estos catálogos.
    -   `[X]` Implementar funcionalidad "Eliminar" para estos catálogos.
    -   `[X]` Asegurar que los cambios en catálogos (Marcas, Tipos de Servicio, Talleres) se reflejen en `/fleet/new` y `/maintenance/new`.
    -   `[X]` Implementar gestión CRUD para Modelos (asociados a Marca, en página de catálogos, con `localStorage` o inicializar con mock si vacío).
    -   `[X]` Integrar selección de Modelos (dependiente de Marca) en formularios `/fleet/new` y `/fleet/[id]/edit`.
-   **Reglas de Mantenimiento (`/settings/maintenance-rules`):**
    -   `[X]` Implementar manejo de formulario para "Crear Nueva Regla".
    -   `[X]` Guardar regla en `localStorage` (o inicializar con mock si vacío).
    -   `[X]` Mostrar listado de reglas existentes desde `localStorage`.
    -   `[X]` Implementar funcionalidad "Editar" y "Eliminar" para reglas.
-   **Apariencia (`/settings/appearance`):**
    -   `[ ]` Guardar preferencia de tema (Claro/Oscuro/Sistema) en `localStorage` y aplicarlo realmente (ej. con `next-themes` o lógica manual para `<html>`).

## IX. UI/UX General y Calidad

-   `[X]` **Formularios:** Asegurar que los formularios principales interactúen con `localStorage` usando `react-hook-form` y `zod`.
-   `[X]` **Manejo de Errores:** Uso consistente de `Toaster` para feedback.
-   `[X]` **Estados de Carga:** Implementar indicadores de carga para operaciones con `localStorage` (en su mayoría hecho).
-   `[X]` **Estados Vacíos:** Proveer mensajes de estado vacío significativos (en su mayoría hecho, mejorado con inicialización de mock data).
-   `[ ]` **Imágenes/Documentos (MVP `localStorage`):** Para la demo, si no se implementa DataURL, asegurar que los campos de URL permitan al usuario pegar enlaces y estos se muestren. La subida real es para la fase de BD. Los campos de `documents` en los tipos están preparados para URLs.
-   `[ ]` **Refactorización:** Revisar lógica de acceso a `localStorage` para consistencia, considerar hooks personalizados si es necesario para reducir duplicación.

## X. Estructuras de Datos en `localStorage`

-   `[X]` Definir claves claras para `localStorage`.
-   `[X]` Asegurar consistencia en cómo se asocian los datos (ej. `vehicleId` en eventos, `brandId` en modelos).
-   `[X]` Implementar inicialización de datos de ejemplo desde `src/lib/mock-data.ts` si `localStorage` está vacío para las claves principales.

---
**Leyenda:**
- `[X]` Completado
- `[ ]` Pendiente
- ` - [ ] ` Tarea específica pendiente dentro de un punto más grande.
---
Actualizado para reflejar el progreso y los pendientes de la fase MVP con localStorage.
Las herramientas de IA se posponen hasta nueva indicación.
Foco en completar interacciones de frontend con `localStorage`.
Próximos pasos: Paginación en tabla de vehículos, Validaciones avanzadas, Tema (Apariencia), Manejo de URLs de documentos/fotos.
