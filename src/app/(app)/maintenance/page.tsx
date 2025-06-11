
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wrench, CalendarDays, Filter, ListFilter, Loader2 } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from '@/lib/config';
import type { MaintenanceEvent, Vehicle } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { mockMaintenanceEvents, mockVehicles } from "@/lib/mock-data"; // Import mock data

const MAINTENANCE_EVENTS_STORAGE_KEY = "maintenance_events";
const VEHICLES_STORAGE_KEY = "vehicles";

export default function MaintenancePage() {
  const [allMaintenanceEvents, setAllMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [filteredMaintenanceEvents, setFilteredMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [vehicles, setVehicles] = useState<Pick<Vehicle, "id" | "plate" | "brand" | "model">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterVehicleId, setFilterVehicleId] = useState<string>("all");
  // const [filterStatus, setFilterStatus] = useState<string>("all"); // Placeholder for future status filtering

  useEffect(() => {
    document.title = `Mantenimiento | ${APP_NAME}`;
    setIsLoading(true);
    try {
      const storedEventsString = localStorage.getItem(MAINTENANCE_EVENTS_STORAGE_KEY);
      if (storedEventsString) {
        setAllMaintenanceEvents(JSON.parse(storedEventsString).sort((a: MaintenanceEvent, b: MaintenanceEvent) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        setAllMaintenanceEvents(mockMaintenanceEvents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        localStorage.setItem(MAINTENANCE_EVENTS_STORAGE_KEY, JSON.stringify(mockMaintenanceEvents));
      }

      const storedVehiclesString = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (storedVehiclesString) {
        const parsedVehicles: Vehicle[] = JSON.parse(storedVehiclesString);
        setVehicles(parsedVehicles.map(v => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })));
      } else {
         // If vehicles aren't in localStorage, use mockVehicles to populate selector, though ideally they should be there from fleet page
        setVehicles(mockVehicles.map(v => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })));
      }

    } catch (error) {
      console.error("Error loading maintenance events from localStorage:", error);
      setAllMaintenanceEvents(mockMaintenanceEvents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let events = [...allMaintenanceEvents];
    if (filterVehicleId !== "all") {
      events = events.filter(event => event.vehicleId === filterVehicleId);
    }
    setFilteredMaintenanceEvents(events);
  }, [allMaintenanceEvents, filterVehicleId]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Cargando eventos de mantenimiento...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Programación de Mantenimiento</h1>
          <p className="text-muted-foreground">Gestiona servicios y verificaciones de tu flotilla.</p>
        </div>
        <Button asChild>
          <Link href="/maintenance/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Mantenimiento
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Listado de Mantenimientos Registrados</CardTitle>
          <CardDescription>
            Visualiza todos los eventos de mantenimiento. Utiliza los filtros para refinar tu búsqueda.
          </CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Select value={filterVehicleId} onValueChange={setFilterVehicleId}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filtrar por vehículo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Vehículos</SelectItem>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMaintenanceEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredMaintenanceEvents.map(event => (
                <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg">
                                <Link href={`/fleet/${event.vehicleId}`} className="hover:underline text-primary">
                                    {event.vehiclePlate}
                                </Link> - {event.type}: {event.serviceType}
                            </CardTitle>
                            <CardDescription>
                                Fecha: {formatDate(event.date)} | Kilometraje: {event.mileage.toLocaleString()} km
                            </CardDescription>
                        </div>
                        {event.cost && <Badge variant="secondary" className="text-sm">${event.cost.toFixed(2)}</Badge>}
                    </div>
                  </CardHeader>
                  {(event.workshop || event.notes) && (
                    <CardContent>
                        {event.workshop && <p className="text-sm text-muted-foreground">Taller: {event.workshop}</p>}
                        {event.notes && <p className="text-sm text-muted-foreground mt-1">Notas: {event.notes}</p>}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No hay eventos de mantenimiento</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filterVehicleId === "all" ? "Registra un nuevo evento para comenzar o la aplicación se poblará con datos de ejemplo." : "No hay eventos para el vehículo seleccionado."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
