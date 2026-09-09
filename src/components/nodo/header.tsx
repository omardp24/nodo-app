"use client";

import { Bell, BellOff, LogOut, SlidersHorizontal } from "lucide-react";
import { usePushNotifications } from "@/lib/use-push-notifications";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface HeaderProps {
  pendientes: number;
  onFiltrar?: () => void;
}

export function Header({ pendientes, onFiltrar }: HeaderProps) {
  const { soportado, suscrito, cargando, activar } = usePushNotifications();
  const { cerrarSesion } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          N
        </span>
        <span className="text-base font-semibold tracking-tight text-foreground">
          Nodo
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {pendientes} pendientes
        </div>

        {soportado && (
          <button
            type="button"
            onClick={suscrito ? undefined : activar}
            disabled={cargando || suscrito}
            aria-label={suscrito ? "Notificaciones activas" : "Activar notificaciones"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
              suscrito
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground active:bg-accent active:text-foreground",
            )}
          >
            {suscrito ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </button>
        )}

        <button
          type="button"
          onClick={onFiltrar}
          aria-label="Filtros"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors active:bg-accent active:text-foreground"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors active:bg-accent active:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
