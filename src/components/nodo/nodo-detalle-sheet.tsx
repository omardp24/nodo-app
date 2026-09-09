"use client";

import { Check, Clock } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { PRIORIDAD_COLOR } from "@/lib/priority";
import { usePreferencias } from "@/lib/preferencias-context";
import type { OrigenRecordatorio, Prioridad, Recordatorio } from "@/types/recordatorio";

interface NodoDetalleSheetProps {
  nodo: Recordatorio | null;
  onOpenChange: (open: boolean) => void;
  onCompletar: (id: string) => void;
  onPosponer: (id: string, modo: "1h" | "manana") => void;
}

const ETIQUETA_PRIORIDAD: Record<Prioridad, string> = { ALTA: "alta", MEDIA: "media", BAJA: "baja" };
const ETIQUETA_ORIGEN: Record<OrigenRecordatorio, string> = {
  CORREO: "Correo",
  VOZ: "Vínculo · voz",
  MANUAL: "Manual",
};

function formatoCuando(iso: string | null, formato12h: boolean): string {
  if (!iso) return "Sin fecha";
  const fecha = new Date(iso);
  const formateador = new Intl.DateTimeFormat("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: formato12h ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12: formato12h,
  });
  return formateador.format(fecha);
}

export function NodoDetalleSheet({ nodo, onOpenChange, onCompletar, onPosponer }: NodoDetalleSheetProps) {
  const { formatoHora } = usePreferencias();
  return (
    <Drawer open={nodo !== null} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border bg-card">
        {nodo && (
          <>
            <DrawerHeader className="text-left">
              <span
                className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: `color-mix(in srgb, ${PRIORIDAD_COLOR[nodo.prioridad]} 14%, transparent)`,
                  color: PRIORIDAD_COLOR[nodo.prioridad],
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Prioridad {ETIQUETA_PRIORIDAD[nodo.prioridad]}
              </span>
              <DrawerTitle className="mt-1 text-[26px] leading-tight text-foreground">
                {nodo.titulo}
              </DrawerTitle>
              <DrawerDescription className="sr-only">Detalle del nodo</DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
              <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border">
                <FilaDetalle etiqueta="Cuándo" valor={formatoCuando(nodo.fechaLimite, formatoHora === "12h")} />
                <FilaDetalle
                  etiqueta="Lista"
                  valor={
                    nodo.categoria?.lista
                      ? `@${nodo.categoria.lista.nombre} · #${nodo.categoria.nombre}`
                      : `#${nodo.categoria.nombre}`
                  }
                />
                <FilaDetalle
                  etiqueta="Monto"
                  valor={nodo.monto != null ? `${nodo.monto}${nodo.banco ? ` · ${nodo.banco}` : ""}` : "—"}
                  destacado={nodo.monto != null}
                />
                <FilaDetalle etiqueta="Origen" valor={ETIQUETA_ORIGEN[nodo.origen]} />
              </div>

              {nodo.descripcion && (
                <p className="text-sm leading-relaxed text-muted-foreground">{nodo.descripcion}</p>
              )}

              {nodo.estado !== "COMPLETADO" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onCompletar(nodo.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground"
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                    Completar
                  </button>
                  <button
                    type="button"
                    onClick={() => onPosponer(nodo.id, "1h")}
                    className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-border px-4.5 py-3.5 text-sm font-medium text-muted-foreground"
                  >
                    <Clock className="h-4 w-4" />
                    +1 h
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function FilaDetalle({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-card px-4 py-3.5 text-[13.5px]">
      <span className="text-muted-foreground">{etiqueta}</span>
      <span className={destacado ? "font-semibold text-primary-light" : "font-semibold text-foreground"}>
        {valor}
      </span>
    </div>
  );
}
