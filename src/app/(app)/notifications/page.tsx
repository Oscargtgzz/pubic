
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellRing, CheckCheck, Filter, Trash2, Loader2 } from "lucide-react";
import { APP_NAME } from '@/lib/config';
import type { NotificationItem } from "@/lib/types";
import { ActivityFeedItem } from "@/components/dashboard/activity-feed-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mockNotifications } from "@/lib/mock-data"; // Import mock data

const NOTIFICATIONS_STORAGE_KEY = "fleetfox_notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    document.title = `Notificaciones | ${APP_NAME}`;
    setIsLoading(true);
    try {
      const storedNotificationsString = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotificationsString) {
        setNotifications(JSON.parse(storedNotificationsString));
      } else {
        setNotifications(mockNotifications);
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(mockNotifications));
      }
    } catch (error) {
      console.error("Error loading notifications from localStorage:", error);
      toast({
        title: "Error al cargar notificaciones",
        description: "No se pudieron cargar las notificaciones.",
        variant: "destructive",
      });
      setNotifications(mockNotifications); 
    }
    setIsLoading(false);
  }, [toast]);

  const updateNotificationsInStorage = (updatedNotifications: NotificationItem[]) => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prevNotifications => {
      const updated = prevNotifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      updateNotificationsInStorage(updated);
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => {
      const updated = prevNotifications.map(n => ({ ...n, isRead: true }));
      updateNotificationsInStorage(updated);
      return updated;
    });
    toast({ title: "Éxito", description: "Todas las notificaciones visibles marcadas como leídas." });
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prevNotifications => {
        const updated = prevNotifications.filter(n => n.id !== notificationId);
        updateNotificationsInStorage(updated);
        return updated;
    });
    toast({ title: "Notificación eliminada", variant: "default" });
  };
  
  const handleDeleteAllRead = () => {
     setNotifications(prevNotifications => {
        const unreadOnly = prevNotifications.filter(n => !n.isRead);
        updateNotificationsInStorage(unreadOnly);
        return unreadOnly;
    });
    toast({ title: "Notificaciones leídas eliminadas", variant: "default" });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
        <div className="container mx-auto py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Cargando notificaciones...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Centro de Notificaciones</h1>
        <p className="text-muted-foreground">
          Mantente al día con todas las alertas y actualizaciones importantes de tu flotilla.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-6 w-6 text-primary" />
                <span>Todas las Notificaciones</span>
              </CardTitle>
              <CardDescription className="mt-1">
                ({filteredNotifications.filter(n => !n.isRead).length} no leídas)
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filter} onValueChange={(value) => setFilter(value as "all" | "unread" | "read")}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">No Leídas</SelectItem>
                  <SelectItem value="read">Leídas</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={filteredNotifications.every(n => n.isRead) || filteredNotifications.filter(n => !n.isRead).length === 0}>
                <CheckCheck className="mr-2 h-4 w-4" /> Marcar Todas Como Leídas
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDeleteAllRead} disabled={notifications.filter(n => n.isRead).length === 0}>
                <Trash2 className="mr-2 h-4 w-4" /> Limpiar Leídas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-290px)]"> 
              <div className="p-4 sm:p-6 space-y-4">
                {filteredNotifications.map((item) => (
                  <ActivityFeedItem 
                    key={item.id} 
                    item={item} 
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-20 text-center">
              <BellRing className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                {filter === "all" && notifications.length === 0 ? "No Tienes Notificaciones" : "No Hay Notificaciones Para Mostrar"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filter === "all" && notifications.length === 0 ? "Cuando haya algo importante, lo verás aquí. La aplicación se poblará con datos de ejemplo." : "Ajusta los filtros o espera nuevas alertas."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
