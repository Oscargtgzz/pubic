import type { SidebarNavItem } from "@/lib/types";
import { LayoutDashboard, Truck, Wrench, AlertTriangle, Brain, ListChecks, Activity, Settings, Upload, BookOpen, ListTodo, UsersIcon, GanttChartSquare, Cog } from "lucide-react";

export const APP_NAME = "FleetFox";
export const APP_DESCRIPTION = "Gestión Inteligente de Flotillas";

export const mainNavItems: SidebarNavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/fleet", icon: Truck, label: "Flotilla" },
  { href: "/maintenance", icon: Wrench, label: "Mantenimiento" },
  { href: "/incidents", icon: AlertTriangle, label: "Siniestros" },
  {
    label: "Herramientas IA",
    icon: Brain,
    isCollapsible: true,
    subItems: [
      { href: "/ai-tools/prioritize-issues", icon: ListChecks, label: "Priorizar Problemas" },
      { href: "/ai-tools/predictive-maintenance", icon: Activity, label: "Predicción IA" },
    ],
  },
];

export const settingsNavItems: SidebarNavItem[] = [
 { href: "/settings", icon: Cog, label: "General" }, // Using Cog instead of Settings for variety
 { href: "/settings/import", icon: Upload, label: "Importar Datos" },
 { href: "/settings/catalogs", icon: BookOpen, label: "Catálogos" },
 { href: "/settings/maintenance-rules", icon: GanttChartSquare, label: "Reglas de Mantenimiento" },
 { href: "/settings/notifications", icon: ListTodo, label: "Notificaciones" }, // Assuming ListTodo was intended, changed from BellRing in previous state if different
 { href: "/settings/appearance", icon: Cog, label: "Apariencia" }, // Assuming Cog was intended, changed from Palette in previous state if different
 // { href: "/settings/users", icon: UsersIcon, label: "Usuarios y Permisos", description: "Administra el acceso de usuarios." },
];
