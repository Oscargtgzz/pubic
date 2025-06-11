
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Mail, Save, Image as ImageIcon, Loader2 } from "lucide-react";
import { APP_NAME } from '@/lib/config';
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { mockUserProfile } from "@/lib/mock-data"; // Import mock data

const USER_PROFILE_KEY = "fleetfox_user_profile";

function getUserInitials(name?: string | null): string {
  if (!name) return "U";
  const names = name.split(" ");
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0].substring(0, 2).toUpperCase();
}

const profileFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Correo electrónico inválido."),
  avatarUrl: z.string().url("Debe ser una URL válida para la imagen.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<User>(mockUserProfile); // Initialize with mock if nothing else
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userProfile.name || "",
      email: userProfile.email || "",
      avatarUrl: userProfile.avatarUrl || "",
    },
  });

  useEffect(() => {
    document.title = `Perfil de Usuario | ${APP_NAME}`;
    setIsLoading(true);
    try {
      const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
        form.reset(parsedProfile); 
      } else {
        // If no profile in localStorage, use mock data and save it
        setUserProfile(mockUserProfile);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(mockUserProfile));
        form.reset(mockUserProfile);
         toast({
          title: "Perfil Inicializado",
          description: "Se cargaron datos de perfil de ejemplo.",
        });
      }
    } catch (error) {
      console.error("Error loading user profile from localStorage:", error);
      setUserProfile(mockUserProfile); 
      form.reset(mockUserProfile);
      toast({
        title: "Error al Cargar Perfil",
        description: "No se pudo cargar el perfil. Se usaron datos por defecto.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.reset, toast]); // form.reset dependency might be tricky, ensure it's stable or manage carefully

  const onSubmit = (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const updatedProfile: User = {
        ...userProfile, 
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl || undefined, 
      };
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile); 
      toast({
        title: "Perfil Actualizado",
        description: "Tu información de perfil ha sido guardada.",
      });
    } catch (error) {
      console.error("Error saving user profile to localStorage:", error);
      toast({
        title: "Error al Guardar",
        description: "No se pudo guardar tu perfil. Intenta de nuevo.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-2 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-2">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Perfil de Usuario</h1>
        <p className="text-muted-foreground">Administra la información de tu cuenta.</p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4 border-2 border-primary" data-ai-hint="person business">
                <AvatarImage 
                  src={form.watch("avatarUrl") || userProfile.avatarUrl || "https://placehold.co/150x150.png"} 
                  alt={form.watch("name") || userProfile.name || ""} 
                />
                <AvatarFallback className="text-3xl">
                  {getUserInitials(form.watch("name") || userProfile.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl mt-2">{form.watch("name") || userProfile.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input {...field} className="pl-10" disabled={isSaving} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input type="email" {...field} className="pl-10" disabled={isSaving} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Avatar</FormLabel>
                     <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input {...field} placeholder="https://ejemplo.com/avatar.png" className="pl-10" disabled={isSaving} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="current-password">Cambiar Contraseña (Funcionalidad Pendiente)</Label>
                <Input id="current-password" type="password" placeholder="Contraseña Actual" disabled />
                <Input id="new-password" type="password" placeholder="Nueva Contraseña" disabled />
                <Input id="confirm-password" type="password" placeholder="Confirmar Nueva Contraseña" disabled />
              </div>

              <Button className="w-full" type="submit" disabled={isSaving || !form.formState.isDirty}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
