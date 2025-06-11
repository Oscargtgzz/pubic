
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Tag, Car, Wrench as WrenchIcon, PlusCircle, Edit, Trash2, Save, X, Loader2, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from '@/lib/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CatalogManager } from "@/components/settings/catalog-manager";
import { useEffect, useState, useMemo } from "react";
import type { CatalogItem, ModelCatalogItem } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { mockBrands as defaultMockBrands, mockModels as defaultMockModels, mockServiceTypes as defaultMockServiceTypes, mockWorkshops as defaultMockWorkshops } from "@/lib/mock-data";

const MODELS_STORAGE_KEY = "fleetfox_catalog_models";
const BRANDS_STORAGE_KEY = "fleetfox_catalog_brands";
const SERVICE_TYPES_STORAGE_KEY = "fleetfox_catalog_service_types";
const WORKSHOPS_STORAGE_KEY = "fleetfox_catalog_workshops";

type ViewMode = 'grid' | 'list';

interface CatalogTabProps {
  storageKey: string;
  itemCategory: string;
  itemNameSingular: string;
  defaultItemsData: CatalogItem[];
  icon: React.ComponentType<{ className?: string }>;
}

const CatalogTabContent: React.FC<CatalogTabProps> = ({ storageKey, itemCategory, itemNameSingular, defaultItemsData, icon }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  // We let CatalogManager handle its own data fetching and state for simplicity here.
  // If more complex interactions between view mode and data were needed, state would be lifted.

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('grid')}
          aria-label="Vista de cuadrícula"
          title="Vista de cuadrícula"
          className="mr-2"
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('list')}
          aria-label="Vista de lista"
          title="Vista de lista"
        >
          <List className="h-5 w-5" />
        </Button>
      </div>
      <CatalogManager
        storageKey={storageKey}
        itemCategory={itemCategory}
        itemNameSingular={itemNameSingular}
        defaultItemsData={defaultItemsData}
        icon={icon}
        displayMode={viewMode}
      />
    </div>
  );
};


export default function CatalogsPage() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<CatalogItem[]>([]);
  const [allModels, setAllModels] = useState<ModelCatalogItem[]>([]);
  
  const [selectedBrandIdForModels, setSelectedBrandIdForModels] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState("");
  const [editingModel, setEditingModel] = useState<ModelCatalogItem | null>(null);
  const [editingModelName, setEditingModelName] = useState("");
  const [modelToDelete, setModelToDelete] = useState<ModelCatalogItem | null>(null);
  const [showDeleteModelDialog, setShowDeleteModelDialog] = useState(false);

  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingAllModels, setIsLoadingAllModels] = useState(true); // For the initial load of all models

  useEffect(() => {
    document.title = `Catálogos Maestros | ${APP_NAME}`;
    
    // Load Brands
    setIsLoadingBrands(true);
    try {
      const storedBrands = localStorage.getItem(BRANDS_STORAGE_KEY);
      if (storedBrands) {
        setBrands(JSON.parse(storedBrands));
      } else {
        setBrands(defaultMockBrands);
        localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(defaultMockBrands));
      }
    } catch (error) {
      console.error("Error loading brands:", error);
      toast({ title: "Error al cargar marcas", variant: "destructive" });
    }
    setIsLoadingBrands(false);

    // Load All Models
    setIsLoadingAllModels(true);
    try {
      const storedModels = localStorage.getItem(MODELS_STORAGE_KEY);
      if (storedModels) {
        setAllModels(JSON.parse(storedModels));
      } else {
        const currentBrands = brands.length > 0 ? brands : defaultMockBrands;
        const initialModels = defaultMockModels.filter(m => currentBrands.some(b => b.id === m.brandId));
        setAllModels(initialModels);
        localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(initialModels));
      }
    } catch (error) {
      console.error("Error loading models:", error);
      toast({ title: "Error al cargar modelos", variant: "destructive" });
    }
    setIsLoadingAllModels(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); 

  const modelsForSelectedBrand = useMemo(() => {
    if (!selectedBrandIdForModels) return [];
    return allModels.filter(model => model.brandId === selectedBrandIdForModels);
  }, [allModels, selectedBrandIdForModels]);

  const saveAllModelsToStorage = (updatedModels: ModelCatalogItem[]) => {
    localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(updatedModels));
  };

  const handleAddModel = () => {
    if (!selectedBrandIdForModels || newModelName.trim() === "") {
      toast({ title: "Error", description: "Selecciona una marca y escribe un nombre para el modelo.", variant: "destructive" });
      return;
    }
    if (modelsForSelectedBrand.some(m => m.name.toLowerCase() === newModelName.trim().toLowerCase())) {
      toast({ title: "Error", description: `El modelo "${newModelName.trim()}" ya existe para esta marca.`, variant: "destructive" });
      return;
    }
    const newModel: ModelCatalogItem = { 
      id: crypto.randomUUID(), 
      name: newModelName.trim(), 
      brandId: selectedBrandIdForModels 
    };
    const updatedAllModels = [...allModels, newModel];
    setAllModels(updatedAllModels);
    saveAllModelsToStorage(updatedAllModels);
    setNewModelName("");
    toast({ title: "Modelo agregado", description: `El modelo "${newModel.name}" ha sido agregado.` });
  };

  const handleEditModel = (model: ModelCatalogItem) => {
    setEditingModel(model);
    setEditingModelName(model.name);
  };

  const handleSaveModelEdit = () => {
    if (!editingModel || editingModelName.trim() === "") return;
    if (modelsForSelectedBrand.some(m => m.name.toLowerCase() === editingModelName.trim().toLowerCase() && m.id !== editingModel.id)) {
       toast({ title: "Error", description: `Otro modelo con el nombre "${editingModelName.trim()}" ya existe para esta marca.`, variant: "destructive" });
      return;
    }
    const updatedAllModels = allModels.map(m =>
      m.id === editingModel.id ? { ...m, name: editingModelName.trim() } : m
    );
    setAllModels(updatedAllModels);
    saveAllModelsToStorage(updatedAllModels);
    setEditingModel(null);
    setEditingModelName("");
    toast({ title: "Modelo actualizado" });
  };

  const handleCancelModelEdit = () => {
    setEditingModel(null);
    setEditingModelName("");
  };

  const handleDeleteModelClick = (model: ModelCatalogItem) => {
    setModelToDelete(model);
    setShowDeleteModelDialog(true);
  };

  const confirmDeleteModel = () => {
    if (!modelToDelete) return;
    const updatedAllModels = allModels.filter(m => m.id !== modelToDelete.id);
    setAllModels(updatedAllModels);
    saveAllModelsToStorage(updatedAllModels);
    setShowDeleteModelDialog(false);
    toast({ title: "Modelo eliminado", description: `El modelo "${modelToDelete.name}" ha sido eliminado.` });
    setModelToDelete(null);
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Catálogos Maestros</h1>
          <p className="text-muted-foreground">
            Administra las listas de opciones estándar para Marcas, Modelos, Tipos de Servicio y Talleres.
          </p>
        </div>
      </div>

      <Tabs defaultValue="marcas" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="marcas"><Tag className="mr-2 h-4 w-4"/>Marcas</TabsTrigger>
          <TabsTrigger value="modelos"><Car className="mr-2 h-4 w-4"/>Modelos</TabsTrigger>
          <TabsTrigger value="tipos_servicio"><WrenchIcon className="mr-2 h-4 w-4"/>Tipos de Servicio</TabsTrigger>
          <TabsTrigger value="talleres"><BookOpen className="mr-2 h-4 w-4"/>Talleres</TabsTrigger>
        </TabsList>

        <TabsContent value="marcas">
           <CatalogTabContent
            storageKey={BRANDS_STORAGE_KEY}
            itemCategory="Marca"
            itemNameSingular="marca"
            defaultItemsData={defaultMockBrands}
            icon={Tag}
          />
        </TabsContent>
        <TabsContent value="modelos">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" /> Gestión de Modelos por Marca
              </CardTitle>
              <CardDescription>Selecciona una marca para ver y administrar sus modelos.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label htmlFor="brand-select-for-models" className="block text-sm font-medium text-muted-foreground mb-1">Seleccionar Marca:</label>
                <Select
                  value={selectedBrandIdForModels || ""}
                  onValueChange={(value) => setSelectedBrandIdForModels(value === "none" ? null : value)}
                  disabled={isLoadingBrands}
                >
                  <SelectTrigger id="brand-select-for-models">
                    <SelectValue placeholder={isLoadingBrands ? "Cargando marcas..." : "Elige una marca"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingBrands ? (
                        <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : brands.length === 0 ? (
                        <SelectItem value="no-brands" disabled>No hay marcas configuradas</SelectItem>
                    ) : (
                        <>
                        <SelectItem value="none">-- Ninguna --</SelectItem>
                        {brands.map(brand => (
                            <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                        </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedBrandIdForModels && (
                <>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder={`Nuevo modelo para ${brands.find(b => b.id === selectedBrandIdForModels)?.name || 'marca seleccionada'}...`}
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddModel()}
                      className="flex-grow"
                    />
                    <Button size="sm" onClick={handleAddModel}><PlusCircle className="mr-2 h-4 w-4" />Agregar Modelo</Button>
                  </div>
                  {isLoadingAllModels ? (
                     <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : modelsForSelectedBrand.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay modelos registrados para esta marca.</p>
                  ) : (
                    <ScrollArea className="h-60 border rounded-md p-2">
                      <ul className="space-y-1">
                        {modelsForSelectedBrand.map(model => (
                          <li key={model.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md">
                            {editingModel?.id === model.id ? (
                              <div className="flex-grow flex gap-2 items-center">
                                <Input
                                  value={editingModelName}
                                  onChange={(e) => setEditingModelName(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleSaveModelEdit()}
                                  className="h-8"
                                />
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={handleSaveModelEdit}><Save className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelModelEdit}><X className="h-4 w-4" /></Button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm">{model.name}</span>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditModel(model)}><Edit className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteModelClick(model)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </>
              )}
              {!selectedBrandIdForModels && !isLoadingBrands && !isLoadingAllModels &&(
                <p className="text-sm text-muted-foreground text-center py-4">Selecciona una marca para administrar sus modelos.</p>
              )}
            </CardContent>
           </Card>
        </TabsContent>
        <TabsContent value="tipos_servicio">
           <CatalogTabContent
            storageKey={SERVICE_TYPES_STORAGE_KEY}
            itemCategory="Tipo de Servicio"
            itemNameSingular="tipo de servicio"
            defaultItemsData={defaultMockServiceTypes}
            icon={WrenchIcon}
          />
        </TabsContent>
        <TabsContent value="talleres">
           <CatalogTabContent
            storageKey={WORKSHOPS_STORAGE_KEY}
            itemCategory="Taller"
            itemNameSingular="taller"
            defaultItemsData={defaultMockWorkshops}
            icon={BookOpen}
          />
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8 bg-blue-50 border-blue-200 dark:bg-sky-900/30 dark:border-sky-700">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-sky-400" />
            <CardTitle className="text-blue-700 dark:text-sky-300 text-md">Beneficios de los Catálogos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 dark:text-sky-400 space-y-1">
            <p>Estandarizar los datos mediante catálogos mejora la calidad de la información.</p>
            <p>Facilita la entrada de datos y reduce errores.</p>
            <p>Permite generar reportes y análisis más precisos.</p>
        </CardContent>
      </Card>

       <AlertDialog open={showDeleteModelDialog} onOpenChange={setShowDeleteModelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el modelo
              "{modelToDelete?.name}" de tus catálogos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModelToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteModel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    