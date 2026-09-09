"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Bell, ChevronRight, CircleHelp, LogOut, Mic, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePushNotifications } from "@/lib/use-push-notifications";
import { calcularEstadisticas } from "@/lib/racha";
import { cn } from "@/lib/utils";
import type { Recordatorio } from "@/types/recordatorio";

interface PerfilProps {
  nodos: Recordatorio[];
  vozHabilitada: boolean;
  onToggleVoz: () => void;
  onVerOnboarding: () => void;
}

const COLORES_LISTA = ["var(--primary)", "var(--warning)", "var(--muted-foreground)"];

function nombreDeEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function Perfil({ nodos, vozHabilitada, onToggleVoz, onVerOnboarding }: PerfilProps) {
  const { session, cerrarSesion } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { soportado: pushSoportado, suscrito: pushSuscrito, cargando: pushCargando, activar, desactivar } =
    usePushNotifications();

  const email = session?.user.email ?? "";
  const nombre = nombreDeEmail(email);
  const inicial = nombre.charAt(0).toUpperCase();
  const esOscuro = resolvedTheme === "dark";

  const estadisticas = useMemo(() => calcularEstadisticas(nodos), [nodos]);

  const misListas = useMemo(() => {
    const mapa = new Map<string, { nombre: string; categorias: Set<string>; total: number }>();
    for (const n of nodos) {
      const nombreLista = n.categoria.lista?.nombre ?? "Sin lista";
      const entrada = mapa.get(nombreLista) ?? { nombre: nombreLista, categorias: new Set(), total: 0 };
      entrada.categorias.add(n.categoria.nombre);
      entrada.total += 1;
      mapa.set(nombreLista, entrada);
    }
    return [...mapa.values()]
      .sort((a, b) => b.total - a.total)
      .map((l, i) => ({ ...l, color: COLORES_LISTA[i % COLORES_LISTA.length] }));
  }, [nodos]);

  return (
    <div className="flex flex-col gap-6 px-4 pb-2 pt-2">
      <div className="flex items-center gap-4">
        <div className="relative flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-warning p-[2.5px]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-2xl font-bold tracking-tight text-foreground">
            {inicial}
          </div>
          {estadisticas.rachaActual > 0 && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-[22px] items-center justify-center rounded-full border-[2.5px] border-background bg-warning px-1.5 text-[10px] font-extrabold tabular-nums text-white">
              {estadisticas.rachaActual}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-2xl font-bold leading-tight tracking-tight text-foreground">
            {nombre}
          </div>
          <div className="mt-1 truncate text-[13px] text-muted-foreground">{email}</div>
          {estadisticas.rachaActual > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-light">
              {estadisticas.rachaActual} {estadisticas.rachaActual === 1 ? "día" : "días"} de racha
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <TarjetaStat valor={estadisticas.totalCompletados} etiqueta="nodos cerrados" />
        <TarjetaStat
          valor={estadisticas.porcentajeATiempo != null ? `${estadisticas.porcentajeATiempo}%` : "—"}
          etiqueta="a tiempo"
        />
        <TarjetaStat valor={estadisticas.rachaMaxima} etiqueta="racha máxima" />
      </div>

      {misListas.length > 0 && (
        <div>
          <EncabezadoSeccion titulo="Mis listas" />
          <div className="flex flex-col gap-2">
            {misListas.map((lista) => (
              <div
                key={lista.nombre}
                className="flex items-center gap-3 rounded-2xl border border-border border-l-[3px] bg-card px-4 py-3.5"
                style={{ borderLeftColor: lista.color }}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-semibold text-foreground">
                    @{lista.nombre}
                  </div>
                  <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                    {[...lista.categorias].join(" · ")}
                  </div>
                </div>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums text-muted-foreground">
                  {lista.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <EncabezadoSeccion titulo="Ajustes" />
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {pushSoportado && (
            <FilaAjuste
              icono={<Bell className="h-4 w-4" />}
              titulo="Recordatorios push"
              subtitulo={pushSuscrito ? "Activos en este dispositivo" : "Avisan cuando vence un nodo"}
            >
              <Interruptor
                activo={pushSuscrito}
                cargando={pushCargando}
                onToggle={() => (pushSuscrito ? desactivar() : activar())}
                ariaLabel="Activar recordatorios push"
              />
            </FilaAjuste>
          )}

          <FilaAjuste
            icono={esOscuro ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            titulo="Apariencia"
            subtitulo={esOscuro ? "Tema oscuro" : "Tema claro"}
          >
            <div className="flex gap-0.5 rounded-full bg-secondary p-[3px]">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors",
                  esOscuro ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                Oscuro
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors",
                  !esOscuro ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                Claro
              </button>
            </div>
          </FilaAjuste>

          <FilaAjuste
            icono={<Mic className="h-4 w-4" />}
            titulo="Vínculo por voz"
            subtitulo={vozHabilitada ? "Dictado disponible" : "Dictado desactivado"}
          >
            <Interruptor activo={vozHabilitada} onToggle={onToggleVoz} ariaLabel="Activar dictado por voz" />
          </FilaAjuste>

          <button
            type="button"
            onClick={onVerOnboarding}
            className="flex items-center gap-3 bg-card px-4 py-3.5 text-left"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-secondary text-muted-foreground">
              <CircleHelp className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">Cómo funciona Nodo</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={cerrarSesion}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3.5 text-sm font-semibold text-warning"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
      <div className="pb-4 text-center text-[11px] text-muted-foreground">
        Nodo · hecho para hilar días
      </div>
    </div>
  );
}

function EncabezadoSeccion({ titulo }: { titulo: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{titulo}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function TarjetaStat({ valor, etiqueta }: { valor: string | number; etiqueta: string }) {
  return (
    <div className="flex-1 rounded-[18px] border border-border bg-card px-3.5 py-3.5">
      <div className="text-2xl font-bold leading-none tracking-tight tabular-nums text-foreground">{valor}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{etiqueta}</div>
    </div>
  );
}

function FilaAjuste({
  icono,
  titulo,
  subtitulo,
  children,
}: {
  icono: React.ReactNode;
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-card px-4 py-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-secondary text-muted-foreground">
        {icono}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{titulo}</div>
        <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{subtitulo}</div>
      </div>
      {children}
    </div>
  );
}

function Interruptor({
  activo,
  cargando,
  onToggle,
  ariaLabel,
}: {
  activo: boolean;
  cargando?: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={cargando}
      aria-label={ariaLabel}
      className={cn(
        "relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors disabled:opacity-60",
        activo ? "bg-primary" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow transition-all",
          activo ? "left-[22px]" : "left-[3px]",
        )}
      />
    </button>
  );
}
