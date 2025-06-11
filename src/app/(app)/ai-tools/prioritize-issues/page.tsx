
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ListChecks, Zap, InfoIcon } from "lucide-react";
import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: `Priorizar Problemas IA | ${APP_NAME}`,
};

export default function PrioritizeIssuesPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Priorizar Problemas con IA</h1>
        <p className="text-muted-foreground">
          Utiliza IA para analizar datos históricos y obtener una lista priorizada de problemas de mantenimiento.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>Herramienta de Priorización IA</span>
          </CardTitle>
          <CardDescription>
            Esta herramienta te ayudará a identificar qué problemas de mantenimiento requieren atención urgente.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200 dark:bg-sky-900/30 dark:border-sky-700">
              <InfoIcon className="h-5 w-5 text-blue-600 dark:text-sky-400" />
              <AlertTitle className="text-blue-700 dark:text-sky-300">Funcionalidad Avanzada en Desarrollo</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-sky-400">
                La función de Priorización de Problemas con IA utilizará modelos de lenguaje avanzados (Genkit) para analizar
                datos históricos de mantenimiento de toda la flotilla y generar una lista priorizada de problemas que
                necesitan atención inmediata. Esto ayudará a optimizar recursos y prevenir fallas mayores.
                Actualmente en planificación, ¡próximamente disponible!
              </AlertDescription>
            </Alert>
          <div className="space-y-4">
            <p>
              Proporciona los datos históricos de mantenimiento (ej. un extracto de tu Excel o datos del sistema) 
              para que la IA genere un reporte de prioridades.
            </p>
            {/* Example form elements - to be implemented */}
            {/* <Textarea placeholder="Pega aquí los datos históricos de mantenimiento..." rows={10} /> */}
            <Button disabled> {/* Enable when functionality is ready */}
              <Zap className="mr-2 h-4 w-4" /> Analizar y Priorizar (Próximamente)
            </Button>
          </div>
          <div className="mt-6 rounded-lg border bg-muted/30 p-6">
            <h4 className="mb-3 flex items-center text-lg font-semibold">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              Resultados de Priorización (Ejemplo)
            </h4>
            <p className="text-sm text-muted-foreground">
              Aquí se mostrarán los problemas priorizados por la IA.
            </p>
            {/* Placeholder for results */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
