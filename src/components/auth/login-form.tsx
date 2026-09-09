"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { NodoWordmark } from "@/components/nodo/nodo-wordmark";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setMensaje(null);

    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error, data } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (!data.session) {
        setMensaje("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.");
      }
    }
    setCargando(false);
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-xs">
        <div className="mb-10 flex flex-col items-center">
          <NodoWordmark tamanoTexto="text-4xl" />
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />

          {error && <p className="text-xs text-destructive">{error}</p>}
          {mensaje && <p className="text-xs text-primary">{mensaje}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {cargando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setModo((m) => (m === "entrar" ? "crear" : "entrar"));
            setError(null);
            setMensaje(null);
          }}
          className={cn(
            "mt-4 w-full text-center text-xs text-muted-foreground transition-colors active:text-foreground",
          )}
        >
          {modo === "entrar" ? "¿No tienes cuenta? Créala" : "¿Ya tienes cuenta? Entra"}
        </button>
      </div>
    </div>
  );
}
