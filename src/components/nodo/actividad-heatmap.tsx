"use client";

import { addDays, diaAbreviado, toISODate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Recordatorio } from "@/types/recordatorio";

interface ActividadHeatmapProps {
  nodos: Recordatorio[];
}

const DIAS_VENTANA = 7;

export function ActividadHeatmap({ nodos }: ActividadHeatmapProps) {
  const hoy = new Date();
  const dias = Array.from({ length: DIAS_VENTANA }, (_, i) =>
    addDays(hoy, -(DIAS_VENTANA - 1) + i),
  );

  const conteos = dias.map((dia) => {
    const key = toISODate(dia);
    return nodos.filter(
      (n) => n.fechaLimite && toISODate(new Date(n.fechaLimite)) === key && n.estado === "COMPLETADO",
    ).length;
  });
  const maximo = Math.max(1, ...conteos);

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div>
        <h2 className="text-sm font-medium text-foreground">Últimos 7 días</h2>
        <p className="text-xs text-muted-foreground">Nodos completados por día.</p>
      </div>

      <div className="flex items-end justify-between gap-2">
        {dias.map((dia, i) => {
          const intensidad = conteos[i] / maximo;
          return (
            <div key={toISODate(dia)} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end">
                <div
                  className={cn(
                    "w-full rounded-lg transition-all",
                    conteos[i] === 0 ? "bg-secondary" : "bg-primary",
                  )}
                  style={{
                    height: `${Math.max(8, intensidad * 100)}%`,
                    opacity: conteos[i] === 0 ? 1 : 0.35 + intensidad * 0.65,
                  }}
                />
              </div>
              <span className="text-[10px] font-medium uppercase text-muted-foreground">
                {diaAbreviado(dia)}
              </span>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {conteos[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
