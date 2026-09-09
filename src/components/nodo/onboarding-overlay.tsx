"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingOverlayProps {
  abierto: boolean;
  onCerrar: () => void;
}

const PASOS = [
  {
    titulo: "Un día, un hilo.",
    texto:
      "Tus recordatorios dejan de ser una lista suelta: se enlazan en orden, y ves de un vistazo qué viene ahora.",
    cta: "Siguiente",
  },
  {
    titulo: "Háblale, y ya.",
    texto: "Vínculo entiende «pagar la luz mañana 9am, 45 dólares en el Banesco» y arma el nodo por ti.",
    cta: "Siguiente",
  },
  {
    titulo: "Cierra el día.",
    texto: "Cada nodo que completas llena el hilo. Terminar el día se siente como terminar algo.",
    cta: "Empezar",
  },
];

export function OnboardingOverlay({ abierto, onCerrar }: OnboardingOverlayProps) {
  const [paso, setPaso] = useState(0);

  if (!abierto) return null;

  const actual = PASOS[paso];

  function siguiente() {
    if (paso < PASOS.length - 1) {
      setPaso((p) => p + 1);
    } else {
      setPaso(0);
      onCerrar();
    }
  }

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-between bg-background px-8 pb-10 pt-16">
      <div className="flex flex-col gap-9">
        <svg width="76" height="106" viewBox="0 0 36 52" fill="none" className="animate-bounce [animation-duration:3s]">
          <defs>
            <linearGradient id="onb-grad" x1="0" y1="52" x2="36" y2="0">
              <stop offset="0" stopColor="var(--primary)" />
              <stop offset="1" stopColor="var(--warning)" />
            </linearGradient>
          </defs>
          <path
            d="M7 45V9l22 34V9"
            stroke="url(#onb-grad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="45" r="4.6" fill="var(--primary)" />
          <circle cx="7" cy="9" r="4.6" fill="var(--primary)" />
          <circle cx="29" cy="43" r="4.6" fill="var(--warning)" />
          <circle cx="29" cy="9" r="4.6" fill="var(--warning)" />
        </svg>
        <div key={paso} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h1 className="text-[38px] font-bold leading-[1.05] tracking-tight text-foreground">
            {actual.titulo}
          </h1>
          <p className="mt-3.5 max-w-[280px] text-base leading-relaxed text-muted-foreground">
            {actual.texto}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5">
          {PASOS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[7px] rounded-full transition-all duration-300",
                i === paso ? "w-[26px] bg-primary" : "w-[7px] bg-border",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={siguiente}
          className="flex items-center gap-2 rounded-full bg-primary px-6.5 py-4 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/35"
        >
          {actual.cta}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
