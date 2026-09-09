"use client";

import { Check, Clock, Moon } from "lucide-react";
import { faltaPara, horaDeISO } from "@/lib/date";
import { usePreferencias } from "@/lib/preferencias-context";
import type { Recordatorio } from "@/types/recordatorio";

interface ProximoNodoCardProps {
  nodo: Recordatorio;
  onCompletar: (id: string) => void;
  onPosponer: (id: string, modo: "1h" | "manana") => void;
  onAbrir: (id: string) => void;
}

export function ProximoNodoCard({ nodo, onCompletar, onPosponer, onAbrir }: ProximoNodoCardProps) {
  const { formatoHora } = usePreferencias();
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 rounded-3xl bg-gradient-to-br from-primary to-warning p-[1.5px] shadow-lg shadow-black/10 duration-300">
      <div className="rounded-[22.5px] bg-card px-4.5 pb-4 pt-4.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />A continuación
          </span>
          {nodo.fechaLimite && (
            <span className="text-xs text-muted-foreground">{faltaPara(nodo.fechaLimite)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAbrir(nodo.id)}
          className="mt-3 block w-full text-left"
        >
          <div className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
            {nodo.titulo}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {nodo.fechaLimite && (
              <span className="font-semibold tabular-nums text-foreground">
                {horaDeISO(nodo.fechaLimite, formatoHora === "12h")}
              </span>
            )}
            {nodo.categoria?.lista && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5">@{nodo.categoria.lista.nombre}</span>
            )}
            {nodo.categoria && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5">#{nodo.categoria.nombre}</span>
            )}
            {nodo.monto != null && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary-light">
                {nodo.monto}
                {nodo.banco ? ` · ${nodo.banco}` : ""}
              </span>
            )}
          </div>
        </button>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onCompletar(nodo.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
            Listo
          </button>
          <button
            type="button"
            onClick={() => onPosponer(nodo.id, "1h")}
            className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-border px-3.5 py-3 text-[13px] font-medium text-muted-foreground"
          >
            <Clock className="h-3.5 w-3.5" />
            +1 h
          </button>
          <button
            type="button"
            onClick={() => onPosponer(nodo.id, "manana")}
            aria-label="Posponer a mañana"
            className="flex shrink-0 items-center justify-center rounded-2xl border border-border px-3.5 py-3 text-muted-foreground"
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
