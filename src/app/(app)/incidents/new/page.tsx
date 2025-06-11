
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
import { ArrowLeft, Save, ShieldAlertIcon, CalendarDaysIcon, ListChecksIcon, AlertTriangleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle, Incident, IncidentDamageLevel, IncidentStatus } from "@/lib/types";
import { APP_NAME } from '@/lib/config';
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

const damageLevels: IncidentDamageLevel[] = ["Leve", "Moderado", "Pérdida Total"];
const incidentStatuses: IncidentStatus[] = ["Abierto", "En Evaluación", "Esperando Refacciones", "En Reparación", "Reparado/Esperando Entrega", "Cerrado"];

const incidentSchema = z.object({
  vehicleId: z.string().min(1, "Debes seleccionar un vehículo."),
  date: z.string().min(1, "La fecha del siniestro es requerida."),
  time: z.string().optional(),
  description: z.string().min(10, "La descripción es requerida (mín. 10 caracteres).").max(500),
  damageLevel: z.enum(damageLevels, { required_error: "El nivel de daño es requerido." }),
  status: z.enum(incidentStatuses, { required_error: "El estatus del siniestro es requerido." }),
  location: z.string().optional(),
  thirdPartyName: z.string().optional(),
  thirdPartyVehiclePlate: z.string().optional(),
  thirdPartyInsurance: z.string().optional(),
  notes: z.string().optional(),
  // photos and documents will be handled later
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

export default function NewIncidentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Pick<Vehicle, "id" | "plate" | "brand" | "model">[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  const prefillVehicleId = searchParams.get("vehicleId");
  const prefillPlate = searchParams.get("plate");

  useEffect(() => {
    document.title = `Registrar Siniestro | ${APP_NAME}`;
    try {
      const storedVehiclesString = localStorage.getItem("vehicles");
      if (storedVehiclesString) {
        const parsedVehicles: Vehicle[] = JSON.parse(storedVehiclesString);
        setVehicles(parsedVehicles.map(v => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })));
      }
    } catch (error) {
      console.error("Error loading vehicles from localStorage:", error);
      toast({
        title: "Error al cargar vehículos",
        description: "No se pudieron cargar los vehículos para seleccionar.",
        variant: "destructive",
      });
    }
    setIsLoadingVehicles(false);
  }, [toast]);

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      vehicleId: prefillVehicleId || "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      description: "",
      // damageLevel: undefined, // Let user select
      // status: "Abierto", // Default to Abierto
      location: "",
      thirdPartyName: "",
      thirdPartyVehiclePlate: "",
      thirdPartyInsurance: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (prefillVehicleId) {
      form.setValue("vehicleId", prefillVehicleId);
    }
  }, [prefillVehicleId, form]);

  function onSubmit(data: IncidentFormValues) {
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
      const newIncident: Incident = {
        ...data,
        id: crypto.randomUUID(),
        vehiclePlate: selectedVehicle.plate,
        time: data.time || undefined,
        location: data.location || undefined,
        thirdPartyName: data.thirdPartyName || undefined,
        thirdPartyVehiclePlate: data.thirdPartyVehiclePlate || undefined,
        thirdPartyInsurance: data.thirdPartyInsurance || undefined,
        notes: data.notes || undefined,
        lastUpdated: new Date().toISOString(),
      };

      const storedIncidentsString = localStorage.getItem("incidents");
      const incidents: Incident[] = storedIncidentsString ? JSON.parse(storedIncidentsString) : [];
      incidents.push(newIncident);
      localStorage.setItem("incidents", JSON.stringify(incidents));

      toast({
        title: "Siniestro Registrado",
        description: `El siniestro para ${selectedVehicle.plate} ha sido guardado.`,
      });
      router.push(`/fleet/${selectedVehicle.id}`); // Or router.push("/incidents");
    } catch (error) {
      console.error("Error saving incident:", error);
      toast({
        title: "Error al Guardar",
        description: "No se pudo guardar el siniestro. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={prefillVehicleId ? `/fleet/${prefillVehicleId}` : "/incidents"}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Registrar Nuevo Siniestro</h1>
          <p className="text-muted-foreground">
            {prefillPlate ? `Para el vehículo: ${prefillPlate}` : "Completa la información del siniestro."}
          </p>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlertIcon className="h-6 w-6 text-primary" />
                <span>Detalles del Siniestro</span>
              </CardTitle>
              <CardDescription>
                Ingresa la información del incidente. Los campos marcados con * son obligatorios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehículo Involucrado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingVehicles || !!prefillVehicleId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingVehicles ? "Cargando vehículos..." : "Selecciona un vehículo"} />
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
                      <FormLabel>Fecha del Siniestro *</FormLabel>
                      <div className="relative">
                        <CalendarDaysIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                          <Input type="date" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora del Siniestro</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="damageLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Daño Estimado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el nivel de daño" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {damageLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Siniestro *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalla cómo ocurrió el incidente, daños visibles, etc." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              
              <h3 className="text-lg font-semibold">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estatus del Siniestro *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el estatus inicial" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {incidentStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación del Siniestro</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Av. Principal esq. Calle Secundaria, Ciudad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h4 className="text-md font-semibold pt-2">Detalles del Tercero (Si aplica)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="thirdPartyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Tercero</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thirdPartyVehiclePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa Vehículo Tercero</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thirdPartyInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aseguradora Tercero</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre aseguradora" {...field} />
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
                    <FormLabel>Notas Adicionales sobre el Siniestro</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Cualquier observación relevante, número de reporte, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File uploads for photos/documents - MVP: Handled later or via simple text URLs if absolutely needed */}
              {/* 
              <div className="space-y-2">
                <Label htmlFor="photos">Adjuntar Fotos del Siniestro</Label>
                <Input id="photos" type="file" multiple accept="image/*" disabled />
                <p className="text-xs text-muted-foreground">Puedes seleccionar múltiples imágenes. (Funcionalidad pendiente)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents">Adjuntar Documentos (Reporte policial, etc.)</Label>
                <Input id="documents" type="file" multiple disabled/>
                <p className="text-xs text-muted-foreground">Puedes seleccionar múltiples archivos. (Funcionalidad pendiente)</p>
              </div>
              */}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" asChild>
                  <Link href={prefillVehicleId ? `/fleet/${prefillVehicleId}` : "/incidents"}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Guardando..." : <><Save className="mr-2 h-4 w-4" /> Guardar Siniestro</>}
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
