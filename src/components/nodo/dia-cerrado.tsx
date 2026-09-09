"use client";

import { Check } from "lucide-react";

interface DiaCerradoProps {
  total: number;
  racha: number;
}

export function DiaCerrado({ total, racha }: DiaCerradoProps) {
  return (
    <div className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-5 py-9 text-center duration-300">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-warning text-primary-foreground">
        <Check className="h-7 w-7" strokeWidth={3} />
      </div>
      <div className="text-[19px] font-bold tracking-tight text-foreground">Día cerrado</div>
      <div className="text-[13px] text-muted-foreground">
        Hilaste los {total} nodos de hoy.
        {racha > 1 && ` Racha de ${racha} días.`}
      </div>
    </div>
  );
}
