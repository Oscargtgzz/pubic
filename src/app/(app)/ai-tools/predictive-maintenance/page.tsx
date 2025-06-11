
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Activity, Zap, InfoIcon } from "lucide-react";
import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: `Predicción de Mantenimiento IA | ${APP_NAME}`,
};

export default function PredictiveMaintenancePage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Predicción de Mantenimiento con IA</h1>
        <p className="text-muted-foreground">
          Analiza el historial de un vehículo para predecir posibles fallas y optimizar el servicio.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>Herramienta de Predicción IA</span>
          </CardTitle>
          <CardDescription>
            Selecciona un vehículo y proporciona su historial para obtener predicciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200 dark:bg-sky-900/30 dark:border-sky-700">
              <InfoIcon className="h-5 w-5 text-blue-600 dark:text-sky-400" />
              <AlertTitle className="text-blue-700 dark:text-sky-300">Funcionalidad Avanzada en Desarrollo</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-sky-400">
                Esta herramienta utilizará Inteligencia Artificial (Genkit) para analizar el historial de mantenimiento de un vehículo
                y predecir posibles problemas futuros, su prioridad y acciones recomendadas.
                Esta característica se encuentra actualmente en fase de planificación y estará disponible en futuras versiones.
              </AlertDescription>
            </Alert>

           <div className="space-y-4">
            <p>
              Esta herramienta está pensada para integrarse en la vista de detalle de cada vehículo. 
              Como herramienta general, podrías seleccionar un vehículo y cargar su historial aquí para demostración.
            </p>
            {/* Example form elements - to be implemented */}
            {/* <SelectVehicleInput /> */}
            {/* <Textarea placeholder="Pega aquí el historial de mantenimiento del vehículo seleccionado..." rows={8} /> */}
            <Button disabled> {/* Enable when functionality is ready */}
              <Zap className="mr-2 h-4 w-4" /> Obtener Predicción (Próximamente)
            </Button>
          </div>
          <div className="mt-6 rounded-lg border bg-muted/30 p-6">
            <h4 className="mb-3 flex items-center text-lg font-semibold">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Resultados de Predicción (Ejemplo)
            </h4>
            <p className="text-sm text-muted-foreground">
              Aquí se mostrarán las predicciones de mantenimiento para el vehículo seleccionado.
            </p>
            {/* Placeholder for results */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
