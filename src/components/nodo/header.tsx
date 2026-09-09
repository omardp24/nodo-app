"use client";

import { useTheme } from "next-themes";
import { Moon, SlidersHorizontal, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NodoWordmark } from "@/components/nodo/nodo-wordmark";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onFiltrar?: () => void;
  /** Cantidad de filtros activos (categoría + prioridad) — muestra un indicador si es > 0. */
  filtrosActivos?: number;
  perfilActivo?: boolean;
  onVerPerfil: () => void;
}

export function Header({ onFiltrar, filtrosActivos = 0, perfilActivo = false, onVerPerfil }: HeaderProps) {
  const { session } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const esOscuro = resolvedTheme === "dark";
  const inicial = (session?.user.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 backdrop-blur-md">
      <NodoWordmark tamanoTexto="text-base" className="gap-1.5" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(esOscuro ? "light" : "dark")}
          aria-label={esOscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors active:bg-secondary active:text-foreground"
        >
          {esOscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={onFiltrar}
          aria-label={filtrosActivos > 0 ? `Filtros (${filtrosActivos} activos)` : "Filtros"}
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
            filtrosActivos > 0
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground active:bg-secondary active:text-foreground",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {filtrosActivos > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
              {filtrosActivos}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onVerPerfil}
          aria-label="Perfil"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-warning p-0.5 transition-all",
            perfilActivo ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
          )}
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-card text-[13px] font-bold text-foreground">
            {inicial}
          </span>
        </button>
      </div>
    </header>
  );
}
