"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type FormatoHora = "24h" | "12h";

interface PreferenciasValue {
  formatoHora: FormatoHora;
  setFormatoHora: (formato: FormatoHora) => void;
}

const PreferenciasContext = createContext<PreferenciasValue | null>(null);
const CLAVE_FORMATO_HORA = "nodo-formato-hora";

function leerFormatoHora(): FormatoHora {
  if (typeof window === "undefined") return "24h";
  try {
    const valor = window.localStorage.getItem(CLAVE_FORMATO_HORA);
    return valor === "12h" ? "12h" : "24h";
  } catch {
    return "24h";
  }
}

export function PreferenciasProvider({ children }: { children: React.ReactNode }) {
  const [formatoHora, setFormatoHoraState] = useState<FormatoHora>(leerFormatoHora);

  const setFormatoHora = useCallback((formato: FormatoHora) => {
    setFormatoHoraState(formato);
    try {
      window.localStorage.setItem(CLAVE_FORMATO_HORA, formato);
    } catch {
      // localStorage puede fallar en navegación privada — no es crítico, solo no persiste.
    }
  }, []);

  return (
    <PreferenciasContext.Provider value={{ formatoHora, setFormatoHora }}>
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  const ctx = useContext(PreferenciasContext);
  if (!ctx) throw new Error("usePreferencias debe usarse dentro de <PreferenciasProvider>");
  return ctx;
}
