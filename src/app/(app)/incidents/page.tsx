
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldAlert, Filter, Loader2, Edit } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from '@/lib/config';
import type { Incident, Vehicle, IncidentStatus } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { mockIncidents, mockVehicles } from "@/lib/mock-data"; // Import mock data
import { useToast } from "@/hooks/use-toast";

const INCIDENTS_STORAGE_KEY = "incidents";
const VEHICLES_STORAGE_KEY = "vehicles";

export default function IncidentsPage() {
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Pick<Vehicle, "id" | "plate" | "brand" | "model">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterVehicleId, setFilterVehicleId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all"); 
  const { toast } = useToast();

  const incidentStatusesForFilter: IncidentStatus[] = ["Abierto", "En Evaluación", "Esperando Refacciones", "En Reparación", "Reparado/Esperando Entrega", "Cerrado"];

  useEffect(() => {
    document.title = `Siniestros | ${APP_NAME}`;
    setIsLoading(true);
    try {
      const storedIncidentsString = localStorage.getItem(INCIDENTS_STORAGE_KEY);
      let loadedIncidents : Incident[];
      if (storedIncidentsString) {
        loadedIncidents = JSON.parse(storedIncidentsString);
      } else {
        loadedIncidents = mockIncidents;
        localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(mockIncidents));
      }
      setAllIncidents(loadedIncidents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));


      const storedVehiclesString = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (storedVehiclesString) {
        const parsedVehicles: Vehicle[] = JSON.parse(storedVehiclesString);
        setVehicles(parsedVehicles.map(v => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })));
      } else {
        setVehicles(mockVehicles.map(v => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })));
      }
    } catch (error) {
      console.error("Error loading incidents from localStorage:", error);
       setAllIncidents(mockIncidents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
       toast({ title: "Error al cargar datos", description: "Se usarán datos de ejemplo para siniestros.", variant: "destructive" });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    let incidentsToFilter = [...allIncidents];
    if (filterVehicleId !== "all") {
      incidentsToFilter = incidentsToFilter.filter(incident => incident.vehicleId === filterVehicleId);
    }
    if (filterStatus !== "all") {
      incidentsToFilter = incidentsToFilter.filter(incident => incident.status === filterStatus);
    }
    setFilteredIncidents(incidentsToFilter);
  }, [allIncidents, filterVehicleId, filterStatus]);

  const handleStatusChange = (incidentId: string, newStatus: IncidentStatus) => {
    setAllIncidents(prevIncidents => {
      const updatedIncidents = prevIncidents.map(inc =>
        inc.id === incidentId ? { ...inc, status: newStatus, lastUpdated: new Date().toISOString() } : inc
      );
      localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(updatedIncidents));
      toast({ title: "Estado Actualizado", description: `El estado del siniestro para ${updatedIncidents.find(i=>i.id === incidentId)?.vehiclePlate} es ahora "${newStatus}".` });
      return updatedIncidents;
    });
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00'); 
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Cargando siniestros...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Siniestros</h1>
          <p className="text-muted-foreground">Registra y da seguimiento a los incidentes de la flotilla.</p>
        </div>
        <Button asChild>
          <Link href="/incidents/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Nuevo Siniestro
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Listado de Siniestros</CardTitle>
          <CardDescription>
            Visualiza todos los siniestros reportados. Utiliza los filtros para refinar tu búsqueda.
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
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as string)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                {incidentStatusesForFilter.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIncidents.length > 0 ? (
            <div className="space-y-4">
              {filteredIncidents.map(incident => (
                <Card key={incident.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          <Link href={`/fleet/${incident.vehicleId}`} className="hover:underline text-primary">
                            {incident.vehiclePlate}
                          </Link> - {incident.description.substring(0, 50)}{incident.description.length > 50 ? "..." : ""}
                        </CardTitle>
                        <CardDescription>
                          Fecha: {formatDate(incident.date)} {incident.time && `a las ${incident.time}`}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge 
                            variant={incident.damageLevel === "Leve" ? "outline" : "default"}
                            className={
                                incident.damageLevel === "Pérdida Total" ? "bg-destructive text-destructive-foreground border-destructive" :
                                incident.damageLevel === "Moderado" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 border-yellow-300 dark:border-yellow-600" :
                                "border-border"
                            }
                        >
                            {incident.damageLevel}
                        </Badge>
                        <Select 
                          value={incident.status} 
                          onValueChange={(newStatus) => handleStatusChange(incident.id, newStatus as IncidentStatus)}
                        >
                          <SelectTrigger className="h-7 text-xs px-2 py-0.5 w-auto min-w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {incidentStatusesForFilter.map(statusVal => (
                              <SelectItem key={statusVal} value={statusVal} className="text-xs">
                                {statusVal}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  {(incident.location || incident.notes) && (
                    <CardContent className="pt-0 pb-2">
                      {incident.location && <p className="text-sm text-muted-foreground">Lugar: {incident.location}</p>}
                      {incident.notes && <p className="text-sm text-muted-foreground mt-1">Notas: {incident.notes}</p>}
                    </CardContent>
                  )}
                   <CardContent className="pt-0 pb-3 flex justify-between items-center">
                     <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto">
                        <Link href={`/fleet/${incident.vehicleId}`}>Ver Detalles del Vehículo</Link>
                    </Button>
                    {/* <Button variant="outline" size="xs" disabled> <Edit className="mr-1.5 h-3 w-3"/> Editar Siniestro </Button> */}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No hay siniestros registrados</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filterVehicleId === "all" && filterStatus === "all" ? "Registra un nuevo siniestro para comenzar o la aplicación se poblará con datos de ejemplo." : "No hay siniestros que coincidan con los filtros seleccionados."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

