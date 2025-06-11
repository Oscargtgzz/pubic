# Guía de Integración Frontend - Backend

Esta guía explica cómo modificar el frontend Next.js para usar el backend PHP en lugar de localStorage.

## 1. Configuración del Frontend

### Crear servicio API
Crear `src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost/fleetfox-api/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Vehículos
  async getVehicles() {
    const data = await this.request('/vehicles');
    return data.records;
  }

  async getVehicle(id: string) {
    return this.request(`/vehicles/${id}`);
  }

  async createVehicle(vehicle: any) {
    return this.request('/vehicles/create.php', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  }

  async updateVehicle(vehicle: any) {
    return this.request('/vehicles/update.php', {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
  }

  // Mantenimiento
  async getMaintenanceEvents(vehicleId?: string) {
    const endpoint = vehicleId ? `/maintenance?vehicle_id=${vehicleId}` : '/maintenance';
    const data = await this.request(endpoint);
    return data.records;
  }

  async createMaintenanceEvent(event: any) {
    return this.request('/maintenance/create.php', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // Siniestros
  async getIncidents(vehicleId?: string) {
    const endpoint = vehicleId ? `/incidents?vehicle_id=${vehicleId}` : '/incidents';
    const data = await this.request(endpoint);
    return data.records;
  }

  async createIncident(incident: any) {
    return this.request('/incidents/create.php', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  async updateIncident(incident: any) {
    return this.request('/incidents/update.php', {
      method: 'PUT',
      body: JSON.stringify(incident),
    });
  }

  // Catálogos
  async getBrands() {
    const data = await this.request('/catalogs/brands');
    return data.records;
  }

  async getModels(brandId?: string) {
    const endpoint = brandId ? `/catalogs/models?brand_id=${brandId}` : '/catalogs/models';
    const data = await this.request(endpoint);
    return data.records;
  }

  async getServiceTypes() {
    const data = await this.request('/catalogs/service-types');
    return data.records;
  }

  async getWorkshops() {
    const data = await this.request('/catalogs/workshops');
    return data.records;
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }
}

export const apiService = new ApiService();
```

## 2. Modificar Páginas Existentes

### Ejemplo: Página de Flotilla (`src/app/(app)/fleet/page.tsx`)

Reemplazar las llamadas a localStorage:

```typescript
// ANTES (localStorage)
useEffect(() => {
  const storedVehiclesString = localStorage.getItem(VEHICLES_STORAGE_KEY);
  if (storedVehiclesString) {
    setVehicles(JSON.parse(storedVehiclesString));
  } else {
    setVehicles(mockVehicles);
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(mockVehicles));
  }
}, []);

// DESPUÉS (API)
useEffect(() => {
  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const vehicles = await apiService.getVehicles();
      setVehicles(vehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  loadVehicles();
}, []);
```

### Ejemplo: Crear Vehículo (`src/app/(app)/fleet/new/page.tsx`)

```typescript
// ANTES (localStorage)
function onSubmit(data: VehicleFormValues) {
  try {
    const newVehicle: Vehicle = {
      ...data,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };

    const storedVehiclesString = localStorage.getItem("vehicles");
    const vehicles: Vehicle[] = storedVehiclesString ? JSON.parse(storedVehiclesString) : [];
    vehicles.push(newVehicle);
    localStorage.setItem("vehicles", JSON.stringify(vehicles));

    toast({ title: "Vehículo Registrado" });
    router.push("/fleet");
  } catch (error) {
    toast({ title: "Error al Guardar", variant: "destructive" });
  }
}

// DESPUÉS (API)
async function onSubmit(data: VehicleFormValues) {
  try {
    setIsSubmitting(true);
    const newVehicle = {
      ...data,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };

    await apiService.createVehicle(newVehicle);
    
    toast({
      title: "Vehículo Registrado",
      description: `El vehículo ${newVehicle.brand} ${newVehicle.model} (${newVehicle.plate}) ha sido guardado.`,
    });
    router.push("/fleet");
  } catch (error) {
    console.error("Error saving vehicle:", error);
    toast({
      title: "Error al Guardar",
      description: "No se pudo guardar el vehículo. Intenta de nuevo.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
}
```

## 3. Hooks Personalizados

Crear hooks para simplificar el uso de la API:

### `src/hooks/use-vehicles.ts`
```typescript
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import type { Vehicle } from '@/lib/types';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return {
    vehicles,
    isLoading,
    error,
    refetch: loadVehicles,
  };
}
```

### `src/hooks/use-vehicle.ts`
```typescript
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import type { Vehicle } from '@/lib/types';

export function useVehicle(id: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getVehicle(id);
        setVehicle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading vehicle');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadVehicle();
    }
  }, [id]);

  return {
    vehicle,
    isLoading,
    error,
  };
}
```

## 4. Configuración de Variables de Entorno

Crear `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost/fleetfox-api/api
```

Actualizar `src/lib/api.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/fleetfox-api/api';
```

## 5. Manejo de Errores Global

Crear `src/lib/error-handler.ts`:
```typescript
import { toast } from '@/hooks/use-toast';

export function handleApiError(error: unknown, defaultMessage = 'Ha ocurrido un error') {
  console.error('API Error:', error);
  
  let message = defaultMessage;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
}
```

## 6. Pasos de Migración

1. **Instalar y configurar el backend PHP**
2. **Crear el servicio API** (`src/lib/api.ts`)
3. **Crear hooks personalizados** para cada entidad
4. **Migrar página por página**, empezando por:
   - Dashboard (`/dashboard`)
   - Lista de vehículos (`/fleet`)
   - Detalle de vehículo (`/fleet/[id]`)
   - Crear/editar vehículo
   - Mantenimiento
   - Siniestros
   - Catálogos
5. **Probar cada funcionalidad** después de la migración
6. **Eliminar código de localStorage** una vez confirmado que la API funciona

## 7. Consideraciones Adicionales

- **Autenticación**: Agregar tokens JWT si se requiere autenticación
- **Cache**: Implementar cache con React Query o SWR
- **Optimistic Updates**: Para mejor UX en operaciones CRUD
- **Paginación**: Para listas grandes de datos
- **Validación**: Mantener validación tanto en frontend como backend

Esta migración permitirá tener un sistema más robusto y escalable, separando claramente el frontend del backend.
```