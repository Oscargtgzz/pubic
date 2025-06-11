
"use client";

import { useEffect, useState } from 'react';
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityFeedItem } from "@/components/dashboard/activity-feed-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, ListChecks, PlusCircle, ShieldAlert, SlidersHorizontal, Truck, Wrench, BarChart as BarChartIcon } from "lucide-react";
import type { KpiCardData, NotificationItem, Vehicle, MaintenanceEvent, Incident } from "@/lib/types";
import Link from "next/link";
import { APP_NAME } from '@/lib/config';
import { addDays, isAfter, isBefore, parseISO, differenceInDays, subDays, isValid } from 'date-fns';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Legend removed as it's not used
import { mockVehicles, mockMaintenanceEvents, mockIncidents } from "@/lib/mock-data"; // Import mock data

const VEHICLES_STORAGE_KEY = "vehicles";
const MAINTENANCE_EVENTS_STORAGE_KEY = "maintenance_events";
const INCIDENTS_STORAGE_KEY = "incidents";

function FleetStatusChart({ operational, inWorkshop, reported }: { operational: number, inWorkshop: number, reported: number }) {
  const data = [
    { name: 'Operativos', count: operational, fill: 'hsl(var(--chart-2))' },
    { name: 'En Taller', count: inWorkshop, fill: 'hsl(var(--chart-4))' },
    { name: 'Siniestrados', count: reported, fill: 'hsl(var(--chart-1))' },
  ];

  if (operational === 0 && inWorkshop === 0 && reported === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-muted/50 rounded-lg">
        <BarChartIcon className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No hay datos de vehículos para mostrar el estado.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}


export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<KpiCardData[]>([]);
  const [activityFeedItems, setActivityFeedItems] = useState<NotificationItem[]>([]);
  const [fleetStatusCounts, setFleetStatusCounts] = useState({ operational: 0, inWorkshop: 0, reported: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Dashboard | ${APP_NAME}`;
    setIsLoading(true);
    try {
      let vehicles: Vehicle[];
      const storedVehiclesString = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (storedVehiclesString) {
        vehicles = JSON.parse(storedVehiclesString);
      } else {
        vehicles = mockVehicles;
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(mockVehicles));
      }

      let maintenanceEvents: MaintenanceEvent[];
      const storedMaintenanceString = localStorage.getItem(MAINTENANCE_EVENTS_STORAGE_KEY);
      if (storedMaintenanceString) {
        maintenanceEvents = JSON.parse(storedMaintenanceString);
      } else {
        maintenanceEvents = mockMaintenanceEvents;
        localStorage.setItem(MAINTENANCE_EVENTS_STORAGE_KEY, JSON.stringify(mockMaintenanceEvents));
      }
      
      let incidents: Incident[];
      const storedIncidentsString = localStorage.getItem(INCIDENTS_STORAGE_KEY);
      if (storedIncidentsString) {
        incidents = JSON.parse(storedIncidentsString);
      } else {
        incidents = mockIncidents;
        localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(mockIncidents));
      }


      const today = new Date();
      const fifteenDaysFromNow = addDays(today, 15);
      const thirtyDaysFromNow = addDays(today, 30);

      const upcomingServiceVehicleIds = new Set<string>();
      vehicles.forEach(v => {
        if (v.nextServiceDate) {
          const nextService = parseISO(v.nextServiceDate);
          if (isValid(nextService) && isAfter(nextService, today) && isBefore(nextService, fifteenDaysFromNow)) {
            upcomingServiceVehicleIds.add(v.id);
          }
        }
      });
      maintenanceEvents.forEach(event => {
        if (event.type === "Servicio" && event.date) {
          const eventDate = parseISO(event.date + 'T00:00:00');
          if (isValid(eventDate) && isAfter(eventDate, today) && isBefore(eventDate, fifteenDaysFromNow)) {
            upcomingServiceVehicleIds.add(event.vehicleId);
          }
        }
      });

      const overdueServiceVehicleIds = new Set<string>();
      vehicles.forEach(v => {
        if (v.nextServiceDate) {
          const nextService = parseISO(v.nextServiceDate);
          if (isValid(nextService) && isBefore(nextService, today)) {
            overdueServiceVehicleIds.add(v.id);
          }
        }
        if (v.nextServiceMileage && v.currentMileage >= v.nextServiceMileage) {
           overdueServiceVehicleIds.add(v.id);
        }
      });
      
      const vehicleServiceEventDates: Record<string, Date[]> = {};
      maintenanceEvents.forEach(event => {
        if (event.type === "Servicio" && event.date) {
          if (!vehicleServiceEventDates[event.vehicleId]) vehicleServiceEventDates[event.vehicleId] = [];
          vehicleServiceEventDates[event.vehicleId].push(parseISO(event.date + 'T00:00:00'));
        }
      });
      for (const vehicleId in vehicleServiceEventDates) {
        if (overdueServiceVehicleIds.has(vehicleId)) continue; 
        const serviceDates = vehicleServiceEventDates[vehicleId].sort((a,b) => b.getTime() - a.getTime());
        if (serviceDates.length > 0 && isValid(serviceDates[0]) && isBefore(serviceDates[0], today)) {
          const vehicle = vehicles.find(v => v.id === vehicleId);
          let isTrulyOverdueBasedOnEvents = true;
          if (vehicle) {
            if (vehicle.nextServiceDate && isValid(parseISO(vehicle.nextServiceDate)) && isAfter(parseISO(vehicle.nextServiceDate), today)) {
              isTrulyOverdueBasedOnEvents = false;
            }
            if (vehicle.nextServiceMileage && vehicle.currentMileage < vehicle.nextServiceMileage) {
              isTrulyOverdueBasedOnEvents = false;
            }
          }
          if(isTrulyOverdueBasedOnEvents) {
            overdueServiceVehicleIds.add(vehicleId);
          }
        }
      }


      const upcomingVerificationVehicleIds = new Set<string>();
      vehicles.forEach(v => {
        if (v.nextVerificationDate) {
          const nextVerification = parseISO(v.nextVerificationDate);
          if (isValid(nextVerification) && isAfter(nextVerification, today) && isBefore(nextVerification, thirtyDaysFromNow)) {
            upcomingVerificationVehicleIds.add(v.id);
          }
        }
      });
       maintenanceEvents.forEach(event => {
        if (event.type === "Verificación" && event.date) {
          const eventDate = parseISO(event.date + 'T00:00:00');
          if (isValid(eventDate) && isAfter(eventDate, today) && isBefore(eventDate, thirtyDaysFromNow)) {
            upcomingVerificationVehicleIds.add(event.vehicleId);
          }
        }
      });

      const activeIncidents = incidents.filter(incident => incident.status !== "Cerrado").length;

      setKpiData([
        { title: "Servicios Próximos", value: upcomingServiceVehicleIds.size, description: "En los próximos 15 días", iconName: "Wrench", actionLink: "/maintenance?filter=upcoming_services", actionText: "Ver Servicios", colorClass: "text-yellow-600" },
        { title: "Servicios Vencidos", value: overdueServiceVehicleIds.size, description: "Requieren atención", iconName: "Wrench", actionLink: "/maintenance?filter=overdue_services", actionText: "Ver Servicios", colorClass: "text-destructive" },
        { title: "Verificaciones Próximas", value: upcomingVerificationVehicleIds.size, description: "En los próximos 30 días", iconName: "CheckCircle", actionLink: "/maintenance?filter=upcoming_verifications", actionText: "Ver Verificaciones" },
        { title: "Siniestros Activos", value: activeIncidents, description: "En proceso de resolución", iconName: "ShieldAlert", actionLink: "/incidents?filter=active", actionText: "Ver Siniestros" },
      ]);

      const allEvents = [
        ...maintenanceEvents.map(e => ({ ...e, eventDate: e.date, eventType: 'Maintenance' as const })),
        ...incidents.map(i => ({ ...i, eventDate: i.date, eventType: 'Incident' as const }))
      ].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

      const recentActivities: NotificationItem[] = allEvents.slice(0, 5).map((event, index) => {
        const vehicle = vehicles.find(v => v.id === event.vehicleId);
        const plate = vehicle ? vehicle.plate : 'N/A';
        if (event.eventType === 'Maintenance') {
          const me = event as MaintenanceEvent;
          return {
            id: `activity-m-${me.id || index}`,
            type: me.type === "Servicio" ? "Servicio" : "Verificación",
            title: `${me.type} ${me.date && differenceInDays(parseISO(me.date + 'T00:00:00'), today) < 0 ? 'Realizado' : 'Programado'}: ${plate}`,
            message: `${me.serviceType} para ${plate} el ${new Date(me.date + 'T00:00:00').toLocaleDateString()}. Kilometraje: ${me.mileage.toLocaleString()} km.`,
            date: me.lastUpdated || me.date,
            isRead: false, 
            link: `/fleet/${me.vehicleId}`,
            severity: "Info",
            vehiclePlate: plate,
          };
        } else {
          const inc = event as Incident;
          return {
            id: `activity-i-${inc.id || index}`,
            type: "Siniestro",
            title: `Siniestro ${inc.status}: ${plate}`,
            message: `${inc.description.substring(0,50)}... para ${plate} el ${new Date(inc.date + 'T00:00:00').toLocaleDateString()}.`,
            date: inc.lastUpdated || inc.date,
            isRead: false, 
            link: `/fleet/${inc.vehicleId}`,
            severity: inc.status === "Cerrado" ? "Info" : "Warning",
            vehiclePlate: plate,
          };
        }
      });
      setActivityFeedItems(recentActivities);
      
      let op = 0, workshop = 0, reported = 0;
      vehicles.forEach(v => {
        if (v.status === "Operativo") op++;
        else if (v.status === "En Taller") workshop++;
        else if (v.status === "Siniestrado") reported++;
      });
      setFleetStatusCounts({ operational: op, inWorkshop: workshop, reported: reported });

    } catch (error) {
      console.error("Error loading dashboard data from localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
        <div className="container mx-auto py-2 text-center">
            <p>Cargando dashboard...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Centro de Control Inteligente</h1>
          <p className="text-muted-foreground">Resumen del estado actual de tu flotilla.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/fleet/new"><PlusCircle className="mr-2 h-4 w-4" /> Registrar Vehículo</Link>
          </Button>
          <Button asChild>
            <Link href="/fleet"><Truck className="mr-2 h-4 w-4" /> Ver Flotilla</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} data={kpi} />
        ))}
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Actividad Reciente y Alertas</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/notifications"><Bell className="mr-2 h-4 w-4" /> Ver Todas</Link>
              </Button>
            </div>
            <CardDescription>Alertas críticas y actualizaciones importantes.</CardDescription>
          </CardHeader>
          <CardContent>
            {activityFeedItems.length > 0 ? (
              <ScrollArea className="h-[400px] pr-3"> 
                {activityFeedItems.map((item) => (
                  <ActivityFeedItem key={item.id} item={item} />
                ))}
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ListChecks className="mx-auto h-12 w-12 mb-4" />
                <p>No hay actividad reciente o alertas pendientes.</p>
                <p className="text-sm">Intenta registrar vehículos, mantenimientos o siniestros para ver actividad aquí.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Estado General de la Flotilla</CardTitle>
              <CardDescription>Distribución de vehículos por estado.</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
               <FleetStatusChart {...fleetStatusCounts} />
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/maintenance/new"><Wrench className="mr-2 h-4 w-4" /> Registrar Mantenimiento</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                 <Link href="/incidents/new"><ShieldAlert className="mr-2 h-4 w-4" /> Registrar Siniestro</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/settings/maintenance-rules"><SlidersHorizontal className="mr-2 h-4 w-4" /> Configurar Reglas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
