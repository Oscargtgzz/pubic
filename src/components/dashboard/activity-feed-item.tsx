
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { NotificationItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, ShieldAlert, Trash2, Truck, X } from "lucide-react";

interface ActivityFeedItemProps {
  item: NotificationItem;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function getSeverityIcon(severity: NotificationItem["severity"], type: NotificationItem["type"]) {
  if (type === "Siniestro" && severity === "Critical") return <ShieldAlert className="h-5 w-5 text-destructive" />;
  switch (severity) {
    case "Critical":
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case "Warning":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "Info":
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
}

function getAvatarContent(item: NotificationItem) {
  switch (item.type) {
    case "Servicio":
      return <Truck className="h-5 w-5" />;
    case "Verificación":
      return <CheckCircle2 className="h-5 w-5" />;
    case "Siniestro":
      return <ShieldAlert className="h-5 w-5" />;
    default:
      return item.title.substring(0, 1).toUpperCase();
  }
}

export function ActivityFeedItem({ item, onMarkAsRead, onDelete }: ActivityFeedItemProps) {
  return (
    <Card className={cn(
        "mb-4 shadow-sm transition-all hover:shadow-md",
        item.isRead ? "opacity-80 bg-card/80 dark:bg-card/60" : "bg-card"
      )}>
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback className={cn(
              item.severity === "Critical" ? "bg-destructive/20 text-destructive" :
              item.severity === "Warning" ? "bg-yellow-500/20 text-yellow-600" :
              "bg-primary/10 text-primary"
            )}>
              {getAvatarContent(item)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base mb-1">{item.title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {new Date(item.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {item.vehiclePlate && ` - Vehículo: ${item.vehiclePlate}`}
            </CardDescription>
          </div>
          {getSeverityIcon(item.severity, item.type)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/90">{item.message}</p>
      </CardContent>
      {(item.link || onMarkAsRead || onDelete) && (
        <CardFooter className="pt-3 pb-4 flex justify-end items-center gap-2">
          {item.link && (
            <Button variant="outline" size="sm" asChild className="mr-auto">
              <Link href={item.link}>
                Ver Detalles
              </Link>
            </Button>
          )}
          {onMarkAsRead && !item.isRead && (
            <Button variant="ghost" size="sm" onClick={() => onMarkAsRead(item.id)}>
              Marcar como leída
            </Button>
          )}
          {onDelete && (
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
