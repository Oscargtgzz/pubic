
"use client";

import { useEffect, useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, GanttChartSquare, PlusCircle, Edit, Trash2, AlertTriangle, Info, Loader2, Save, XCircle, Car, Search, X } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from '@/lib/config';
import type { MaintenanceRule, Vehicle } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mockMaintenanceRules, mockVehicles as defaultMockVehicles } from "@/lib/mock-data";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox"; // Ensure Checkbox is imported

const MAINTENANCE_RULES_STORAGE_KEY = "fleetfox_maintenance_rules";
const VEHICLES_STORAGE_KEY = "vehicles";

const maintenanceRuleSchema = z.object({
  name: z.string().min(3, "El nombre de la regla es requerido (mín. 3 caracteres).").max(100),
  vehicleType: z.string().optional(),
  assignedVehicleIdsInput: z.string().optional().describe("Este campo se llenará programáticamente."), // No longer directly user-editable in the same way
  mileageInterval: z.coerce.number().min(0, "Debe ser un número positivo o cero.").optional().nullable(),
  timeIntervalMonths: z.coerce.number().min(0, "Debe ser un número positivo o cero.").optional().nullable(),
  serviceTasks: z.string().min(10, "Las tareas del servicio son requeridas (mín. 10 caracteres)."),
}).refine(data => data.mileageInterval || data.timeIntervalMonths || (data.assignedVehicleIdsInput && data.assignedVehicleIdsInput.trim() !== ''), {
  message: "Debe especificar al menos un intervalo (kilometraje o tiempo) o asignar vehículos específicos.",
  path: ["mileageInterval"], 
});

type MaintenanceRuleFormValues = z.infer<typeof maintenanceRuleSchema>;

const vehicleTypeOptions = ["Sedán", "SUV", "Pickup", "Van", "Camión Ligero"];

export default function MaintenanceRulesPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<MaintenanceRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<MaintenanceRule | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [allVehicles, setAllVehicles] = useState<Pick<Vehicle, "id" | "plate" | "brand" | "model">[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set());
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm<MaintenanceRuleFormValues>({
    resolver: zodResolver(maintenanceRuleSchema),
    defaultValues: {
      name: "",
      vehicleType: "", 
      assignedVehicleIdsInput: "",
      mileageInterval: undefined,
      timeIntervalMonths: undefined,
      serviceTasks: "",
    },
  });
  
  useEffect(() => {
    document.title = `Reglas de Mantenimiento | ${APP_NAME}`;
    setIsLoading(true);
    setIsLoadingVehicles(true);
    try {
      const storedRules = localStorage.getItem(MAINTENANCE_RULES_STORAGE_KEY);
      if (storedRules) {
        setRules(JSON.parse(storedRules));
      } else {
        setRules(mockMaintenanceRules);
        localStorage.setItem(MAINTENANCE_RULES_STORAGE_KEY, JSON.stringify(mockMaintenanceRules));
      }

      const storedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (storedVehicles) {
        const parsedVehicles: Vehicle[] = JSON.parse(storedVehicles);
        setAllVehicles(parsedVehicles.map(v => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })));
      } else {
        setAllVehicles(defaultMockVehicles.map(v => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })));
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(defaultMockVehicles));
      }

    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      toast({
        title: "Error al Cargar Datos",
        description: "No se pudieron cargar reglas o vehículos.",
        variant: "destructive",
      });
      setRules(mockMaintenanceRules); 
      setAllVehicles(defaultMockVehicles.map(v => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })));
    }
    setIsLoading(false);
    setIsLoadingVehicles(false);
  }, [toast]);

  // Update form's assignedVehicleIdsInput when selectedVehicleIds changes
  useEffect(() => {
    form.setValue("assignedVehicleIdsInput", Array.from(selectedVehicleIds).join(','));
  }, [selectedVehicleIds, form]);

  const onSubmit = (data: MaintenanceRuleFormValues) => {
    setIsSubmitting(true);
    try {
      const vehicleIdsArray = Array.from(selectedVehicleIds);

      const ruleDataToSave: Omit<MaintenanceRule, 'id' | 'lastUpdated'> = {
        name: data.name,
        vehicleType: data.vehicleType || undefined,
        assignedVehicleIds: vehicleIdsArray.length > 0 ? vehicleIdsArray : undefined,
        mileageInterval: data.mileageInterval || undefined,
        timeIntervalMonths: data.timeIntervalMonths || undefined,
        serviceTasks: data.serviceTasks,
      };

      if (editingRuleId) {
        const updatedRules = rules.map(rule =>
          rule.id === editingRuleId ? { ...rule, ...ruleDataToSave, lastUpdated: new Date().toISOString() } : rule
        );
        setRules(updatedRules);
        localStorage.setItem(MAINTENANCE_RULES_STORAGE_KEY, JSON.stringify(updatedRules));
        toast({
          title: "Regla Actualizada",
          description: `La regla "${data.name}" ha sido guardada.`,
        });
        setEditingRuleId(null);
      } else {
        const newRule: MaintenanceRule = {
          id: crypto.randomUUID(),
          ...ruleDataToSave,
          lastUpdated: new Date().toISOString(),
        };
        const updatedRules = [...rules, newRule];
        setRules(updatedRules);
        localStorage.setItem(MAINTENANCE_RULES_STORAGE_KEY, JSON.stringify(updatedRules));
        toast({
          title: "Regla Creada",
          description: `La regla "${newRule.name}" ha sido guardada.`,
        });
      }
      form.reset({ name: "", vehicleType: "", assignedVehicleIdsInput: "", mileageInterval: undefined, timeIntervalMonths: undefined, serviceTasks: ""});
      setSelectedVehicleIds(new Set());
    } catch (error) {
      console.error("Error saving maintenance rule:", error);
      toast({
        title: "Error al Guardar",
        description: "No se pudo guardar la regla. Intenta de nuevo.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handleEditRule = (ruleToEdit: MaintenanceRule) => {
    setEditingRuleId(ruleToEdit.id);
    const ruleAssignedIds = ruleToEdit.assignedVehicleIds || [];
    setSelectedVehicleIds(new Set(ruleAssignedIds));
    form.reset({
        name: ruleToEdit.name,
        vehicleType: ruleToEdit.vehicleType || "", 
        assignedVehicleIdsInput: ruleAssignedIds.join(','),
        mileageInterval: ruleToEdit.mileageInterval || undefined,
        timeIntervalMonths: ruleToEdit.timeIntervalMonths || undefined,
        serviceTasks: ruleToEdit.serviceTasks,
    });
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    form.reset({ name: "", vehicleType: "", assignedVehicleIdsInput: "", mileageInterval: undefined, timeIntervalMonths: undefined, serviceTasks: ""});
    setSelectedVehicleIds(new Set());
    toast({ title: "Edición cancelada", variant: "default" });
  };

  const handleDeleteRuleClick = (rule: MaintenanceRule) => {
    setRuleToDelete(rule);
    setShowDeleteDialog(true);
  };

  const confirmDeleteRule = () => {
    if (!ruleToDelete) return;
    const updatedRules = rules.filter(rule => rule.id !== ruleToDelete.id);
    setRules(updatedRules);
    localStorage.setItem(MAINTENANCE_RULES_STORAGE_KEY, JSON.stringify(updatedRules));
    toast({
      title: "Regla Eliminada",
      description: `La regla "${ruleToDelete.name}" ha sido eliminada.`,
    });
    setShowDeleteDialog(false);
    setRuleToDelete(null);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vehicleId)) {
        newSet.delete(vehicleId);
      } else {
        newSet.add(vehicleId);
      }
      return newSet;
    });
  };

  const getVehicleDisplayInfo = (vehicleId: string) => {
    const vehicle = allVehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.plate} (${vehicle.brand} ${vehicle.model})` : `ID: ${vehicleId}`;
  };

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver a Configuración</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reglas de Mantenimiento</h1>
          <p className="text-muted-foreground">
            Define intervalos y tipos de servicio para automatizar recordatorios y programación.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingRuleId ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                  <span>{editingRuleId ? "Editar Regla" : "Crear Nueva Regla"}</span>
                </CardTitle>
                <CardDescription>
                  {editingRuleId ? "Modifica los detalles de la regla." : "Define una nueva regla de mantenimiento."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Regla *</FormLabel>
                      <FormControl><Input placeholder="Ej: Servicio Menor - Autos Sedán" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Vehículo (General)</FormLabel>
                        <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ""} 
                            disabled={selectedVehicleIds.size > 0} // Disable if specific vehicles are selected
                            >
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los tipos / Categoría general" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {vehicleTypeOptions.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                            Usar si la regla no es para vehículos específicos. Se deshabilita si se seleccionan vehículos.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                {/* Vehicle Selector Popover */}
                <FormItem>
                    <FormLabel>Vehículos Específicos Asignados</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <Car className="mr-2 h-4 w-4" />
                                {selectedVehicleIds.size > 0 ? `Seleccionados (${selectedVehicleIds.size})` : "Seleccionar Vehículos..."}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Buscar vehículo (placa, marca, modelo)..." />
                                <CommandList>
                                    <CommandEmpty>{isLoadingVehicles ? "Cargando vehículos..." : "No se encontraron vehículos."}</CommandEmpty>
                                    <CommandGroup>
                                    <ScrollArea className="h-48">
                                        {isLoadingVehicles ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
                                        ) : allVehicles.map(vehicle => (
                                            <CommandItem
                                                key={vehicle.id}
                                                value={`${vehicle.plate} ${vehicle.brand} ${vehicle.model}`}
                                                onSelect={() => {
                                                    handleVehicleSelect(vehicle.id);
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                 <Checkbox
                                                    checked={selectedVehicleIds.has(vehicle.id)}
                                                    onCheckedChange={() => handleVehicleSelect(vehicle.id)}
                                                    className="mr-2"
                                                />
                                                <span>{vehicle.plate} ({vehicle.brand} {vehicle.model})</span>
                                            </CommandItem>
                                        ))}
                                     </ScrollArea>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                     <FormDescription className="text-xs">
                        Si se seleccionan vehículos específicos, el "Tipo de Vehículo (General)" se ignora.
                    </FormDescription>
                    {selectedVehicleIds.size > 0 && (
                        <div className="mt-2 space-x-1 space-y-1">
                            {Array.from(selectedVehicleIds).map(id => (
                                <Badge key={id} variant="secondary" className="whitespace-nowrap">
                                    {getVehicleDisplayInfo(id).split('(')[0].trim()} {/* Show only plate for brevity */}
                                    <button type="button" onClick={() => handleVehicleSelect(id)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </FormItem>
               
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mileageInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo Kilometraje (km)</FormLabel>
                        <FormControl><Input type="number" placeholder="10000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeIntervalMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo Tiempo (meses)</FormLabel>
                        <FormControl><Input type="number" placeholder="6" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="serviceTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tareas del Servicio / Descripción *</FormLabel>
                      <FormControl><Textarea placeholder="Detalla las tareas a realizar en este servicio..." {...field} rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {/* Hidden field to satisfy Zod, managed by selectedVehicleIds state */}
                <FormField
                    control={form.control}
                    name="assignedVehicleIdsInput"
                    render={({ field }) => <Input type="hidden" {...field} />}
                />
                <div className="flex gap-2 justify-end">
                    {editingRuleId && (
                        <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                            <XCircle className="mr-2 h-4 w-4" /> Cancelar Edición
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting || isLoadingVehicles}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingRuleId ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
                    {isSubmitting ? "Guardando..." : (editingRuleId ? "Actualizar Regla" : "Guardar Regla")}
                    </Button>
                </div>
              </CardContent>
            </form>
          </Form>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GanttChartSquare className="h-5 w-5 text-primary" />
              <span>Reglas Existentes</span>
            </CardTitle>
            <CardDescription>Visualiza y gestiona las reglas de mantenimiento activas.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : rules.length === 0 ? (
              <div className="border rounded-md p-4 min-h-[200px] flex items-center justify-center bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Aún no hay reglas de mantenimiento definidas.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {rules.map(rule => (
                  <div key={rule.id} className="p-3 border rounded-md hover:shadow-sm transition-shadow bg-card">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-foreground">{rule.name}</h4>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditRule(rule)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteRuleClick(rule)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rule.assignedVehicleIds && rule.assignedVehicleIds.length > 0 
                        ? `Vehículos Específicos: ${rule.assignedVehicleIds.map(id => allVehicles.find(v=>v.id === id)?.plate || id).join(', ')}`
                        : `Tipo Vehículo: ${rule.vehicleType || "Todos"}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Intervalo: 
                      {rule.mileageInterval ? ` Cada ${rule.mileageInterval.toLocaleString()} km ` : ""}
                      {(rule.mileageInterval && rule.timeIntervalMonths) && `o `}
                      {rule.timeIntervalMonths ? `Cada ${rule.timeIntervalMonths} meses` : ""}
                      {(!rule.mileageInterval && !rule.timeIntervalMonths && (!rule.assignedVehicleIds || rule.assignedVehicleIds.length === 0)) && " No especificado (revisar configuración)"}
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground/80">Tareas: {rule.serviceTasks.substring(0, 100)}{rule.serviceTasks.length > 100 && "..."}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la regla "{ruleToDelete?.name}" de tus configuraciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setRuleToDelete(null); setShowDeleteDialog(false); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRule} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="mt-8 bg-sky-50 border-sky-200 dark:bg-sky-900/30 dark:border-sky-700">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <Info className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            <CardTitle className="text-sky-700 dark:text-sky-300 text-md">¿Cómo funcionan las reglas?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-sky-700 dark:text-sky-400 space-y-1">
            <p>Las reglas de mantenimiento ayudan a programar automáticamente los próximos servicios basados en kilometraje o tiempo.</p>
            <p>Puedes definir reglas generales (por tipo de vehículo) o específicas para ciertos vehículos.</p>
            <p>Si se seleccionan vehículos específicos, la opción "Tipo de Vehículo (General)" se ignora para esa regla.</p>
            <p>El sistema generará alertas cuando un servicio basado en estas reglas esté próximo o vencido (funcionalidad futura).</p>
        </CardContent>
      </Card>
    </div>
  );
}

    