"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/nodo/header";
import { DateScroller } from "@/components/nodo/date-scroller";
import { NodoCard } from "@/components/nodo/nodo-card";
import { BottomNav, type Tab } from "@/components/nodo/bottom-nav";
import { VinculoSheet } from "@/components/nodo/vinculo-sheet";
import { ProximosList } from "@/components/nodo/proximos-list";
import { ActividadHeatmap } from "@/components/nodo/actividad-heatmap";
import { toISODate, sumarHorasISO, sumarUnDiaISO } from "@/lib/date";
import { categoriasApi, listasApi, recordatoriosApi, type InterpretacionRecordatorio } from "@/lib/resources";
import type { Recordatorio } from "@/types/recordatorio";

const LISTA_DEFAULT = "Personal";
const CATEGORIA_DEFAULT = "General";

export function AppShell() {
  const [nodos, setNodos] = useState<Recordatorio[]>([]);
  const [categoriaDefaultId, setCategoriaDefaultId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [tab, setTab] = useState<Tab>("hoy");
  const [vinculoAbierto, setVinculoAbierto] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [recordatorios, categorias] = await Promise.all([
          recordatoriosApi.listar(),
          categoriasApi.listar(),
        ]);
        setNodos(recordatorios);

        // Nota: esto puede crear un par Lista/Categoria "Personal"/"General" duplicado
        // si el efecto corre dos veces casi al mismo tiempo (p. ej. el doble-mount de
        // React StrictMode en desarrollo). Es inofensivo — quedaría una Categoria vacía
        // de más — pero no está resuelto con un lock real; para uso personal no vale la
        // pena la complejidad de una condición de carrera que en producción no ocurre.
        let categoria = categorias.find((c) => c.nombre === CATEGORIA_DEFAULT);
        if (!categoria) {
          const listas = await listasApi.listar();
          let lista = listas.find((l) => l.nombre === LISTA_DEFAULT);
          if (!lista) lista = await listasApi.crear(LISTA_DEFAULT);
          categoria = await categoriasApi.crear(CATEGORIA_DEFAULT, lista.id);
        }
        setCategoriaDefaultId(categoria.id);
      } catch {
        setErrorCarga("No se pudo conectar con el servidor. Intenta recargar.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const fechaSeleccionadaISO = toISODate(fechaSeleccionada);

  const nodosDelDia = useMemo(
    () =>
      nodos
        .filter((n) => n.fechaLimite && toISODate(new Date(n.fechaLimite)) === fechaSeleccionadaISO)
        .sort((a, b) => a.fechaLimite!.localeCompare(b.fechaLimite!)),
    [nodos, fechaSeleccionadaISO],
  );

  const fechasConNodos = useMemo(
    () =>
      new Set(
        nodos
          .filter((n) => n.estado !== "COMPLETADO" && n.fechaLimite)
          .map((n) => toISODate(new Date(n.fechaLimite!))),
      ),
    [nodos],
  );

  const pendientesHoy = nodosDelDia.filter((n) => n.estado !== "COMPLETADO").length;

  async function toggleCheckbox(id: string) {
    const nodo = nodos.find((n) => n.id === id);
    if (!nodo) return;
    const nuevoEstado = nodo.estado === "COMPLETADO" ? "PENDIENTE" : "COMPLETADO";
    try {
      const actualizado = await recordatoriosApi.actualizar(id, { estado: nuevoEstado });
      setNodos((actual) => actual.map((n) => (n.id === id ? actualizado : n)));
    } catch (error) {
      console.error("No se pudo actualizar el recordatorio:", error);
    }
  }

  async function completar(id: string) {
    try {
      const actualizado = await recordatoriosApi.actualizar(id, { estado: "COMPLETADO" });
      setNodos((actual) => actual.map((n) => (n.id === id ? actualizado : n)));
    } catch (error) {
      console.error("No se pudo completar el recordatorio:", error);
    }
  }

  async function posponer(id: string, modo: "1h" | "manana") {
    const nodo = nodos.find((n) => n.id === id);
    if (!nodo?.fechaLimite) return;
    const nuevaFecha = modo === "manana" ? sumarUnDiaISO(nodo.fechaLimite) : sumarHorasISO(nodo.fechaLimite, 1);
    try {
      const actualizado = await recordatoriosApi.actualizar(id, { fechaLimite: nuevaFecha });
      setNodos((actual) => actual.map((n) => (n.id === id ? actualizado : n)));
    } catch (error) {
      console.error("No se pudo posponer el recordatorio:", error);
    }
  }

  async function crearNodo(interpretacion: InterpretacionRecordatorio) {
    if (!categoriaDefaultId) return;
    try {
      const creado = await recordatoriosApi.crear({
        titulo: interpretacion.titulo,
        descripcion: interpretacion.descripcion,
        fechaLimite: interpretacion.fechaLimite,
        prioridad: interpretacion.prioridad,
        monto: interpretacion.monto,
        banco: interpretacion.banco,
        origen: "VOZ",
        categoriaId: categoriaDefaultId,
      });
      setNodos((actual) => [...actual, creado]);
    } catch (error) {
      console.error("No se pudo crear el recordatorio:", error);
    }
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">{errorCarga}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md min-h-screen flex-col bg-background">
      <Header pendientes={pendientesHoy} />

      {tab === "hoy" && (
        <>
          <DateScroller
            selected={fechaSeleccionada}
            onSelect={setFechaSeleccionada}
            fechasConNodos={fechasConNodos}
          />
          <main className="flex-1 px-4 pb-32 pt-1">
            {nodosDelDia.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Nada por aquí — desliza el asistente para crear un nodo.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {nodosDelDia.map((nodo) => (
                    <motion.li
                      key={nodo.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <NodoCard
                        nodo={nodo}
                        onCompletar={completar}
                        onPosponer={posponer}
                        onToggleCheckbox={toggleCheckbox}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </main>
        </>
      )}

      {tab === "proximos" && (
        <main className="flex-1 pb-32">
          <ProximosList
            nodos={nodos}
            onCompletar={completar}
            onPosponer={posponer}
            onToggleCheckbox={toggleCheckbox}
          />
        </main>
      )}

      {tab === "actividad" && (
        <main className="flex-1 pb-32">
          <ActividadHeatmap nodos={nodos} />
        </main>
      )}

      <BottomNav active={tab} onChange={setTab} onAbrirVinculo={() => setVinculoAbierto(true)} />
      <VinculoSheet open={vinculoAbierto} onOpenChange={setVinculoAbierto} onCrear={crearNodo} />
    </div>
  );
}
