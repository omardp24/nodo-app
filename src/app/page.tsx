"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginForm } from "@/components/auth/login-form";
import { AppShell } from "./app-shell";

export default function Home() {
  const { session, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return <AppShell />;
}
