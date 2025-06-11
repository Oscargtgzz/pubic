import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: `Iniciar Sesión | ${APP_NAME}`,
  description: `Inicia sesión en ${APP_NAME} para gestionar tu flotilla.`,
};

export default function LoginPage() {
  return <LoginForm />;
}