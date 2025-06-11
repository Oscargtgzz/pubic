
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog, Upload, BookOpen, GanttChartSquare, UsersIcon, BellRing, Palette } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: `Configuración | ${APP_NAME}`,
};

const settingsLinks = [
  { href: "/settings/import", icon: Upload, title: "Importar Datos", description: "Importa vehículos y datos desde Excel." },
  { href: "/settings/catalogs", icon: BookOpen, title: "Catálogos Maestros", description: "Gestiona marcas, modelos, talleres, etc." },
  { href: "/settings/maintenance-rules", icon: GanttChartSquare, title: "Reglas de Mantenimiento", description: "Define intervalos y tipos de servicio." },
  { href: "/settings/notifications", icon: BellRing, title: "Notificaciones", description: "Configura alertas y recordatorios." },
  { href: "/settings/appearance", icon: Palette, title: "Apariencia", description: "Personaliza el tema de la aplicación." },
  // { href: "/settings/users", icon: UsersIcon, title: "Usuarios y Permisos", description: "Administra el acceso de usuarios." },
];

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración de la Aplicación</h1>
        <p className="text-muted-foreground">
          Personaliza {APP_NAME} según tus necesidades.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsLinks.map((item) => (
          <Link href={item.href} key={item.title} legacyBehavior passHref>
            <a className="block hover:no-underline">
              <Card className="h-full shadow-lg hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col">
                <CardHeader className="flex-row items-center gap-4 pb-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
       <Card className="mt-8 shadow-lg">
        <CardHeader>
            <CardTitle>Otras Configuraciones</CardTitle>
            <CardDescription>Más opciones de personalización estarán disponibles aquí.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                (Integraciones, gestión de cuenta, etc.)
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
