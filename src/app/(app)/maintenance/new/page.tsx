
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Wrench as WrenchIcon, CalendarDaysIcon, GaugeIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle, MaintenanceEvent, MaintenanceType, CatalogItem as StoredCatalogItem } from "@/lib/types";
import { APP_NAME } from '@/lib/config';
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

const maintenanceTypes: MaintenanceType[] = ["Servicio", "Verificación"];

const maintenanceEventSchema = z.object({
  vehicleId: z.string().min(1, "Debes seleccionar un vehículo."),
  date: z.string().min(1, "La fecha es requerida."),
  mileage: z.coerce.number().min(0, "El kilometraje debe ser un número positivo."),
  type: z.enum(maintenanceTypes, { required_error: "El tipo de evento es requerido." }),
  serviceType: z.string().min(1, "El tipo de servicio es requerido."), // Changed from min(3) as it's a selection
  workshop: z.string().optional(),
  cost: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type MaintenanceEventFormValues = z.infer<typeof maintenanceEventSchema>;

type CatalogItem = { id: string; name: string };

export default function NewMaintenancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Pick<Vehicle, "id" | "plate" | "brand" | "model">[]>([]);
  const [serviceTypes, setServiceTypes] = useState<CatalogItem[]>([]);
  const [workshops, setWorkshops] = useState<CatalogItem[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  const prefillVehicleId = searchParams.get("vehicleId");
  const prefillPlate = searchParams.get("plate");

  useEffect(() => {
    document.title = `Registrar Mantenimiento | ${APP_NAME}`;
    setIsLoadingCatalogs(true);
    try {
      const storedVehiclesString = localStorage.getItem("vehicles");
      if (storedVehiclesString) {
        const parsedVehicles: Vehicle[] = JSON.parse(storedVehiclesString);
        setVehicles(parsedVehicles.map(v => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })));
      }

      const storedServiceTypesString = localStorage.getItem("fleetfox_catalog_service_types");
      if (storedServiceTypesString) {
        setServiceTypes(JSON.parse(storedServiceTypesString));
      } else {
        const defaultServiceTypesList = ["Cambio de Aceite", "Servicio Menor", "Servicio Mayor", "Otro"].map(name => ({ id: crypto.randomUUID(), name }));
        setServiceTypes(defaultServiceTypesList);
        localStorage.setItem("fleetfox_catalog_service_types", JSON.stringify(defaultServiceTypesList));
      }
      
      const storedWorkshopsString = localStorage.getItem("fleetfox_catalog_workshops");
      if (storedWorkshopsString) {
        setWorkshops(JSON.parse(storedWorkshopsString));
      } else {
        const defaultWorkshopsList = ["Taller Central", "ServiFast Norte", "Otro"].map(name => ({ id: crypto.randomUUID(), name }));
        setWorkshops(defaultWorkshopsList);
        localStorage.setItem("fleetfox_catalog_workshops", JSON.stringify(defaultWorkshopsList));
      }

    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron cargar vehículos o catálogos.",
        variant: "destructive",
      });
    }
    setIsLoadingCatalogs(false);
  }, [toast]);

  const form = useForm<MaintenanceEventFormValues>({
    resolver: zodResolver(maintenanceEventSchema),
    defaultValues: {
      vehicleId: prefillVehicleId || "",
      date: new Date().toISOString().split('T')[0],
      mileage: 0,
      serviceType: "",
      workshop: "",
      cost: undefined,
      notes: "",
    },
  });

   useEffect(() => {
    if (prefillVehicleId) {
      form.setValue("vehicleId", prefillVehicleId);
    }
  }, [prefillVehicleId, form]);


  function onSubmit(data: MaintenanceEventFormValues) {
    const selectedVehicle = vehicles.find(v => v.id === data.vehicleId);
    if (!selectedVehicle) {
      toast({
        title: "Error",
        description: "Vehículo seleccionado no válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newMaintenanceEvent: MaintenanceEvent = {
        ...data,
        id: crypto.randomUUID(),
        vehiclePlate: selectedVehicle.plate,
        workshop: data.workshop || undefined,
        cost: data.cost || undefined,
        notes: data.notes || undefined,
        lastUpdated: new Date().toISOString(),
      };

      const storedEventsString = localStorage.getItem("maintenance_events");
      const events: MaintenanceEvent[] = storedEventsString ? JSON.parse(storedEventsString) : [];
      events.push(newMaintenanceEvent);
      localStorage.setItem("maintenance_events", JSON.stringify(events));

      toast({
        title: "Mantenimiento Registrado",
        description: `El evento de mantenimiento para ${selectedVehicle.plate} ha sido guardado.`,
      });
      router.push(`/fleet/${selectedVehicle.id}`);
    } catch (error) {
      console.error("Error saving maintenance event:", error);
      toast({
        title: "Error al Guardar",
        description: "No se pudo guardar el evento de mantenimiento. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={prefillVehicleId ? `/fleet/${prefillVehicleId}` : "/maintenance"}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Registrar Evento de Mantenimiento</h1>
          <p className="text-muted-foreground">
            {prefillPlate ? `Para el vehículo: ${prefillPlate}` : "Completa la información del evento."}
          </p>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WrenchIcon className="h-6 w-6 text-primary" />
                <span>Detalles del Mantenimiento</span>
              </CardTitle>
              <CardDescription>
                Ingresa la información del servicio o verificación. Los campos marcados con * son obligatorios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehículo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCatalogs || !!prefillVehicleId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingCatalogs ? "Cargando vehículos..." : "Selecciona un vehículo"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map(vehicle => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.brand} {vehicle.model} ({vehicle.plate})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha *</FormLabel>
                       <div className="relative">
                        <CalendarDaysIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                          <Input type="date" {...field} className="pl-10"/>
                        </FormControl>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilometraje *</FormLabel>
                      <div className="relative">
                        <GaugeIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                          <Input type="number" placeholder="Ej: 35000" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Evento *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {maintenanceTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              
              <h3 className="text-lg font-semibold">Detalles Específicos del Servicio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tipo de Servicio *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCatalogs}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingCatalogs ? "Cargando tipos..." : "Selecciona un tipo de servicio"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCatalogs && <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                          {serviceTypes.map(st => (
                            <SelectItem key={st.id} value={st.name}>{st.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workshop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taller / Proveedor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCatalogs}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingCatalogs ? "Cargando talleres..." : "Selecciona un taller"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {isLoadingCatalogs && <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                          {workshops.map(ws => (
                            <SelectItem key={ws.id} value={ws.name}>{ws.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo (MXN)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej: 1500.00" step="0.01" {...field} 
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observaciones, próximos servicios recomendados, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" asChild>
                  <Link href={prefillVehicleId ? `/fleet/${prefillVehicleId}` : "/maintenance"}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting || isLoadingCatalogs}>
                  {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                  {form.formState.isSubmitting ? "Guardando..." : "Guardar Mantenimiento"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}

