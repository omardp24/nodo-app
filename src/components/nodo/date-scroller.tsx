"use client";

import { useEffect, useMemo, useRef } from "react";
import { addDays, diaAbreviado, isSameDay, mesAbreviado, toISODate } from "@/lib/date";
import { cn } from "@/lib/utils";

interface DateScrollerProps {
  selected: Date;
  onSelect: (date: Date) => void;
  /** Días con al menos un nodo pendiente, para marcarlos con un puntito. */
  fechasConNodos?: Set<string>;
}

const RANGO_ANTES = 4;
const RANGO_DESPUES = 10;

export function DateScroller({ selected, onSelect, fechasConNodos }: DateScrollerProps) {
  const hoy = useMemo(() => new Date(), []);
  const dias = useMemo(() => {
    const inicio = addDays(hoy, -RANGO_ANTES);
    return Array.from({ length: RANGO_ANTES + RANGO_DESPUES + 1 }, (_, i) =>
      addDays(inicio, i),
    );
  }, [hoy]);

  const refsBotones = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const key = toISODate(selected);
    refsBotones.current[key]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selected]);

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
      {dias.map((dia) => {
        const key = toISODate(dia);
        const activo = isSameDay(dia, selected);
        const esHoy = isSameDay(dia, hoy);
        const tieneNodos = fechasConNodos?.has(key);

        return (
          <button
            key={key}
            ref={(el) => {
              refsBotones.current[key] = el;
            }}
            type="button"
            onClick={() => onSelect(dia)}
            className={cn(
              "flex w-11 shrink-0 snap-center flex-col items-center gap-1 rounded-[14px] border py-2.5 transition-colors",
              activo
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground active:bg-accent",
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-75">
              {diaAbreviado(dia)}
            </span>
            <span className="text-[15px] font-bold tabular-nums">{dia.getDate()}</span>
            <span
              className={cn(
                "h-[3px] w-3.5 rounded-full",
                activo
                  ? "bg-white/55"
                  : esHoy
                    ? "bg-primary"
                    : tieneNodos
                      ? "bg-muted-foreground"
                      : "opacity-0",
              )}
            />
          </button>
        );
      })}
      <span className="sr-only">{mesAbreviado(selected)}</span>
    </div>
  );
}
