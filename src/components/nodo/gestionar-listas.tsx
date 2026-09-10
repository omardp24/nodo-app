"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { listasApi, categoriasApi } from "@/lib/resources";
import { cn } from "@/lib/utils";
import type { Categoria, Lista, Recordatorio } from "@/types/recordatorio";

const COLORES = ["var(--primary)", "var(--warning)", "var(--muted-foreground)"];

interface GestionarListasProps {
  nodos: Recordatorio[];
}

export function GestionarListas({ nodos }: GestionarListasProps) {
  const [listas, setListas] = useState<Lista[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);
  const [creandoLista, setCreandoLista] = useState(false);
  const [nombreNuevaLista, setNombreNuevaLista] = useState("");
  const [creandoCategoriaEnLista, setCreandoCategoriaEnLista] = useState<string | null>(null);
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState("");
  const [editando, setEditando] = useState<{ tipo: "lista" | "categoria"; id: string } | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([listasApi.listar(), categoriasApi.listar()])
      .then(([l, c]) => {
        setListas(l);
        setCategorias(c);
      })
      .catch(() => setError("No se pudieron cargar las listas."))
      .finally(() => setCargando(false));
  }, []);

  const totalPorCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const n of nodos) mapa.set(n.categoriaId, (mapa.get(n.categoriaId) ?? 0) + 1);
    return mapa;
  }, [nodos]);

  const categoriasPorLista = useMemo(() => {
    const mapa = new Map<string, Categoria[]>();
    for (const c of categorias) {
      const arr = mapa.get(c.listaId) ?? [];
      arr.push(c);
      mapa.set(c.listaId, arr);
    }
    return mapa;
  }, [categorias]);

  function totalDeLista(listaId: string): number {
    return (categoriasPorLista.get(listaId) ?? []).reduce(
      (acc, c) => acc + (totalPorCategoria.get(c.id) ?? 0),
      0,
    );
  }

  async function crearLista() {
    const nombre = nombreNuevaLista.trim();
    if (!nombre) return;
    setGuardando(true);
    try {
      const lista = await listasApi.crear(nombre);
      setListas((actual) => [...actual, lista].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNombreNuevaLista("");
      setCreandoLista(false);
    } catch {
      setError("No se pudo crear la lista.");
    } finally {
      setGuardando(false);
    }
  }

  async function renombrarLista(id: string) {
    const nombre = nombreEditado.trim();
    if (!nombre) return setEditando(null);
    setGuardando(true);
    try {
      const actualizada = await listasApi.renombrar(id, nombre);
      setListas((actual) => actual.map((l) => (l.id === id ? actualizada : l)));
      setEditando(null);
    } catch {
      setError("No se pudo renombrar la lista.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarLista(lista: Lista) {
    const total = totalDeLista(lista.id);
    const aviso =
      total > 0
        ? `¿Eliminar "${lista.nombre}"? Se van a borrar también sus ${(categoriasPorLista.get(lista.id) ?? []).length} sublista(s) y los ${total} nodo(s) que contienen. Esto no se puede deshacer.`
        : `¿Eliminar "${lista.nombre}"?`;
    if (!window.confirm(aviso)) return;
    setGuardando(true);
    try {
      await listasApi.eliminar(lista.id);
      setListas((actual) => actual.filter((l) => l.id !== lista.id));
      setCategorias((actual) => actual.filter((c) => c.listaId !== lista.id));
    } catch {
      setError("No se pudo eliminar la lista.");
    } finally {
      setGuardando(false);
    }
  }

  async function crearCategoria(listaId: string) {
    const nombre = nombreNuevaCategoria.trim();
    if (!nombre) return;
    setGuardando(true);
    try {
      const categoria = await categoriasApi.crear(nombre, listaId);
      setCategorias((actual) => [...actual, categoria]);
      setNombreNuevaCategoria("");
      setCreandoCategoriaEnLista(null);
    } catch {
      setError("No se pudo crear la sublista.");
    } finally {
      setGuardando(false);
    }
  }

  async function renombrarCategoria(id: string) {
    const nombre = nombreEditado.trim();
    if (!nombre) return setEditando(null);
    setGuardando(true);
    try {
      const actualizada = await categoriasApi.renombrar(id, nombre);
      setCategorias((actual) => actual.map((c) => (c.id === id ? { ...c, nombre: actualizada.nombre } : c)));
      setEditando(null);
    } catch {
      setError("No se pudo renombrar la sublista.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarCategoria(categoria: Categoria) {
    const total = totalPorCategoria.get(categoria.id) ?? 0;
    const aviso =
      total > 0
        ? `¿Eliminar "${categoria.nombre}"? Se van a borrar también sus ${total} nodo(s). Esto no se puede deshacer.`
        : `¿Eliminar "${categoria.nombre}"?`;
    if (!window.confirm(aviso)) return;
    setGuardando(true);
    try {
      await categoriasApi.eliminar(categoria.id);
      setCategorias((actual) => actual.filter((c) => c.id !== categoria.id));
    } catch {
      setError("No se pudo eliminar la sublista.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {listas.map((lista, i) => {
        const color = COLORES[i % COLORES.length];
        const subLista = categoriasPorLista.get(lista.id) ?? [];
        const expandida = expandidaId === lista.id;
        const editandoEsta = editando?.tipo === "lista" && editando.id === lista.id;

        return (
          <div
            key={lista.id}
            className="overflow-hidden rounded-2xl border border-border border-l-[3px] bg-card"
            style={{ borderLeftColor: color }}
          >
            <div className="flex items-center gap-2 px-4 py-3.5">
              {editandoEsta ? (
                <FilaEdicion
                  valor={nombreEditado}
                  onChange={setNombreEditado}
                  onGuardar={() => renombrarLista(lista.id)}
                  onCancelar={() => setEditando(null)}
                  disabled={guardando}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setExpandidaId(expandida ? null : lista.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", !expandida && "-rotate-90")}
                  />
                  <span className="truncate text-[14.5px] font-semibold text-foreground">@{lista.nombre}</span>
                  <span className="shrink-0 text-[11.5px] text-muted-foreground">
                    {subLista.length} {subLista.length === 1 ? "sublista" : "sublistas"}
                  </span>
                </button>
              )}
              {!editandoEsta && (
                <div className="flex shrink-0 items-center gap-0.5">
                  <span className="mr-1 text-[13px] font-semibold tabular-nums text-muted-foreground">
                    {totalDeLista(lista.id)}
                  </span>
                  <IconButton
                    icono={<Pencil className="h-3.5 w-3.5" />}
                    etiqueta={`Renombrar ${lista.nombre}`}
                    onClick={() => {
                      setEditando({ tipo: "lista", id: lista.id });
                      setNombreEditado(lista.nombre);
                    }}
                  />
                  <IconButton
                    icono={<Trash2 className="h-3.5 w-3.5" />}
                    etiqueta={`Eliminar ${lista.nombre}`}
                    destructivo
                    onClick={() => eliminarLista(lista)}
                  />
                </div>
              )}
            </div>

            {expandida && (
              <div className="flex flex-col gap-1.5 border-t border-border px-4 py-3">
                {subLista.map((categoria) => {
                  const editandoEsta = editando?.tipo === "categoria" && editando.id === categoria.id;
                  return (
                    <div key={categoria.id} className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
                      {editandoEsta ? (
                        <FilaEdicion
                          valor={nombreEditado}
                          onChange={setNombreEditado}
                          onGuardar={() => renombrarCategoria(categoria.id)}
                          onCancelar={() => setEditando(null)}
                          disabled={guardando}
                          compacta
                        />
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                            {categoria.nombre}
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                            {totalPorCategoria.get(categoria.id) ?? 0}
                          </span>
                          <IconButton
                            compacto
                            icono={<Pencil className="h-3 w-3" />}
                            etiqueta={`Renombrar ${categoria.nombre}`}
                            onClick={() => {
                              setEditando({ tipo: "categoria", id: categoria.id });
                              setNombreEditado(categoria.nombre);
                            }}
                          />
                          <IconButton
                            compacto
                            icono={<Trash2 className="h-3 w-3" />}
                            etiqueta={`Eliminar ${categoria.nombre}`}
                            destructivo
                            onClick={() => eliminarCategoria(categoria)}
                          />
                        </>
                      )}
                    </div>
                  );
                })}

                {creandoCategoriaEnLista === lista.id ? (
                  <FilaEdicion
                    valor={nombreNuevaCategoria}
                    onChange={setNombreNuevaCategoria}
                    onGuardar={() => crearCategoria(lista.id)}
                    onCancelar={() => {
                      setCreandoCategoriaEnLista(null);
                      setNombreNuevaCategoria("");
                    }}
                    disabled={guardando}
                    placeholder="Nombre de la sublista"
                    compacta
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setCreandoCategoriaEnLista(lista.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-[12.5px] font-medium text-muted-foreground active:border-primary/40 active:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nueva sublista
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {creandoLista ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
          <FilaEdicion
            valor={nombreNuevaLista}
            onChange={setNombreNuevaLista}
            onGuardar={crearLista}
            onCancelar={() => {
              setCreandoLista(false);
              setNombreNuevaLista("");
            }}
            disabled={guardando}
            placeholder="Nombre de la lista"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreandoLista(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground active:border-primary/40 active:text-primary"
        >
          <Plus className="h-4 w-4" />
          Nueva lista
        </button>
      )}
    </div>
  );
}

function FilaEdicion({
  valor,
  onChange,
  onGuardar,
  onCancelar,
  disabled,
  placeholder,
  compacta,
}: {
  valor: string;
  onChange: (v: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
  disabled?: boolean;
  placeholder?: string;
  compacta?: boolean;
}) {
  return (
    <div className="flex flex-1 items-center gap-1.5">
      <input
        autoFocus
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onGuardar();
          if (e.key === "Escape") onCancelar();
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-foreground outline-none focus:border-primary/50",
          compacta ? "text-[13px]" : "text-[14.5px] font-semibold",
        )}
      />
      <IconButton compacto icono={<Check className="h-3.5 w-3.5" />} etiqueta="Guardar" onClick={onGuardar} />
      <IconButton compacto icono={<X className="h-3.5 w-3.5" />} etiqueta="Cancelar" onClick={onCancelar} />
    </div>
  );
}

function IconButton({
  icono,
  etiqueta,
  onClick,
  destructivo,
  compacto,
}: {
  icono: React.ReactNode;
  etiqueta: string;
  onClick: () => void;
  destructivo?: boolean;
  compacto?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors",
        compacto ? "h-6 w-6" : "h-8 w-8",
        destructivo ? "active:bg-destructive/10 active:text-destructive" : "active:bg-secondary active:text-foreground",
      )}
    >
      {icono}
    </button>
  );
}
