"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Mic, Sparkles } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { asistenteApi, type InterpretacionRecordatorio } from "@/lib/resources";
import { ApiError } from "@/lib/api";

interface VinculoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCrear: (nodo: InterpretacionRecordatorio) => void;
}

const SUGERENCIAS = ["Mañana 9am", "En 2 horas", "En 30 minutos", "Hoy 6pm"];
const DEBOUNCE_MS = 600;

export function VinculoSheet({ open, onOpenChange, onCrear }: VinculoSheetProps) {
  const [texto, setTexto] = useState("");
  const [preview, setPreview] = useState<InterpretacionRecordatorio | null>(null);
  const [interpretando, setInterpretando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idPeticion = useRef(0);

  const { soportado: micSoportado, escuchando, alternar: alternarMic } =
    useSpeechRecognition((transcrito) =>
      setTexto((actual) => (actual ? `${actual} ${transcrito}` : transcrito)),
    );

  useEffect(() => {
    if (!texto.trim()) return;

    const miId = ++idPeticion.current;
    const timeout = setTimeout(async () => {
      setInterpretando(true);
      setError(null);
      try {
        const resultado = await asistenteApi.interpretar(texto.trim());
        if (idPeticion.current === miId) setPreview(resultado);
      } catch (e) {
        if (idPeticion.current === miId) {
          setPreview(null);
          setError(
            e instanceof ApiError && e.status === 503
              ? "El asistente no está configurado todavía."
              : "No se pudo interpretar el texto.",
          );
        }
      } finally {
        if (idPeticion.current === miId) setInterpretando(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [texto]);

  function actualizarTexto(valor: string) {
    setTexto(valor);
    if (!valor.trim()) {
      setPreview(null);
      setError(null);
    }
  }

  function agregarSugerencia(sugerencia: string) {
    setTexto((actual) => (actual ? `${actual} ${sugerencia}` : sugerencia));
  }

  function confirmar() {
    if (!preview) return;
    onCrear(preview);
    setTexto("");
    setPreview(null);
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border bg-card">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Vínculo
          </DrawerTitle>
          <DrawerDescription>
            Escribe o dicta un recordatorio en lenguaje natural.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
          {/* Vista previa en vivo */}
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 transition-colors",
              error
                ? "border-destructive/40 bg-destructive/10"
                : preview
                  ? "border-primary/40 bg-primary/10"
                  : "border-dashed border-border bg-background/40",
            )}
          >
            {interpretando ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Interpretando…
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : preview ? (
              <>
                <p className="truncate text-sm font-medium text-foreground">{preview.titulo}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {preview.fechaLimite
                    ? new Date(preview.fechaLimite).toLocaleString("es", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Sin fecha"}
                  {preview.monto != null && ` · ${preview.monto}${preview.banco ? ` · ${preview.banco}` : ""}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                El nodo que vas a crear aparece aquí mientras escribes…
              </p>
            )}
          </div>

          {/* Sugerencias rápidas en píldoras */}
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SUGERENCIAS.map((sugerencia) => (
              <button
                key={sugerencia}
                type="button"
                onClick={() => agregarSugerencia(sugerencia)}
                className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors active:border-primary active:text-primary"
              >
                {sugerencia}
              </button>
            ))}
          </div>

          {/* Input + mic + enviar */}
          <div className="flex items-end gap-2">
            <textarea
              value={texto}
              onChange={(e) => actualizarTexto(e.target.value)}
              placeholder="Ej: pagar la luz mañana 9am, 45 dólares en el Banesco"
              rows={1}
              className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              type="button"
              onClick={alternarMic}
              disabled={!micSoportado}
              aria-label="Dictar por voz"
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-30",
                escuchando
                  ? "animate-pulse border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground active:text-foreground",
              )}
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={!preview}
              aria-label="Crear nodo"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
