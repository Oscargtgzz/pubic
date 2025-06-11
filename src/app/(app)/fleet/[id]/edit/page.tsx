
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
import { ArrowLeft, Save, Truck, Loader2, Edit3 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle, VehicleStatus, CatalogItem as StoredBrand, ModelCatalogItem } from "@/lib/types";
import { APP_NAME } from '@/lib/config';
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

const vehicleStatusOptions: VehicleStatus[] = ["Operativo", "En Taller", "Siniestrado", "Baja"];

const vehicleSchema = z.object({
  plate: z.string().min(3, "La placa es requerida (mín. 3 caracteres).").max(10),
  serialNumber: z.string().optional(),
  brand: z.string().min(1, "La marca es requerida."),
  model: z.string().min(1, "El modelo es requerido."),
  year: z.coerce.number().min(1900, "Año inválido.").max(new Date().getFullYear() + 2, "Año futuro inválido."),
  color: z.string().optional(),
  currentMileage: z.coerce.number().min(0, "Kilometraje debe ser positivo."),
  status: z.enum(vehicleStatusOptions, { required_error: "El estatus es requerido." }),
  insurancePolicy: z.string().optional(),
  insuranceExpiryDate: z.string().optional().refine(val => val === "" || !val || !isNaN(Date.parse(val)), {
    message: "Fecha de vencimiento de póliza inválida.",
  }),
  notes: z.string().optional(),
  photoUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  nextServiceDate: z.string().optional().nullable(),
  nextServiceMileage: z.coerce.number().optional().nullable(),
  nextVerificationDate: z.string().optional().nullable(),
  circulationCard: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

const BRANDS_STORAGE_KEY = "fleetfox_catalog_brands";
const MODELS_STORAGE_KEY = "fleetfox_catalog_models";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const vehicleId = params.id;
  const { toast } = useToast();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [brands, setBrands] = useState<StoredBrand[]>([]);
  const [allModels, setAllModels] = useState<ModelCatalogItem[]>([]);
  const [modelsForSelectedBrand, setModelsForSelectedBrand] = useState<ModelCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    // Default values will be set by form.reset in useEffect
  });
  
  const selectedBrandName = form.watch("brand");

  useEffect(() => {
    document.title = `Editar Vehículo | ${APP_NAME}`;
    setIsLoading(true);
    if (vehicleId) {
      try {
        const storedVehiclesString = localStorage.getItem("vehicles");
        const vehicles: Vehicle[] = storedVehiclesString ? JSON.parse(storedVehiclesString) : [];
        const foundVehicle = vehicles.find(v => v.id === vehicleId);
        
        const storedBrandsString = localStorage.getItem(BRANDS_STORAGE_KEY);
        const loadedBrands: StoredBrand[] = storedBrandsString ? JSON.parse(storedBrandsString) : [];
        setBrands(loadedBrands);

        const storedModelsString = localStorage.getItem(MODELS_STORAGE_KEY);
        const loadedModels: ModelCatalogItem[] = storedModelsString ? JSON.parse(storedModelsString) : [];
        setAllModels(loadedModels);

        if (foundVehicle) {
          setVehicle(foundVehicle);
          form.reset({
            ...foundVehicle,
            year: Number(foundVehicle.year),
            currentMileage: Number(foundVehicle.currentMileage),
            insuranceExpiryDate: foundVehicle.insuranceExpiryDate ? foundVehicle.insuranceExpiryDate.split('T')[0] : "",
            nextServiceDate: foundVehicle.nextServiceDate ? foundVehicle.nextServiceDate.split('T')[0] : null,
            nextServiceMileage: foundVehicle.nextServiceMileage || null,
            nextVerificationDate: foundVehicle.nextVerificationDate ? foundVehicle.nextVerificationDate.split('T')[0] : null,
          });
          document.title = `Editar ${foundVehicle.plate} | ${APP_NAME}`;

          // Pre-load models for the initial brand
          if (foundVehicle.brand && loadedBrands.length > 0 && loadedModels.length >= 0) {
            const initialBrandObject = loadedBrands.find(b => b.name === foundVehicle.brand);
            if (initialBrandObject) {
              const filtered = loadedModels.filter(m => m.brandId === initialBrandObject.id);
              setModelsForSelectedBrand(filtered);
            }
          }

        } else {
          toast({ title: "Error", description: "Vehículo no encontrado.", variant: "destructive" });
          router.push("/fleet");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({ title: "Error al cargar datos", variant: "destructive" });
      }
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, router, toast]); // form removed to avoid re-triggering reset

  useEffect(() => {
    if (selectedBrandName && brands.length > 0 && allModels.length >= 0) {
      const selectedBrandObject = brands.find(b => b.name === selectedBrandName);
      if (selectedBrandObject) {
        setIsLoadingModels(true);
        const filtered = allModels.filter(m => m.brandId === selectedBrandObject.id);
        setModelsForSelectedBrand(filtered);
        // Only reset model if brand changed from the initial vehicle's brand or if it's a new selection
        if (vehicle && selectedBrandName !== vehicle.brand) {
            form.setValue("model", ""); 
        }
        setIsLoadingModels(false);
      } else {
        setModelsForSelectedBrand([]);
      }
    } else {
      setModelsForSelectedBrand([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandName, brands, allModels, vehicle, form.setValue]);


  function onSubmit(data: VehicleFormValues) {
    if (!vehicle) return;
    try {
      const updatedVehicle: Vehicle = {
        ...vehicle, 
        ...data, 
        year: Number(data.year),
        currentMileage: Number(data.currentMileage),
        lastUpdated: new Date().toISOString(),
        photoUrl: data.photoUrl || undefined,
        serialNumber: data.serialNumber || undefined,
        color: data.color || undefined,
        insurancePolicy: data.insurancePolicy || undefined,
        insuranceExpiryDate: data.insuranceExpiryDate || undefined,
        notes: data.notes || undefined,
        nextServiceDate: data.nextServiceDate || null,
        nextServiceMileage: data.nextServiceMileage || null,
        nextVerificationDate: data.nextVerificationDate || null,
        circulationCard: data.circulationCard || undefined,
      };

      const storedVehiclesString = localStorage.getItem("vehicles");
      let vehicles: Vehicle[] = storedVehiclesString ? JSON.parse(storedVehiclesString) : [];
      vehicles = vehicles.map(v => (v.id === vehicleId ? updatedVehicle : v));
      localStorage.setItem("vehicles", JSON.stringify(vehicles));

      toast({
        title: "Vehículo Actualizado",
        description: `El vehículo ${updatedVehicle.plate} ha sido actualizado.`,
      });
      router.push(`/fleet/${vehicleId}`);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast({
        title: "Error al Actualizar",
        description: "No se pudo actualizar el vehículo. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  }
  
  if (isLoading || !vehicle) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Cargando información del vehículo...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/fleet/${vehicleId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver al Detalle</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Vehículo: {vehicle.plate}</h1>
          <p className="text-muted-foreground">Modifica la información del vehículo.</p>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-6 w-6 text-primary" />
                <span>Datos del Vehículo</span>
              </CardTitle>
              <CardDescription>
                Actualiza los detalles relevantes del vehículo. Los campos marcados con * son obligatorios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa *</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Serie (VIN)</FormLabel>
                      <FormControl>
                        <Input placeholder="1ABCDEFG23456789H" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("model", ""); // Reset model when brand changes
                        }} 
                        value={field.value} 
                        disabled={brands.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={brands.length === 0 ? "No hay marcas configuradas" : "Selecciona una marca"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map(brand => <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!selectedBrandName || isLoadingModels || modelsForSelectedBrand.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !selectedBrandName ? "Selecciona una marca primero" :
                              isLoadingModels ? "Cargando modelos..." :
                              modelsForSelectedBrand.length === 0 ? "No hay modelos para esta marca" :
                              "Selecciona un modelo"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {isLoadingModels ? (
                            <SelectItem value="loading" disabled>Cargando modelos...</SelectItem>
                          ) : modelsForSelectedBrand.length === 0 ? (
                            <SelectItem value="no-models" disabled>
                              {!selectedBrandName ? "Selecciona una marca" : "No hay modelos configurados"}
                            </SelectItem>
                          ) : (
                            modelsForSelectedBrand.map(model => <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>)
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Rojo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilometraje Actual *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="25000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estatus Actual *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estatus" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleStatusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="circulationCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarjeta de Circulación</FormLabel>
                      <FormControl>
                        <Input placeholder="TC-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <h3 className="text-lg font-semibold">Información Adicional y Programación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="insurancePolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Póliza de Seguro</FormLabel>
                      <FormControl>
                        <Input placeholder="POLIZA-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vencimiento Póliza</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextServiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próximo Servicio (Fecha)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextServiceMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próximo Servicio (Kilometraje)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="nextVerificationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próxima Verificación</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto del Vehículo (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://placehold.co/600x400.png" {...field} />
                    </FormControl>
                    <FormDescription>Pega la URL de una imagen para el vehículo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Cualquier observación relevante sobre el vehículo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => router.push(`/fleet/${vehicleId}`)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}

    