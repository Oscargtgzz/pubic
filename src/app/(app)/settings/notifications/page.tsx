
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BellRing, Save, Eye } from "lucide-react"; // Replaced BellCog with BellRing
import Link from "next/link";
import { APP_NAME } from '@/lib/config';
import { Separator } from "@/components/ui/separator";
import type { NotificationPreferences } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { mockNotificationPreferences } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image"; // Import next/image

const NOTIFICATION_PREFERENCES_KEY = "fleetfox_notification_preferences";

const notificationSettingsConfig = [
  {
    category: "Mantenimiento",
    items: [
      { id: "maintenance_upcoming", label: "Servicios Próximos", description: "Recibir alertas para servicios de mantenimiento que se acercan." },
      { id: "maintenance_overdue", label: "Servicios Vencidos", description: "Recibir alertas para servicios de mantenimiento que han vencido." },
      { id: "verification_upcoming", label: "Verificaciones Próximas", description: "Recibir alertas para verificaciones vehiculares próximas." },
    ]
  },
  {
    category: "Siniestros",
    items: [
      { id: "incident_new", label: "Nuevos Siniestros Reportados", description: "Notificación cuando se registra un nuevo siniestro para un vehículo." },
      { id: "incident_status_update", label: "Actualizaciones de Estado de Siniestros", description: "Recibir alertas sobre cambios en el estado de un siniestro." },
    ]
  },
  {
    category: "General",
    items: [
      { id: "document_expiry", label: "Vencimiento de Documentos", description: "Alertas para pólizas de seguro, tarjetas de circulación, etc., que están por vencer." },
    ]
  }
];

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(mockNotificationPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Configurar Notificaciones | ${APP_NAME}`;
    setIsLoading(true);
    try {
      const storedPreferences = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      } else {
        setPreferences(mockNotificationPreferences);
        localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(mockNotificationPreferences));
         toast({
          title: "Preferencias Inicializadas",
          description: "Se cargaron preferencias de notificación de ejemplo.",
        });
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
      setPreferences(mockNotificationPreferences);
    }
    setIsLoading(false);
  }, [toast]);

  const handlePreferenceChange = (id: string, checked: boolean) => {
    setPreferences(prev => ({ ...prev, [id]: checked }));
  };

  const handleSaveChanges = () => {
    try {
      localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
      toast({
        title: "Preferencias Guardadas",
        description: "Tus configuraciones de notificación han sido actualizadas.",
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({
        title: "Error al Guardar",
        description: "No se pudieron guardar tus preferencias. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-2 text-center"><p>Cargando configuraciones...</p></div>;
  }

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración de Notificaciones</h1>
          <p className="text-muted-foreground">
            Elige qué alertas y recordatorios deseas recibir.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-6 w-6 text-primary" />
                <span>Preferencias de Notificación</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Gestiona cómo y cuándo te notificamos sobre eventos importantes de tu flotilla.
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver plantilla de correo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl p-0 max-h-[85vh] flex flex-col">
                <DialogHeader className="p-6 pb-0 flex-shrink-0">
                  <DialogTitle className="text-center text-xl">Vista Previa de Plantilla de Correo</DialogTitle>
                  <DialogDescription className="text-center">
                    Así es como se vería una notificación de ejemplo.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
                  <div className="max-w-xl mx-auto bg-card rounded-lg shadow-lg overflow-hidden">
                    {/* Email Header */}
                    <div className="p-6 text-center border-b">
                        <h1 className="text-3xl font-bold text-primary">{APP_NAME}</h1>
                    </div>
                    
                    {/* Placeholder Hero Image Area */}
                    <div className="bg-muted/20">
                      <Image
                        src="https://placehold.co/600x250.png?text=Imagen+del+Veh%C3%ADculo" 
                        alt="Imagen del Vehículo (Placeholder)"
                        width={600}
                        height={250}
                        className="w-full object-cover"
                        data-ai-hint="vehicle service"
                        unoptimized
                      />
                    </div>

                    {/* Email Body */}
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="text-center">
                            <p className="text-sm uppercase tracking-wider text-primary font-semibold break-words">RECORDATORIO IMPORTANTE</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1 break-words">
                                Alerta de Mantenimiento: [PLACA-VEHICULO]
                            </h2>
                        </div>
                        
                        <p className="text-muted-foreground text-center break-words">
                            Texto de introducción o resumen del motivo de la notificación. Por ejemplo: Se ha detectado un próximo mantenimiento o una alerta importante para uno de tus vehículos.
                        </p>
                        
                        <Separator />

                        <div className="space-y-4">
                            <p className="text-foreground break-words">Estimado/a [Nombre del Usuario],</p>
                            <p className="text-muted-foreground break-words">
                                Le recordamos que el vehículo <strong className="text-foreground break-words">[Marca Modelo (PLACA-VEHICULO)]</strong> tiene un evento de mantenimiento próximo o requiere su atención:
                            </p>
                            
                            <div className="p-4 border bg-background rounded-md shadow-sm space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1">
                                    <p className="text-sm font-semibold text-primary break-words sm:col-span-1">Tipo de Evento:</p>
                                    <p className="text-muted-foreground break-words sm:col-span-2">[Tipo de Mantenimiento/Siniestro/etc.]</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1">
                                    <p className="text-sm font-semibold text-primary break-words sm:col-span-1">Fecha Programada/Detectada:</p>
                                    <p className="text-muted-foreground break-words sm:col-span-2">[Fecha del Evento]</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1">
                                    <p className="text-sm font-semibold text-primary break-words sm:col-span-1">Detalles Adicionales:</p>
                                    <p className="text-muted-foreground break-words sm:col-span-2">[Descripción detallada del evento, servicio requerido, o alerta específica...]</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center pt-4">
                            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <a href="#ver-detalles">Ver Detalles en {APP_NAME}</a>
                            </Button>
                        </div>
                    </div>

                    {/* Email Footer */}
                    <div className="p-6 border-t bg-muted/50 text-center text-xs text-muted-foreground space-y-2">
                        <p className="break-words">Atentamente,<br />El equipo de {APP_NAME}</p>
                        <p>
                            <a href="#preferencias" className="hover:underline text-primary break-words">Administrar Preferencias de Notificación</a>
                        </p>
                        <p className="break-words">&copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</p>
                        <p className="break-words">
                            [Dirección de la Empresa, si aplica]<br />
                            Recibiste este correo porque estás suscrito a las alertas de {APP_NAME}.
                        </p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="p-6 pt-4 flex-shrink-0">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cerrar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {notificationSettingsConfig.map((category, index) => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold mb-3 text-foreground">{category.category}</h3>
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <Label htmlFor={item.id} className="text-base font-medium">
                        {item.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      id={item.id}
                      checked={preferences[item.id as keyof NotificationPreferences] || false}
                      onCheckedChange={(checked) => handlePreferenceChange(item.id, checked)}
                    />
                  </div>
                ))}
              </div>
              {index < notificationSettingsConfig.length - 1 && <Separator className="my-6" />}
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button type="button" onClick={handleSaveChanges}>
              <Save className="mr-2 h-4 w-4" /> Guardar Preferencias
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
    
