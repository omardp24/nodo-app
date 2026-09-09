"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/nodo/header";
import { DateScroller } from "@/components/nodo/date-scroller";
import { NodoCard } from "@/components/nodo/nodo-card";
import { ProgresoAnillo } from "@/components/nodo/progreso-anillo";
import { ProximoNodoCard } from "@/components/nodo/proximo-nodo-card";
import { DiaCerrado } from "@/components/nodo/dia-cerrado";
import { BottomNav, type Tab } from "@/components/nodo/bottom-nav";
import { VinculoSheet } from "@/components/nodo/vinculo-sheet";
import { FiltrosSheet } from "@/components/nodo/filtros-sheet";
import { ProximosList } from "@/components/nodo/proximos-list";
import { ActividadHeatmap } from "@/components/nodo/actividad-heatmap";
import { NodoDetalleSheet } from "@/components/nodo/nodo-detalle-sheet";
import { isSameDay, toISODate, sumarHorasISO, sumarUnDiaISO } from "@/lib/date";
import { calcularEstadisticas } from "@/lib/racha";
import { categoriasApi, listasApi, recordatoriosApi, type InterpretacionRecordatorio } from "@/lib/resources";
import type { Prioridad, Recordatorio } from "@/types/recordatorio";

const FORMATEADOR_FECHA = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" });
const FORMATEADOR_DIA_SEMANA = new Intl.DateTimeFormat("es", { weekday: "long" });

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

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
  const [filtrosAbierto, setFiltrosAbierto] = useState(false);
  const [filtroCategoriaIds, setFiltroCategoriaIds] = useState<Set<string>>(new Set());
  const [filtroPrioridades, setFiltroPrioridades] = useState<Set<Prioridad>>(new Set());
  const [detalleId, setDetalleId] = useState<string | null>(null);

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

  const categoriasDisponibles = useMemo(() => {
    const mapa = new Map<string, Recordatorio["categoria"]>();
    for (const n of nodos) mapa.set(n.categoria.id, n.categoria);
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [nodos]);

  const nodosFiltrados = useMemo(
    () =>
      nodos.filter((n) => {
        const pasaCategoria = filtroCategoriaIds.size === 0 || filtroCategoriaIds.has(n.categoriaId);
        const pasaPrioridad = filtroPrioridades.size === 0 || filtroPrioridades.has(n.prioridad);
        return pasaCategoria && pasaPrioridad;
      }),
    [nodos, filtroCategoriaIds, filtroPrioridades],
  );

  const nodosDelDia = useMemo(
    () =>
      nodosFiltrados
        .filter((n) => n.fechaLimite && toISODate(new Date(n.fechaLimite)) === fechaSeleccionadaISO)
        .sort((a, b) => a.fechaLimite!.localeCompare(b.fechaLimite!)),
    [nodosFiltrados, fechaSeleccionadaISO],
  );

  const fechasConNodos = useMemo(
    () =>
      new Set(
        nodosFiltrados
          .filter((n) => n.estado !== "COMPLETADO" && n.fechaLimite)
          .map((n) => toISODate(new Date(n.fechaLimite!))),
      ),
    [nodosFiltrados],
  );

  const pendientesDelDia = useMemo(
    () => nodosDelDia.filter((n) => n.estado !== "COMPLETADO"),
    [nodosDelDia],
  );
  const pendientesHoy = pendientesDelDia.length;
  const esHoySeleccionado = isSameDay(fechaSeleccionada, new Date());
  const siguiente = esHoySeleccionado ? (pendientesDelDia[0] ?? null) : null;
  const restoDelDia = siguiente ? nodosDelDia.filter((n) => n.id !== siguiente.id) : nodosDelDia;
  const estadisticas = useMemo(() => calcularEstadisticas(nodosFiltrados), [nodosFiltrados]);
  const tituloDia = esHoySeleccionado ? "Hoy" : capitalizar(FORMATEADOR_DIA_SEMANA.format(fechaSeleccionada));
  const nodoDetalle = detalleId ? (nodos.find((n) => n.id === detalleId) ?? null) : null;

  function toggleFiltroCategoria(id: string) {
    setFiltroCategoriaIds((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  }

  function toggleFiltroPrioridad(prioridad: Prioridad) {
    setFiltroPrioridades((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(prioridad)) nuevo.delete(prioridad);
      else nuevo.add(prioridad);
      return nuevo;
    });
  }

  function limpiarFiltros() {
    setFiltroCategoriaIds(new Set());
    setFiltroPrioridades(new Set());
  }

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
      <Header
        pendientes={pendientesHoy}
        onFiltrar={() => setFiltrosAbierto(true)}
        filtrosActivos={filtroCategoriaIds.size + filtroPrioridades.size}
      />

      {tab === "hoy" && (
        <>
          <div className="flex flex-col gap-4 px-4 pt-1">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[34px] font-bold leading-none tracking-tight text-foreground">
                  {tituloDia}
                </div>
                <div className="mt-1.5 text-[13px] text-muted-foreground">
                  {FORMATEADOR_FECHA.format(fechaSeleccionada)}
                </div>
                {esHoySeleccionado && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                    {pendientesHoy === 0 ? "todo cerrado" : `${pendientesHoy} por cerrar`}
                  </div>
                )}
              </div>
              {esHoySeleccionado && nodosDelDia.length > 0 && (
                <ProgresoAnillo hechos={nodosDelDia.length - pendientesHoy} total={nodosDelDia.length} />
              )}
            </div>
            <DateScroller
              selected={fechaSeleccionada}
              onSelect={setFechaSeleccionada}
              fechasConNodos={fechasConNodos}
            />
          </div>
          <main className="flex-1 px-4 pb-32 pt-1">
            {nodosDelDia.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Nada por aquí — desliza el asistente para crear un nodo.
              </div>
            ) : (
              <>
                {siguiente && (
                  <div className="mb-5">
                    <ProximoNodoCard
                      nodo={siguiente}
                      onCompletar={completar}
                      onPosponer={posponer}
                      onAbrir={setDetalleId}
                    />
                  </div>
                )}
                {esHoySeleccionado && pendientesHoy === 0 && (
                  <div className="mb-5">
                    <DiaCerrado total={nodosDelDia.length} racha={estadisticas.rachaActual} />
                  </div>
                )}
                <ul>
                  <AnimatePresence initial={false}>
                    {restoDelDia.map((nodo, i) => (
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
                          onAbrir={setDetalleId}
                          hilo
                          esUltimoDelHilo={i === restoDelDia.length - 1}
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </>
            )}
          </main>
        </>
      )}

      {tab === "proximos" && (
        <main className="flex-1 pb-32">
          <ProximosList
            nodos={nodosFiltrados}
            onCompletar={completar}
            onPosponer={posponer}
            onToggleCheckbox={toggleCheckbox}
            onAbrir={setDetalleId}
          />
        </main>
      )}

      {tab === "actividad" && (
        <main className="flex-1 pb-32">
          <ActividadHeatmap nodos={nodosFiltrados} />
        </main>
      )}

      <BottomNav active={tab} onChange={setTab} onAbrirVinculo={() => setVinculoAbierto(true)} />
      <VinculoSheet open={vinculoAbierto} onOpenChange={setVinculoAbierto} onCrear={crearNodo} />
      <FiltrosSheet
        open={filtrosAbierto}
        onOpenChange={setFiltrosAbierto}
        categorias={categoriasDisponibles}
        categoriaIds={filtroCategoriaIds}
        onToggleCategoria={toggleFiltroCategoria}
        prioridades={filtroPrioridades}
        onTogglePrioridad={toggleFiltroPrioridad}
        onLimpiar={limpiarFiltros}
      />
      <NodoDetalleSheet
        nodo={nodoDetalle}
        onOpenChange={(open) => !open && setDetalleId(null)}
        onCompletar={(id) => {
          completar(id);
          setDetalleId(null);
        }}
        onPosponer={posponer}
      />
    </div>
  );
}
