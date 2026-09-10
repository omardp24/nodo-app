"use client";

import { toISODate, diaAbreviado, mesAbreviado } from "@/lib/date";
import { NodoCard } from "./nodo-card";
import type { Recordatorio } from "@/types/recordatorio";

interface ProximosListProps {
  nodos: Recordatorio[];
  onCompletar: (id: string) => void;
  onPosponer: (id: string, modo: "1h" | "manana") => void;
  onToggleCheckbox: (id: string) => void;
  onAbrir: (id: string) => void;
}

export function ProximosList({
  nodos,
  onCompletar,
  onPosponer,
  onToggleCheckbox,
  onAbrir,
}: ProximosListProps) {
  const hoy = toISODate(new Date());
  const futuros = nodos
    .filter((n) => n.fechaLimite && toISODate(new Date(n.fechaLimite)) > hoy)
    .sort((a, b) => a.fechaLimite!.localeCompare(b.fechaLimite!));

  // Los recordatorios creados desde correos no traen fecha límite (nadie la
  // extrae del contenido todavía) — sin esta sección quedaban invisibles en
  // toda la app, porque el resto de las vistas se organiza por fecha.
  const sinFecha = nodos.filter((n) => !n.fechaLimite && n.estado !== "COMPLETADO");

  const grupos = futuros.reduce<Record<string, Recordatorio[]>>((acc, nodo) => {
    const fecha = toISODate(new Date(nodo.fechaLimite!));
    (acc[fecha] ??= []).push(nodo);
    return acc;
  }, {});

  const fechas = Object.keys(grupos).sort();

  if (fechas.length === 0 && sinFecha.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-sm text-muted-foreground">
        No hay nodos próximos todavía.
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-2">
      {sinFecha.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground">Sin fecha</span>
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {sinFecha.length} {sinFecha.length === 1 ? "nodo" : "nodos"}
            </span>
          </div>
          <div>
            {sinFecha.map((nodo, i) => (
              <NodoCard
                key={nodo.id}
                nodo={nodo}
                onCompletar={onCompletar}
                onPosponer={onPosponer}
                onToggleCheckbox={onToggleCheckbox}
                onAbrir={onAbrir}
                hilo
                esUltimoDelHilo={i === sinFecha.length - 1}
              />
            ))}
          </div>
        </section>
      )}
      {fechas.map((fecha) => {
        const fechaObj = new Date(`${fecha}T00:00:00`);
        return (
          <section key={fecha} className="mb-6">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground">
                {diaAbreviado(fechaObj)} {fechaObj.getDate()} de {mesAbreviado(fechaObj)}
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {grupos[fecha].length} {grupos[fecha].length === 1 ? "nodo" : "nodos"}
              </span>
            </div>
            <div>
              {grupos[fecha].map((nodo, i) => (
                <NodoCard
                  key={nodo.id}
                  nodo={nodo}
                  onCompletar={onCompletar}
                  onPosponer={onPosponer}
                  onToggleCheckbox={onToggleCheckbox}
                  onAbrir={onAbrir}
                  hilo
                  esUltimoDelHilo={i === grupos[fecha].length - 1}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
