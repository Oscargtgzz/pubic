
"use client"; 

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Truck, ArrowDown, ArrowUp, ChevronsUpDown, Loader2, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from '@/lib/config';
import type { Vehicle } from "@/lib/types";
import { mockVehicles } from "@/lib/mock-data"; // Import mock data

type SortableVehicleKeys = 'plate' | 'brand' | 'model' | 'year' | 'status' | 'currentMileage';
const VEHICLES_STORAGE_KEY = "vehicles";

// Vehicle Card component for Grid View
const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
  <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
    <Link href={`/fleet/${vehicle.id}`} passHref legacyBehavior>
      <a className="block group">
        <div className="aspect-video w-full relative overflow-hidden bg-muted">
          <Image
            src={vehicle.photoUrl || "https://placehold.co/600x400.png"}
            alt={`Imagen de ${vehicle.brand} ${vehicle.model} (${vehicle.plate})`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={`${vehicle.brand} ${vehicle.model}`}
            unoptimized={!vehicle.photoUrl || vehicle.photoUrl.startsWith('https://placehold.co')}
          />
        </div>
      </a>
    </Link>
    <CardContent className="p-3 flex flex-col flex-grow">
      <Link href={`/fleet/${vehicle.id}`} passHref legacyBehavior>
        <a className="hover:text-primary">
          <h3 className="text-md font-semibold truncate" title={vehicle.plate}>{vehicle.plate}</h3>
        </a>
      </Link>
      <p className="text-xs text-muted-foreground truncate" title={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}>
        {vehicle.brand} {vehicle.model} - {vehicle.year}
      </p>
      <div className="mt-1">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            vehicle.status === "Operativo" ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100" :
            vehicle.status === "En Taller" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100" :
            vehicle.status === "Siniestrado" ? "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100" :
            "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
          }`}>
            {vehicle.status}
          </span>
      </div>
      <div className="mt-auto pt-2"> {/* Pushes button to bottom */}
        <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto text-xs">
          <Link href={`/fleet/${vehicle.id}`}>Ver Detalles</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);


export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableVehicleKeys | null; direction: 'ascending' | 'descending' }>({
    key: 'plate', 
    direction: 'ascending',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    document.title = `Flotilla | ${APP_NAME}`;
    setIsLoading(true);
    try {
      const storedVehiclesString = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (storedVehiclesString) {
        setVehicles(JSON.parse(storedVehiclesString));
      } else {
        setVehicles(mockVehicles);
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(mockVehicles));
      }
    } catch (error) {
      console.error("Error loading vehicles from localStorage:", error);
      setVehicles(mockVehicles);
    }
    setIsLoading(false);
  }, []);

  const requestSort = (key: SortableVehicleKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredVehicles = useMemo(() => {
    let processedItems = [...vehicles];

    if (filterText) {
      processedItems = processedItems.filter(vehicle => {
        const searchTerm = filterText.toLowerCase();
        return (
          vehicle.plate.toLowerCase().includes(searchTerm) ||
          vehicle.brand.toLowerCase().includes(searchTerm) ||
          vehicle.model.toLowerCase().includes(searchTerm) ||
          String(vehicle.year).toLowerCase().includes(searchTerm) ||
          vehicle.status.toLowerCase().includes(searchTerm) ||
          String(vehicle.currentMileage).toLowerCase().includes(searchTerm)
        );
      });
    }

    if (sortConfig.key !== null && viewMode === 'list') { // Sorting only applied in list view for now or make headers for grid view too
      processedItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        // Fallback for other types or mixed types, though Vehicle type is fairly consistent
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return processedItems;
  }, [vehicles, filterText, sortConfig, viewMode]);

  const getSortIcon = (columnKey: SortableVehicleKeys) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };
  
  const renderHeader = (label: string, key: SortableVehicleKeys) => (
    <th
      onClick={() => requestSort(key)}
      className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:bg-muted/80"
    >
      <div className="flex items-center">
        {label}
        {getSortIcon(key)}
      </div>
    </th>
  );

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Flotilla</h1>
          <p className="text-muted-foreground">Visualiza y administra todos los vehículos de tu flotilla.</p>
        </div>
        <Button asChild>
          <Link href="/fleet/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Registrar Nuevo Vehículo
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Listado de Vehículos</CardTitle>
          {(vehicles.length > 0 || filterText) && (
            <CardDescription>
              Total de vehículos registrados: {vehicles.length}. Mostrando: {sortedAndFilteredVehicles.length}.
            </CardDescription>
          )}
           <div className="mt-2 mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <Input
              type="text"
              placeholder="Filtrar vehículos (placa, marca, modelo...)"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <div className="flex items-center gap-1 self-start sm:self-center">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Vista de cuadrícula"
                title="Vista de cuadrícula"
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-2">Cargando vehículos...</p>
            </div>
          ) : sortedAndFilteredVehicles.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {sortedAndFilteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    {renderHeader("Placa", "plate")}
                    {renderHeader("Marca", "brand")}
                    {renderHeader("Modelo", "model")}
                    {renderHeader("Año", "year")}
                    {renderHeader("Estatus", "status")}
                    {renderHeader("Kilometraje", "currentMileage")}
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {sortedAndFilteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{vehicle.plate}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{vehicle.brand}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{vehicle.model}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{vehicle.year}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          vehicle.status === "Operativo" ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100" :
                          vehicle.status === "En Taller" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100" :
                          vehicle.status === "Siniestrado" ? "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100" :
                          "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{vehicle.currentMileage.toLocaleString()} km</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto">
                          <Link href={`/fleet/${vehicle.id}`}>Ver Detalles</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )
          ) : (
            <div className="py-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">
                    {filterText ? "No hay vehículos que coincidan con tu búsqueda" : "No hay vehículos registrados"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {filterText ? "Intenta con otros términos de búsqueda." : "Empieza registrando tu primer vehículo o la aplicación se poblará con datos de ejemplo."}
                </p>
                {!filterText && (
                    <div className="mt-6">
                        <Button asChild>
                            <Link href="/fleet/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> Registrar Vehículo
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}


    