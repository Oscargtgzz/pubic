
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Import useParams
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit3, Info, Wrench, ShieldAlert, FileText, CalendarClock, Gauge, PlusCircle, Brain, Loader2, Save, XCircle, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from '@/lib/config';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Vehicle, MaintenanceEvent, Incident } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VehicleDetailPage() {
  const routeParams = useParams<{ id: string }>(); // Use the hook
  const vehicleIdFromRoute = routeParams.id; // Get the id

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceEvent[]>([]);
  const [incidentHistory, setIncidentHistory] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isEditingMileage, setIsEditingMileage] = useState(false);
  const [newMileageValue, setNewMileageValue] = useState<string | number>("");

  useEffect(() => {
    setIsLoading(true); // Start loading
    if (vehicleIdFromRoute) {
      try {
        const storedVehiclesString = localStorage.getItem("vehicles");
        if (storedVehiclesString) {
          const vehicles: Vehicle[] = JSON.parse(storedVehiclesString);
          const foundVehicle = vehicles.find(v => v.id === vehicleIdFromRoute);
          setVehicle(foundVehicle || null);
          if (foundVehicle) {
            document.title = `Vehículo ${foundVehicle.plate} | ${APP_NAME}`;
            setNewMileageValue(foundVehicle.currentMileage);

            const storedMaintenanceEventsString = localStorage.getItem("maintenance_events");
            if (storedMaintenanceEventsString) {
              const allMaintenanceEvents: MaintenanceEvent[] = JSON.parse(storedMaintenanceEventsString);
              const vehicleMaintenance = allMaintenanceEvents.filter(event => event.vehicleId === foundVehicle.id);
              setMaintenanceHistory(vehicleMaintenance);
            }

            const storedIncidentsString = localStorage.getItem("incidents");
            if (storedIncidentsString) {
                const allIncidents: Incident[] = JSON.parse(storedIncidentsString);
                const vehicleIncidents = allIncidents.filter(incident => incident.vehicleId === foundVehicle.id);
                setIncidentHistory(vehicleIncidents);
            }
          } else {
            document.title = `Vehículo no encontrado | ${APP_NAME}`;
          }
        } else {
           document.title = `Vehículo no encontrado | ${APP_NAME}`;
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        setVehicle(null);
        toast({ title: "Error", description: "No se pudieron cargar los datos del vehículo.", variant: "destructive" });
      }
    }
    setIsLoading(false); // Finish loading
  }, [vehicleIdFromRoute, toast]); // Added toast to dependency array as it's used inside

  const handleUpdateMileage = () => {
    if (!vehicle) return;

    const mileage = parseFloat(String(newMileageValue));
    if (isNaN(mileage) || mileage < 0) {
      toast({ title: "Error", description: "El kilometraje debe ser un número positivo.", variant: "destructive" });
      return;
    }
    if (mileage < vehicle.currentMileage) {
      toast({ title: "Advertencia", description: "El nuevo kilometraje no puede ser menor al actual.", variant: "destructive" });
      return;
    }

    try {
      const storedVehiclesString = localStorage.getItem("vehicles");
      let vehicles: Vehicle[] = storedVehiclesString ? JSON.parse(storedVehiclesString) : [];
      const updatedVehicles = vehicles.map(v =>
        v.id === vehicle.id ? { ...v, currentMileage: mileage, lastUpdated: new Date().toISOString() } : v
      );
      localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));

      setVehicle(prev => prev ? { ...prev, currentMileage: mileage, lastUpdated: new Date().toISOString() } : null);
      setIsEditingMileage(false);
      toast({ title: "Kilometraje Actualizado", description: `Nuevo kilometraje: ${mileage.toLocaleString()} km.` });
    } catch (error) {
      console.error("Error updating mileage:", error);
      toast({ title: "Error", description: "No se pudo actualizar el kilometraje.", variant: "destructive" });
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-2xl font-semibold mt-2">Cargando datos del vehículo...</h1>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-semibold">Vehículo no encontrado</h1>
        <p className="text-muted-foreground">El vehículo con ID "{vehicleIdFromRoute}" no existe en el almacenamiento local o no se pudo cargar.</p>
        <Button asChild className="mt-4">
          <Link href="/fleet">Volver a Flotilla</Link>
        </Button>
      </div>
    );
  }

  const InfoItem = ({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: React.ComponentType<{className?: string}> }) => (
    <div className="flex flex-col">
      <dt className="text-sm font-medium text-muted-foreground flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-2 text-primary" />}
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2">{value || "N/A"}</dd>
    </div>
  );

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  };


  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/fleet">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {vehicle.brand} {vehicle.model} <span className="text-primary">({vehicle.plate})</span>
          </h1>
          <p className="text-muted-foreground">Expediente completo del vehículo.</p>
        </div>
        <Button size="sm" variant="outline" className="ml-auto" asChild>
          <Link href={`/fleet/${vehicle.id}/edit`}>
            <Edit3 className="mr-2 h-4 w-4" /> Editar Datos Maestros
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <Image
                src={vehicle.photoUrl || "https://placehold.co/600x400.png"}
                alt={`Foto de ${vehicle.brand} ${vehicle.model}`}
                width={600} height={400}
                className="rounded-t-lg object-cover w-full h-auto aspect-[3/2]"
                data-ai-hint={`${vehicle.brand} ${vehicle.model}`}
                priority={true}
                unoptimized={!vehicle.photoUrl || vehicle.photoUrl.startsWith('https://placehold.co')}
              />
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">{vehicle.brand} {vehicle.model} {vehicle.year}</h2>
                    <Badge
                      className={
                        vehicle.status === "Operativo" ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100 border-green-300 dark:border-green-600" :
                        vehicle.status === "En Taller" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 border-yellow-300 dark:border-yellow-600" :
                        vehicle.status === "Siniestrado" ? "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100 border-red-300 dark:border-red-600" :
                        "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                      }
                      variant="outline"
                    >
                        {vehicle.status}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Placa: <strong>{vehicle.plate}</strong></p>
                 <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <Gauge className="w-4 h-4 mr-2 text-primary"/> Kilometraje Actual: <strong>{vehicle.currentMileage?.toLocaleString()} km</strong>
                </p>
                {isEditingMileage ? (
                  <div className="mt-3 space-y-2">
                    <Input
                      type="number"
                      value={newMileageValue}
                      onChange={(e) => setNewMileageValue(e.target.value)}
                      placeholder="Nuevo kilometraje"
                      className="h-9"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateMileage} size="sm" className="flex-1">
                        <Save className="mr-2 h-4 w-4" /> Guardar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsEditingMileage(false)} className="flex-1">
                        <XCircle className="mr-2 h-4 w-4" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => { setIsEditingMileage(true); setNewMileageValue(vehicle.currentMileage); }}>
                    Actualizar Kilometraje
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>Información General</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <InfoItem label="No. de Serie (VIN)" value={vehicle.serialNumber} />
                <InfoItem label="No. de Motor" value={vehicle.engineNumber} />
                <InfoItem label="Color" value={vehicle.color} />
                <InfoItem label="Póliza de Seguro" value={vehicle.insurancePolicy} />
                <InfoItem label="Vencimiento Seguro" value={formatDate(vehicle.insuranceExpiryDate)} />
                <InfoItem label="Tarjeta de Circulación" value={vehicle.circulationCard} />
                <InfoItem label="Fecha de Adquisición" value={formatDate(vehicle.acquisitionDate)} icon={CalendarClock} />
                <InfoItem label="Próximo Servicio" value={vehicle.nextServiceDate ? `${formatDate(vehicle.nextServiceDate)} / ${vehicle.nextServiceMileage?.toLocaleString()} km` : 'N/A'} icon={Wrench} />
                <InfoItem label="Próxima Verificación" value={formatDate(vehicle.nextVerificationDate)} icon={CalendarClock} />
              </dl>
              <Separator className="my-6"/>
              <h4 className="text-md font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Documentos Adjuntos</h4>
              {vehicle.documents && vehicle.documents.length > 0 ? (
                <ul className="space-y-2">
                {vehicle.documents.map((doc, index) => (
                    <li key={index} className="text-sm flex items-center gap-2 p-2 border rounded-md hover:bg-muted/50">
                        <Download className="h-4 w-4 text-primary"/>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex-1 truncate" title={doc.name}>
                            {doc.name}
                        </a>
                    </li>
                ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No hay documentos adjuntos.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 mb-4">
          <TabsTrigger value="maintenance"><Wrench className="mr-2 h-4 w-4 sm:inline hidden" />Mantenimiento</TabsTrigger>
          <TabsTrigger value="incidents"><ShieldAlert className="mr-2 h-4 w-4 sm:inline hidden" />Siniestros</TabsTrigger>
          <TabsTrigger value="ai_predictions"><Brain className="mr-2 h-4 w-4 sm:inline hidden" />Predicciones IA</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historial de Mantenimiento</CardTitle>
                <Button size="sm" asChild>
                    <Link href={`/maintenance/new?vehicleId=${vehicle.id}&plate=${vehicle.plate}`}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Registrar Mantenimiento
                    </Link>
                </Button>
              </div>
              <CardDescription>Servicios y verificaciones realizados al vehículo.</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceHistory.length > 0 ? (
                <ul className="space-y-4">
                  {maintenanceHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(event => (
                    <li key={event.id} className="p-4 border rounded-md bg-muted/30 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-md text-foreground">{event.type}: {event.serviceType}</p>
                            <p className="text-sm text-muted-foreground">
                                Fecha: {formatDate(event.date)} | Kilometraje: {event.mileage?.toLocaleString()} km
                            </p>
                        </div>
                        {event.cost && <Badge variant="secondary" className="text-sm">${event.cost.toFixed(2)}</Badge>}
                      </div>
                      {event.workshop && <p className="text-sm text-muted-foreground mt-1">Taller: {event.workshop}</p>}
                      {event.notes && <p className="text-sm text-muted-foreground mt-1">Notas: {event.notes}</p>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground py-4 text-center">No hay historial de mantenimiento para este vehículo.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card className="shadow-lg">
            <CardHeader>
               <div className="flex justify-between items-center">
                <CardTitle>Historial de Siniestros</CardTitle>
                 <Button size="sm" asChild>
                    <Link href={`/incidents/new?vehicleId=${vehicle.id}&plate=${vehicle.plate}`}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Registrar Siniestro
                    </Link>
                </Button>
              </div>
              <CardDescription>Incidentes y reparaciones asociadas al vehículo.</CardDescription>
            </CardHeader>
            <CardContent>
              {incidentHistory.length > 0 ? (
                 <ul className="space-y-4">
                  {incidentHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(incident => (
                    <li key={incident.id} className="p-4 border rounded-md bg-muted/30 shadow-sm">
                       <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-md text-foreground">{incident.description}</p>
                                <p className="text-sm text-muted-foreground">
                                    Fecha: {formatDate(incident.date)}
                                    {incident.time && ` a las ${incident.time}`}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge
                                    variant={incident.damageLevel === "Leve" ? "outline" : "default"}
                                    className={
                                        incident.damageLevel === "Pérdida Total" ? "bg-destructive text-destructive-foreground border-destructive" :
                                        incident.damageLevel === "Moderado" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 border-yellow-300 dark:border-yellow-600" :
                                        "border-gray-300 dark:border-gray-600" // Leve
                                    }
                                >
                                    {incident.damageLevel}
                                </Badge>
                                 <Badge variant={incident.status === "Cerrado" ? "secondary" : "outline"}>
                                    {incident.status}
                                </Badge>
                            </div>
                       </div>
                       {incident.location && <p className="text-sm text-muted-foreground mt-1">Lugar: {incident.location}</p>}
                       {incident.notes && <p className="text-sm text-muted-foreground mt-1">Notas: {incident.notes}</p>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground py-4 text-center">No hay historial de siniestros para este vehículo.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai_predictions">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Predicciones de Mantenimiento (IA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-sky-900/30 dark:border-sky-700">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-sky-400" />
                  <AlertTitle className="text-blue-700 dark:text-sky-300">Funcionalidad Planeada</AlertTitle>
                  <AlertDescription className="text-blue-600 dark:text-sky-400">
                    Esta sección utilizará Inteligencia Artificial (Genkit) para analizar el historial de mantenimiento de este vehículo
                    y predecir posibles problemas futuros, su prioridad y acciones recomendadas.
                    ¡Mantente atento a futuras actualizaciones!
                  </AlertDescription>
                </Alert>
              <Button className="mt-4" disabled>
                <Brain className="mr-2 h-4 w-4" /> Obtener Predicción IA (Próximamente)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

