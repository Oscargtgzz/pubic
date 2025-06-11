
"use client"; // Add "use client" for future theme switching logic with hooks

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Palette as PaletteIcon, Monitor, Sun, Moon, Save } from "lucide-react"; // Renamed Palette to avoid conflict
import Link from "next/link";
import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { useEffect, useState } from "react"; // For basic state management

// export const metadata: Metadata = { // Metadata needs to be defined in server components or via generateMetadata
//   title: `Apariencia | ${APP_NAME}`,
// };
// For client components, set title dynamically if needed or use a server component wrapper for metadata

export default function AppearanceSettingsPage() {
  // Basic state for theme selection example
  const [selectedTheme, setSelectedTheme] = useState("system");

  // Placeholder for actual theme switching logic
  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    // In a real app, you would call a function here to update the theme globally
    // e.g., using a ThemeProvider context and saving to localStorage/cookies
    console.log("Theme changed to:", theme);
    // Example: document.documentElement.classList.toggle('dark', theme === 'dark');
  };
  
  // If using next-themes or similar, this would be handled differently
  useEffect(() => {
    // This is a very basic example and not how next-themes works
    if (typeof window !== "undefined") {
        document.title = `Apariencia | ${APP_NAME}`;
        if (selectedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (selectedTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // For 'system', you'd listen to prefers-color-scheme
            // This is a simplification
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }
  }, [selectedTheme]);


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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Apariencia</h1>
          <p className="text-muted-foreground">
            Personaliza cómo se ve {APP_NAME} en tu dispositivo.
          </p>
        </div>
      </div>

      <Card className="max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaletteIcon className="h-6 w-6 text-primary" />
            <span>Seleccionar Tema</span>
          </CardTitle>
          <CardDescription>
            Elige tu tema preferido para la interfaz de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <RadioGroup 
            defaultValue={selectedTheme} 
            onValueChange={handleThemeChange}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <Label
              htmlFor="theme-light"
              className={`rounded-md border-2 p-4 hover:border-primary ${selectedTheme === 'light' ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
            >
              <div className="flex flex-col items-center gap-2">
                <Sun className="h-8 w-8" />
                <span className="font-semibold">Claro</span>
                <RadioGroupItem value="light" id="theme-light" className="sr-only"/>
              </div>
            </Label>
            <Label
              htmlFor="theme-dark"
              className={`rounded-md border-2 p-4 hover:border-primary ${selectedTheme === 'dark' ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
            >
              <div className="flex flex-col items-center gap-2">
                <Moon className="h-8 w-8" />
                <span className="font-semibold">Oscuro</span>
                 <RadioGroupItem value="dark" id="theme-dark" className="sr-only"/>
              </div>
            </Label>
             <Label
              htmlFor="theme-system"
              className={`rounded-md border-2 p-4 hover:border-primary ${selectedTheme === 'system' ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
            >
              <div className="flex flex-col items-center gap-2">
                <Monitor className="h-8 w-8" />
                <span className="font-semibold">Sistema</span>
                 <RadioGroupItem value="system" id="theme-system" className="sr-only"/>
              </div>
            </Label>
          </RadioGroup>

          <div className="rounded-md border bg-muted/50 p-4">
            <h4 className="mb-2 font-semibold">Previsualización del Tema {selectedTheme === 'light' ? 'Claro' : selectedTheme === 'dark' ? 'Oscuro' : 'del Sistema'}</h4>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">Este es un texto normal.</p>
              <p className="text-muted-foreground">Este es un texto silenciado.</p>
              <Button size="sm">Botón Primario</Button>
              <Button size="sm" variant="secondary">Botón Secundario</Button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            {/* The RadioGroup handles changes, save might be for other settings */}
            {/* <Button type="submit"> 
              <Save className="mr-2 h-4 w-4" /> Guardar Preferencias de Apariencia
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
