
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Edit, Trash2, Save, X, Loader2, Building, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CatalogItem as StoredCatalogItem } from "@/lib/types"; 
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CatalogManagerProps {
  storageKey: string;
  itemCategory: string; 
  itemNameSingular: string; 
  defaultItemsData?: StoredCatalogItem[];
  icon: React.ComponentType<{ className?: string }>;
  displayMode?: 'list' | 'grid';
}

const CatalogItemCard = ({ 
  item, 
  itemCategory, 
  onEdit, 
  onDelete,
  icon: IconComp 
}: { 
  item: StoredCatalogItem; 
  itemCategory: string; 
  onEdit: (item: StoredCatalogItem) => void; 
  onDelete: (item: StoredCatalogItem) => void;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <IconComp className="h-4 w-4 text-primary" />
          {item.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-xs space-y-1 text-muted-foreground pt-0 pb-2">
        {itemCategory === "Taller" && (
          <>
            {item.managerName && <p className="flex items-center gap-1"><Building className="h-3 w-3"/> Enc: {item.managerName}</p>}
            {item.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3"/> Tel: {item.phone}</p>}
          </>
        )}
      </CardContent>
      <CardFooter className="pt-2 pb-3 flex justify-end gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};


export function CatalogManager({
  storageKey,
  itemCategory,
  itemNameSingular,
  defaultItemsData = [],
  icon: Icon,
  displayMode = 'list',
}: CatalogManagerProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<StoredCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newItemName, setNewItemName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");

  const [newItemManagerName, setNewItemManagerName] = useState("");
  const [newItemAddress, setNewItemAddress] = useState("");
  const [newItemCity, setNewItemCity] = useState("");
  const [newItemState, setNewItemState] = useState("");
  const [newItemPhone, setNewItemPhone] = useState("");
  const [newItemEmail, setNewItemEmail] = useState("");

  const [editingItemManagerName, setEditingItemManagerName] = useState("");
  const [editingItemAddress, setEditingItemAddress] = useState("");
  const [editingItemCity, setEditingItemCity] = useState("");
  const [editingItemStateProp, setEditingItemStateProp] = useState("");
  const [editingItemPhone, setEditingItemPhone] = useState("");
  const [editingItemEmail, setEditingItemEmail] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StoredCatalogItem | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        setItems(JSON.parse(storedData));
      } else if (defaultItemsData.length > 0) {
        setItems(defaultItemsData); 
        localStorage.setItem(storageKey, JSON.stringify(defaultItemsData));
      } else {
        setItems([]); 
      }
    } catch (error) {
      console.error(`Error loading ${itemNameSingular}s from localStorage:`, error);
      toast({
        title: `Error al cargar ${itemNameSingular}s`,
        description: `No se pudieron cargar los datos. Usando lista vacía.`,
        variant: "destructive",
      });
      setItems([]);
    }
    setIsLoading(false);
  }, [storageKey, itemNameSingular, defaultItemsData, toast]);

  const saveItemsToStorage = (updatedItems: StoredCatalogItem[]) => {
    localStorage.setItem(storageKey, JSON.stringify(updatedItems));
  };

  const clearNewItemWorkshopFields = () => {
    setNewItemManagerName("");
    setNewItemAddress("");
    setNewItemCity("");
    setNewItemState("");
    setNewItemPhone("");
    setNewItemEmail("");
  };

  const clearEditingItemWorkshopFields = () => {
    setEditingItemManagerName("");
    setEditingItemAddress("");
    setEditingItemCity("");
    setEditingItemStateProp("");
    setEditingItemPhone("");
    setEditingItemEmail("");
  }

  const handleAddItem = () => {
    if (newItemName.trim() === "") {
      toast({ title: "Error", description: `El nombre de la ${itemNameSingular} no puede estar vacío.`, variant: "destructive" });
      return;
    }
    if (items.some(item => item.name.toLowerCase() === newItemName.trim().toLowerCase())) {
      toast({ title: "Error", description: `La ${itemNameSingular} "${newItemName.trim()}" ya existe.`, variant: "destructive" });
      return;
    }
    
    const newItem: StoredCatalogItem = { 
      id: crypto.randomUUID(), 
      name: newItemName.trim() 
    };

    if (itemCategory === "Taller") {
      newItem.managerName = newItemManagerName.trim() || undefined;
      newItem.address = newItemAddress.trim() || undefined;
      newItem.city = newItemCity.trim() || undefined;
      newItem.state = newItemState.trim() || undefined;
      newItem.phone = newItemPhone.trim() || undefined;
      newItem.email = newItemEmail.trim() || undefined;
    }

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    saveItemsToStorage(updatedItems);
    setNewItemName("");
    if (itemCategory === "Taller") clearNewItemWorkshopFields();
    toast({ title: `${itemCategory} agregada`, description: `La ${itemNameSingular} "${newItem.name}" ha sido agregada.` });
  };

  const handleEditItem = (item: StoredCatalogItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
    if (itemCategory === "Taller") {
      setEditingItemManagerName(item.managerName || "");
      setEditingItemAddress(item.address || "");
      setEditingItemCity(item.city || "");
      setEditingItemStateProp(item.state || "");
      setEditingItemPhone(item.phone || "");
      setEditingItemEmail(item.email || "");
    }
  };

  const handleSaveEdit = () => {
    if (editingItemName.trim() === "" || !editingItemId) return;
    if (items.some(item => item.name.toLowerCase() === editingItemName.trim().toLowerCase() && item.id !== editingItemId)) {
      toast({ title: "Error", description: `Otra ${itemNameSingular} con el nombre "${editingItemName.trim()}" ya existe.`, variant: "destructive" });
      return;
    }
    
    const updatedItems = items.map(item => {
      if (item.id === editingItemId) {
        const updatedItem: StoredCatalogItem = { ...item, name: editingItemName.trim() };
        if (itemCategory === "Taller") {
          updatedItem.managerName = editingItemManagerName.trim() || undefined;
          updatedItem.address = editingItemAddress.trim() || undefined;
          updatedItem.city = editingItemCity.trim() || undefined;
          updatedItem.state = editingItemStateProp.trim() || undefined;
          updatedItem.phone = editingItemPhone.trim() || undefined;
          updatedItem.email = editingItemEmail.trim() || undefined;
        }
        return updatedItem;
      }
      return item;
    });

    setItems(updatedItems);
    saveItemsToStorage(updatedItems);
    setEditingItemId(null);
    setEditingItemName("");
    if (itemCategory === "Taller") clearEditingItemWorkshopFields();
    toast({ title: `${itemCategory} actualizada`, description: `La ${itemNameSingular} ha sido actualizada.` });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemName("");
    if (itemCategory === "Taller") clearEditingItemWorkshopFields();
  };

  const handleDeleteItem = (item: StoredCatalogItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    const updatedItems = items.filter(item => item.id !== itemToDelete.id);
    setItems(updatedItems);
    saveItemsToStorage(updatedItems);
    setShowDeleteDialog(false);
    toast({ title: `${itemCategory} eliminada`, description: `La ${itemNameSingular} "${itemToDelete.name}" ha sido eliminada.` });
    setItemToDelete(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" /> {itemCategory}s
          </CardTitle>
          <CardDescription>Cargando {itemNameSingular}s...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const workshopFormFields = (
    isEditing: boolean, 
    nameVal: string, onNameChange: (val: string) => void,
    managerNameVal: string, onManagerNameChange: (val: string) => void,
    addressVal: string, onAddressChange: (val: string) => void,
    cityVal: string, onCityChange: (val: string) => void,
    stateVal: string, onStateChange: (val: string) => void,
    phoneVal: string, onPhoneChange: (val: string) => void,
    emailVal: string, onEmailChange: (val: string) => void
    ) => (
    <div className="space-y-3">
      <div>
        <Label htmlFor={isEditing ? "editing-workshop-name" : "new-workshop-name"}>Nombre del Taller *</Label>
        <Input
          id={isEditing ? "editing-workshop-name" : "new-workshop-name"}
          placeholder="Nombre del taller"
          value={nameVal}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
            <Label htmlFor={isEditing ? "editing-workshop-manager" : "new-workshop-manager"}>Nombre del Encargado</Label>
            <Input id={isEditing ? "editing-workshop-manager" : "new-workshop-manager"} placeholder="Juan Pérez" value={managerNameVal} onChange={(e) => onManagerNameChange(e.target.value)} />
        </div>
        <div>
            <Label htmlFor={isEditing ? "editing-workshop-phone" : "new-workshop-phone"}>Teléfono</Label>
            <Input id={isEditing ? "editing-workshop-phone" : "new-workshop-phone"} placeholder="55-1234-5678" value={phoneVal} onChange={(e) => onPhoneChange(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor={isEditing ? "editing-workshop-address" : "new-workshop-address"}>Domicilio Completo</Label>
        <Input id={isEditing ? "editing-workshop-address" : "new-workshop-address"} placeholder="Av. Siempre Viva 123, Col. Springfield" value={addressVal} onChange={(e) => onAddressChange(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
            <Label htmlFor={isEditing ? "editing-workshop-city" : "new-workshop-city"}>Ciudad</Label>
            <Input id={isEditing ? "editing-workshop-city" : "new-workshop-city"} placeholder="Ciudad" value={cityVal} onChange={(e) => onCityChange(e.target.value)} />
        </div>
        <div>
            <Label htmlFor={isEditing ? "editing-workshop-state" : "new-workshop-state"}>Estado</Label>
            <Input id={isEditing ? "editing-workshop-state" : "new-workshop-state"} placeholder="Estado" value={stateVal} onChange={(e) => onStateChange(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor={isEditing ? "editing-workshop-email" : "new-workshop-email"}>Correo Electrónico</Label>
        <Input id={isEditing ? "editing-workshop-email" : "new-workshop-email"} type="email" placeholder="contacto@taller.com" value={emailVal} onChange={(e) => onEmailChange(e.target.value)} />
      </div>
    </div>
  );


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" /> {itemCategory}s
        </CardTitle>
        <CardDescription>Gestiona los elementos del catálogo de {itemNameSingular}s.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-md">
          <h4 className="text-md font-semibold mb-3">{editingItemId ? `Editando ${itemNameSingular}` : `Agregar Nueva ${itemCategory}`}</h4>
          {itemCategory === "Taller" ? (
            workshopFormFields(
              !!editingItemId,
              editingItemId ? editingItemName : newItemName,
              editingItemId ? setEditingItemName : setNewItemName,
              editingItemId ? editingItemManagerName : newItemManagerName,
              editingItemId ? setEditingItemManagerName : setNewItemManagerName,
              editingItemId ? editingItemAddress : newItemAddress,
              editingItemId ? setEditingItemAddress : setNewItemAddress,
              editingItemId ? editingItemCity : newItemCity,
              editingItemId ? setEditingItemCity : setNewItemCity,
              editingItemId ? editingItemStateProp : newItemState,
              editingItemId ? setEditingItemStateProp : setNewItemState,
              editingItemId ? editingItemPhone : newItemPhone,
              editingItemId ? setEditingItemPhone : setNewItemPhone,
              editingItemId ? editingItemEmail : newItemEmail,
              editingItemId ? setEditingItemEmail : setNewItemEmail
            )
          ) : (
            <Input
              placeholder={`Nombre de la ${itemNameSingular}...`}
              value={editingItemId ? editingItemName : newItemName}
              onChange={(e) => editingItemId ? setEditingItemName(e.target.value) : setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (editingItemId ? handleSaveEdit() : handleAddItem())}
            />
          )}
          <div className="flex gap-2 mt-3 justify-end">
            {editingItemId && (
                <Button variant="outline" size="sm" onClick={handleCancelEdit}><X className="mr-2 h-4 w-4" />Cancelar</Button>
            )}
            <Button size="sm" onClick={editingItemId ? handleSaveEdit : handleAddItem}>
              {editingItemId 
                ? <><Save className="mr-2 h-4 w-4" />Guardar Cambios</>
                : <><PlusCircle className="mr-2 h-4 w-4" />Agregar</>
              }
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No hay {itemNameSingular}s registradas.</p>
        ) : displayMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <CatalogItemCard 
                key={item.id} 
                item={item} 
                itemCategory={itemCategory}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                icon={Icon}
              />
            ))}
          </div>
        ) : (
          <ScrollArea className="h-60 border rounded-md p-2">
            <ul className="space-y-1">
              {items.map(item => (
                <li key={item.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md">
                  {itemCategory === "Taller" ? (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      {item.managerName && <p className="text-xs text-muted-foreground">Enc: {item.managerName}</p>}
                      {item.phone && <p className="text-xs text-muted-foreground">Tel: {item.phone}</p>}
                       {(item.city || item.state ) && <p className="text-xs text-muted-foreground">Ubicación: {item.city}{item.city && item.state && ", "}{item.state}</p>}
                    </div>
                  ) : (
                    <span className="text-sm">{item.name}</span>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditItem(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteItem(item)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la {itemNameSingular}
              "{itemToDelete?.name}" de tus catálogos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {setItemToDelete(null); setShowDeleteDialog(false);}}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

    