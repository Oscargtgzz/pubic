
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileSpreadsheet, UploadCloud, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: `Importar Datos | ${APP_NAME}`,
};

export default function ImportDataPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Importar Datos desde Excel</h1>
          <p className="text-muted-foreground">
            Sube tu archivo Excel para importar masivamente vehículos y su información.
          </p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-6 w-6 text-primary" />
            <span>Proceso de Importación</span>
          </CardTitle>
          <CardDescription>Sigue estos pasos para una importación exitosa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><Download className="mr-2 h-5 w-5"/>Paso 1: Descargar Plantilla</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Usa nuestra plantilla estándar para asegurar que tus datos tengan el formato correcto.
            </p>
            <Button variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Descargar Plantilla Excel
            </Button>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><UploadCloud className="mr-2 h-5 w-5"/>Paso 2: Subir Archivo</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Selecciona el archivo Excel que preparaste con los datos de tu flotilla.
            </p>
            <div className="max-w-md">
              <Label htmlFor="excel-file" className="sr-only">Subir archivo Excel</Label>
              <Input id="excel-file" type="file" accept=".xlsx, .xls, .csv" />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">Paso 3: Mapeo de Columnas (Automático/Manual)</h3>
            <p className="text-sm text-muted-foreground">
              El sistema intentará mapear automáticamente las columnas de tu archivo. Podrás revisar y ajustar el mapeo si es necesario.
              (Esta sección se activará después de subir el archivo).
            </p>
            {/* Placeholder for mapping UI */}
            <div className="p-4 border rounded-md bg-muted/30 mt-3 text-center text-sm text-muted-foreground">
              Interfaz de Mapeo de Columnas (Próximamente)
            </div>
          </div>

          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Paso 4: Previsualización y Confirmación</h3>
            <p className="text-sm text-muted-foreground">
              Revisa los datos que se importarán y corrige cualquier error detectado antes de la importación final.
              (Esta sección se activará después del mapeo).
            </p>
            {/* Placeholder for preview UI */}
            <div className="p-4 border rounded-md bg-muted/30 mt-3 text-center text-sm text-muted-foreground">
              Previsualización de Datos (Próximamente)
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button size="lg" disabled> {/* Enable when steps are completed */}
              <CheckCircle className="mr-2 h-5 w-5" /> Iniciar Importación
            </Button>
          </div>

          <Card className="mt-6 bg-amber-50 border-amber-200">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-amber-700 text-md">Importante</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700 space-y-1">
              <p>Asegúrate de que los formatos de fecha (DD/MM/AAAA o YYYY-MM-DD) y números sean consistentes.</p>
              <p>Las placas duplicadas no se importarán si ya existen en el sistema.</p>
              <p>Revisa el reporte de errores después de la importación para cualquier problema.</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
