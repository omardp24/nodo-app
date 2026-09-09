"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Trash2 } from "lucide-react";
import { gmailApi, type CuentaGmail } from "@/lib/resources";

export function CorreosConectados() {
  const [cuentas, setCuentas] = useState<CuentaGmail[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gmailApi
      .listarCuentas()
      .then(setCuentas)
      .catch(() => setError("No se pudieron cargar las cuentas conectadas."))
      .finally(() => setCargando(false));
  }, []);

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
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
          >
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
