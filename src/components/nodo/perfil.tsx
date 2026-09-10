"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Bell, ChevronRight, CircleHelp, Clock, LogOut, Mic, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePushNotifications } from "@/lib/use-push-notifications";
import { usePreferencias } from "@/lib/preferencias-context";
import { calcularEstadisticas } from "@/lib/racha";
import { cn } from "@/lib/utils";
import { CorreosConectados } from "@/components/nodo/correos-conectados";
import { GestionarListas } from "@/components/nodo/gestionar-listas";
import type { Recordatorio } from "@/types/recordatorio";

interface PerfilProps {
  nodos: Recordatorio[];
  vozHabilitada: boolean;
  onToggleVoz: () => void;
  onVerOnboarding: () => void;
}

function nombreDeEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function Perfil({ nodos, vozHabilitada, onToggleVoz, onVerOnboarding }: PerfilProps) {
  const { session, cerrarSesion } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { soportado: pushSoportado, suscrito: pushSuscrito, cargando: pushCargando, activar, desactivar } =
    usePushNotifications();
  const { formatoHora, setFormatoHora } = usePreferencias();

  const email = session?.user.email ?? "";
  const nombre = nombreDeEmail(email);
  const inicial = nombre.charAt(0).toUpperCase();
  const esOscuro = resolvedTheme === "dark";

  const estadisticas = useMemo(() => calcularEstadisticas(nodos), [nodos]);

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

      <div>
        <EncabezadoSeccion titulo="Mis listas" />
        <GestionarListas nodos={nodos} />
      </div>

      <div>
        <EncabezadoSeccion titulo="Correos conectados" />
        <CorreosConectados />
      </div>

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
            icono={<Clock className="h-4 w-4" />}
            titulo="Formato de hora"
            subtitulo={formatoHora === "12h" ? "12 horas (2:30 p. m.)" : "24 horas (14:30)"}
          >
            <div className="flex gap-0.5 rounded-full bg-secondary p-[3px]">
              <button
                type="button"
                onClick={() => setFormatoHora("24h")}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors",
                  formatoHora === "24h" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                24h
              </button>
              <button
                type="button"
                onClick={() => setFormatoHora("12h")}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors",
                  formatoHora === "12h" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                12h
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
