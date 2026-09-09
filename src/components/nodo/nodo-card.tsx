"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Check, Clock, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIORIDAD_COLOR } from "@/lib/priority";
import { horaDeISO } from "@/lib/date";
import type { Recordatorio } from "@/types/recordatorio";

interface NodoCardProps {
  nodo: Recordatorio;
  onCompletar: (id: string) => void;
  onPosponer: (id: string, modo: "1h" | "manana") => void;
  onToggleCheckbox: (id: string) => void;
  onAbrir?: (id: string) => void;
  /** Dibuja el checkbox como un círculo aparte, conectado por una línea (vista "Hoy"). */
  hilo?: boolean;
  /** Con hilo=true: si es el último de la lista, no se dibuja la línea hacia abajo. */
  esUltimoDelHilo?: boolean;
}

const UMBRAL_COMPLETAR = 88;
const UMBRAL_POSPONER_1H = 88;
const UMBRAL_POSPONER_MANANA = 176;

export function NodoCard({
  nodo,
  onCompletar,
  onPosponer,
  onToggleCheckbox,
  onAbrir,
  hilo = false,
  esUltimoDelHilo = false,
}: NodoCardProps) {
  const x = useMotionValue(0);
  const [zonaIzquierda, setZonaIzquierda] = useState<"1h" | "manana" | null>(null);

  const completado = nodo.estado === "COMPLETADO";

  const fondoOpacidad = useTransform(x, [-UMBRAL_POSPONER_MANANA, 0, UMBRAL_COMPLETAR], [1, 0, 1]);
  const escalaIcono = useTransform(
    x,
    [-UMBRAL_POSPONER_MANANA, -UMBRAL_POSPONER_1H * 0.4, 0, UMBRAL_COMPLETAR * 0.4, UMBRAL_COMPLETAR],
    [1.1, 0.7, 0.4, 0.7, 1.1],
  );

  function handleDrag(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x <= -UMBRAL_POSPONER_MANANA) {
      setZonaIzquierda("manana");
    } else if (info.offset.x < 0) {
      setZonaIzquierda("1h");
    } else {
      setZonaIzquierda(null);
    }
  }

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x >= UMBRAL_COMPLETAR) {
      onCompletar(nodo.id);
      return;
    }
    if (info.offset.x <= -UMBRAL_POSPONER_MANANA) {
      onPosponer(nodo.id, "manana");
    } else if (info.offset.x <= -UMBRAL_POSPONER_1H) {
      onPosponer(nodo.id, "1h");
    }
    setZonaIzquierda(null);
  }

  const tarjeta = (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Fondo de acciones, revelado durante el drag */}
      <motion.div
        style={{ opacity: fondoOpacidad }}
        className="absolute inset-0 flex items-center justify-between px-5"
      >
        <motion.div
          style={{ scale: escalaIcono }}
          className="flex items-center gap-1.5 text-sm font-medium text-white"
        >
          {zonaIzquierda === "manana" ? (
            <>
              <Moon className="h-4 w-4" /> Mañana
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" /> +1h
            </>
          )}
        </motion.div>
        <motion.div
          style={{ scale: escalaIcono }}
          className="flex items-center gap-1.5 text-sm font-medium text-white"
        >
          Completar <Check className="h-4 w-4" />
        </motion.div>
      </motion.div>
      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-2xl transition-colors",
          zonaIzquierda === "manana"
            ? "bg-indigo-500"
            : zonaIzquierda === "1h"
              ? "bg-amber-500"
              : "bg-emerald-500",
        )}
      />

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.5 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={() => onAbrir?.(nodo.id)}
        className={cn(
          "relative z-10 flex items-center gap-3 touch-pan-y",
          hilo
            ? "rounded-[18px] border border-border border-l-[3px] bg-card px-4 py-3.5"
            : "rounded-2xl border border-border bg-card px-4 py-3.5",
          completado && "opacity-50",
        )}
        style={hilo ? { borderLeftColor: PRIORIDAD_COLOR[nodo.prioridad], x } : { x }}
      >
        {!hilo && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCheckbox(nodo.id);
            }}
            aria-label={completado ? "Marcar como pendiente" : "Marcar como completado"}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              completado
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-transparent active:border-primary",
            )}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium text-foreground",
              completado && "line-through",
            )}
          >
            {nodo.titulo}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {!hilo && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: PRIORIDAD_COLOR[nodo.prioridad] }}
              />
            )}
            {nodo.categoria?.lista && (
              <span className="truncate">@{nodo.categoria.lista.nombre}</span>
            )}
            {nodo.categoria && (
              <span className="truncate opacity-70">#{nodo.categoria.nombre}</span>
            )}
            {nodo.monto != null && (
              <span className="shrink-0 truncate text-primary">
                {nodo.monto}
                {nodo.banco ? ` · ${nodo.banco}` : ""}
              </span>
            )}
          </div>
        </div>

        {nodo.fechaLimite && (
          <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
            {horaDeISO(nodo.fechaLimite)}
          </span>
        )}
      </motion.div>
    </div>
  );

  if (!hilo) {
    return tarjeta;
  }

  return (
    <div className="flex gap-3.5 pb-3.5">
      <div className="relative flex w-[22px] shrink-0 justify-center">
        {!esUltimoDelHilo && (
          <span
            className={cn(
              "absolute top-2 -bottom-3.5 w-0.5 transition-colors",
              completado ? "bg-primary" : "bg-border",
            )}
          />
        )}
        <button
          type="button"
          onClick={() => onToggleCheckbox(nodo.id)}
          aria-label={completado ? "Marcar como pendiente" : "Marcar como completado"}
          className={cn(
            "relative z-10 mt-3.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 p-0 text-transparent transition-all",
            completado
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border active:border-primary",
          )}
        >
          <Check className="h-3 w-3" strokeWidth={3.5} />
        </button>
      </div>
      <div className="min-w-0 flex-1">{tarjeta}</div>
    </div>
  );
}
