"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, isSameDay, toISODate } from "@/lib/date";
import { PRIORIDAD_COLOR } from "@/lib/priority";
import { cn } from "@/lib/utils";
import type { Prioridad, Recordatorio } from "@/types/recordatorio";

interface CalendarioMesProps {
  nodos: Recordatorio[];
  seleccionado: Date;
  onSeleccionar: (fecha: Date) => void;
}

const NOMBRES_MES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS_SEMANA = ["D", "L", "M", "X", "J", "V", "S"];
const RANGO_PRIORIDAD: Record<Prioridad, number> = { ALTA: 3, MEDIA: 2, BAJA: 1 };

function inicioDeMes(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

function sumarMeses(fecha: Date, cantidad: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth() + cantidad, 1);
}

export function CalendarioMes({ nodos, seleccionado, onSeleccionar }: CalendarioMesProps) {
  const [mesVisible, setMesVisible] = useState(() => inicioDeMes(seleccionado));
  const hoy = useMemo(() => new Date(), []);

  // Prioridad más alta entre los nodos pendientes de cada día — decide el color del puntito.
  const marcadores = useMemo(() => {
    const mapa = new Map<string, Prioridad>();
    for (const n of nodos) {
      if (!n.fechaLimite || n.estado === "COMPLETADO") continue;
      const key = toISODate(new Date(n.fechaLimite));
      const actual = mapa.get(key);
      if (!actual || RANGO_PRIORIDAD[n.prioridad] > RANGO_PRIORIDAD[actual]) {
        mapa.set(key, n.prioridad);
      }
    }
    return mapa;
  }, [nodos]);

  const semanas = useMemo(() => {
    const primerDiaMes = inicioDeMes(mesVisible);
    const inicioGrid = addDays(primerDiaMes, -primerDiaMes.getDay());
    const dias = Array.from({ length: 42 }, (_, i) => addDays(inicioGrid, i));
    const filas: Date[][] = [];
    for (let i = 0; i < 42; i += 7) filas.push(dias.slice(i, i + 7));
    return filas;
  }, [mesVisible]);

  return (
    <div className="rounded-[22px] border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMesVisible((m) => sumarMeses(m, -1))}
          aria-label="Mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[15px] font-bold capitalize tracking-tight text-foreground">
          {NOMBRES_MES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => setMesVisible((m) => sumarMeses(m, 1))}
          aria-label="Mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DIAS_SEMANA.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {semanas.flat().map((dia) => {
          const enMes = dia.getMonth() === mesVisible.getMonth();
          const esHoy = isSameDay(dia, hoy);
          const esSeleccionado = isSameDay(dia, seleccionado);
          const prioridadDia = marcadores.get(toISODate(dia));

          return (
            <button
              key={dia.toISOString()}
              type="button"
              onClick={() => onSeleccionar(dia)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-[13px] font-semibold transition-colors",
                !enMes && "opacity-30",
                esSeleccionado
                  ? "bg-primary text-primary-foreground"
                  : esHoy
                    ? "border border-primary text-primary"
                    : "text-foreground active:bg-secondary",
              )}
            >
              <span className="tabular-nums">{dia.getDate()}</span>
              <span
                className="h-1 w-1 rounded-full"
                style={{
                  backgroundColor: prioridadDia
                    ? esSeleccionado
                      ? "currentColor"
                      : PRIORIDAD_COLOR[prioridadDia]
                    : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
