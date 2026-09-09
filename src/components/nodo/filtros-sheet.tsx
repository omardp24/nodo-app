"use client";

import { Filter } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { Categoria, Prioridad } from "@/types/recordatorio";

interface FiltrosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorias: Categoria[];
  categoriaIds: Set<string>;
  onToggleCategoria: (id: string) => void;
  prioridades: Set<Prioridad>;
  onTogglePrioridad: (prioridad: Prioridad) => void;
  onLimpiar: () => void;
}

const PRIORIDADES: { valor: Prioridad; label: string }[] = [
  { valor: "ALTA", label: "Alta" },
  { valor: "MEDIA", label: "Media" },
  { valor: "BAJA", label: "Baja" },
];

function etiquetaCategoria(categoria: Categoria): string {
  return categoria.lista ? `${categoria.lista.nombre} · ${categoria.nombre}` : categoria.nombre;
}

export function FiltrosSheet({
  open,
  onOpenChange,
  categorias,
  categoriaIds,
  onToggleCategoria,
  prioridades,
  onTogglePrioridad,
  onLimpiar,
}: FiltrosSheetProps) {
  const hayFiltrosActivos = categoriaIds.size > 0 || prioridades.size > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border bg-card">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-foreground">
            <Filter className="h-4 w-4 text-primary" />
            Filtros
          </DrawerTitle>
          <DrawerDescription>Elegí qué querés ver. Podés combinar ambos.</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-5 px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Lista / Categoría</p>
            <div className="flex flex-wrap gap-2">
              {categorias.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todavía no hay categorías.</p>
              ) : (
                categorias.map((categoria) => {
                  const activo = categoriaIds.has(categoria.id);
                  return (
                    <button
                      key={categoria.id}
                      type="button"
                      onClick={() => onToggleCategoria(categoria.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        activo
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground active:border-primary/40",
                      )}
                    >
                      {etiquetaCategoria(categoria)}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Prioridad</p>
            <div className="flex flex-wrap gap-2">
              {PRIORIDADES.map(({ valor, label }) => {
                const activo = prioridades.has(valor);
                return (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => onTogglePrioridad(valor)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      activo
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground active:border-primary/40",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onLimpiar}
              disabled={!hayFiltrosActivos}
              className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-muted-foreground transition-colors disabled:opacity-40 active:text-foreground"
            >
              Limpiar filtros
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground"
            >
              Listo
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
