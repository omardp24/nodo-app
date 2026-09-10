"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Trash2 } from "lucide-react";
import { gmailApi, listasApi, type CuentaGmail } from "@/lib/resources";
import type { Lista } from "@/types/recordatorio";

export function CorreosConectados() {
  const [cuentas, setCuentas] = useState<CuentaGmail[]>([]);
  const [listas, setListas] = useState<Lista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [asignandoId, setAsignandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([gmailApi.listarCuentas(), listasApi.listar()])
      .then(([c, l]) => {
        setCuentas(c);
        setListas(l);
      })
      .catch(() => setError("No se pudieron cargar las cuentas conectadas."))
      .finally(() => setCargando(false));
  }, []);

  async function cambiarLista(cuenta: CuentaGmail, listaId: string) {
    setAsignandoId(cuenta.id);
    try {
      const actualizada = await gmailApi.asignarLista(cuenta.id, listaId || null);
      setCuentas((actual) => actual.map((c) => (c.id === cuenta.id ? actualizada : c)));
    } catch {
      setError("No se pudo cambiar la lista de esa cuenta.");
    } finally {
      setAsignandoId(null);
    }
  }

  async function desconectar(cuenta: CuentaGmail) {
    if (!window.confirm(`¿Desconectar ${cuenta.email}? Dejará de revisarse esa bandeja.`)) return;
    setEliminandoId(cuenta.id);
    try {
      await gmailApi.desconectarCuenta(cuenta.id);
      setCuentas((actual) => actual.filter((c) => c.id !== cuenta.id));
    } catch {
      setError("No se pudo desconectar la cuenta. Probá de nuevo.");
    } finally {
      setEliminandoId(null);
    }
  }

  function conectarNueva() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    window.open(`${apiUrl}/auth/gmail`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col gap-2">
      {cargando ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-muted-foreground">
          Cargando…
        </div>
      ) : cuentas.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-muted-foreground">
          No tenés ninguna cuenta de Gmail conectada todavía.
        </div>
      ) : (
        cuentas.map((cuenta) => (
          <div
            key={cuenta.id}
            className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-secondary text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold text-foreground">{cuenta.email}</div>
                {!cuenta.filtrarPorPrincipal && (
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    Revisa todo el inbox (sin pestañas de Gmail)
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => desconectar(cuenta)}
                disabled={eliminandoId === cuenta.id}
                aria-label={`Desconectar ${cuenta.email}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-destructive/10 active:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <label className="flex items-center gap-2 border-t border-border pt-2.5 text-[11.5px] text-muted-foreground">
              Sus correos van a
              <select
                value={cuenta.listaId ?? ""}
                onChange={(e) => cambiarLista(cuenta, e.target.value)}
                disabled={asignandoId === cuenta.id}
                aria-label={`Lista de destino para ${cuenta.email}`}
                className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-2 py-1 text-[12.5px] font-medium text-foreground outline-none disabled:opacity-50"
              >
                <option value="">Correos (compartida)</option>
                {listas.map((lista) => (
                  <option key={lista.id} value={lista.id}>
                    {lista.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="button"
        onClick={conectarNueva}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground active:border-primary/40 active:text-primary"
      >
        <Plus className="h-4 w-4" />
        Conectar otra cuenta
      </button>
    </div>
  );
}
