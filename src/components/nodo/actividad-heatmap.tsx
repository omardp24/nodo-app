"use client";

import { useMemo } from "react";
import { addDays, diaAbreviado, toISODate } from "@/lib/date";
import { calcularEstadisticas } from "@/lib/racha";
import { cn } from "@/lib/utils";
import type { Recordatorio } from "@/types/recordatorio";

interface ActividadHeatmapProps {
  nodos: Recordatorio[];
}

const DIAS_VENTANA = 7;

export function ActividadHeatmap({ nodos }: ActividadHeatmapProps) {
  const estadisticas = useMemo(() => calcularEstadisticas(nodos), [nodos]);

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
    <div className="flex flex-col gap-3.5 px-4 py-4">
      <div className="flex gap-2.5">
        <div className="flex-1 rounded-[20px] bg-gradient-to-br from-warning to-primary p-[1.5px]">
          <div className="rounded-[18.5px] bg-card px-4 py-4">
            <div className="text-[30px] font-bold leading-none tracking-tight tabular-nums text-foreground">
              {estadisticas.rachaActual}
            </div>
            <div className="mt-1 text-[11.5px] text-muted-foreground">días de racha</div>
          </div>
        </div>
        <div className="flex-1 rounded-[20px] border border-border bg-card px-4 py-4">
          <div className="text-[30px] font-bold leading-none tracking-tight tabular-nums text-foreground">
            {estadisticas.porcentajeATiempo != null ? estadisticas.porcentajeATiempo : "—"}
            {estadisticas.porcentajeATiempo != null && (
              <span className="text-base text-muted-foreground">%</span>
            )}
          </div>
          <div className="mt-1 text-[11.5px] text-muted-foreground">cerrados a tiempo</div>
        </div>
      </div>

      <div className="rounded-[22px] border border-border bg-card px-4.5 py-4.5">
        <h2 className="text-sm font-semibold text-foreground">Últimos 7 días</h2>
        <p className="mb-4.5 mt-0.5 text-[11.5px] text-muted-foreground">Nodos completados por día</p>

        <div className="flex h-[130px] items-end justify-between gap-2">
          {dias.map((dia, i) => {
            const intensidad = conteos[i] / maximo;
            return (
              <div key={toISODate(dia)} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[11px] font-bold tabular-nums text-foreground">{conteos[i]}</span>
                <div
                  className={cn("w-full rounded-lg transition-all", conteos[i] === 0 ? "bg-secondary" : "bg-primary")}
                  style={{ height: `${Math.max(6, intensidad * 100)}%` }}
                />
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {diaAbreviado(dia)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
