"use client";

import { Activity, CalendarDays, CircleUser, Sparkles, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "hoy" | "proximos" | "actividad" | "perfil";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  onAbrirVinculo: () => void;
}

const TABS: { id: Tab; label: string; icon: typeof Sun }[] = [
  { id: "hoy", label: "Hoy", icon: Sun },
  { id: "proximos", label: "Próximos", icon: CalendarDays },
  { id: "actividad", label: "Actividad", icon: Activity },
  { id: "perfil", label: "Perfil", icon: CircleUser },
];

export function BottomNav({ active, onChange, onAbrirVinculo }: BottomNavProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card/90 px-2 py-2 shadow-lg shadow-black/40 backdrop-blur-md">
        {TABS.slice(0, 2).map((tab) => (
          <TabButton key={tab.id} tab={tab} active={active === tab.id} onChange={onChange} />
        ))}

        <button
          type="button"
          onClick={onAbrirVinculo}
          aria-label="Abrir Vínculo"
          className="mx-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/40 transition-transform active:scale-95"
        >
          <Sparkles className="h-5 w-5" />
        </button>

        {TABS.slice(2).map((tab) => (
          <TabButton key={tab.id} tab={tab} active={active === tab.id} onChange={onChange} />
        ))}
      </nav>
    </div>
  );
}

function TabButton({
  tab,
  active,
  onChange,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onChange: (tab: Tab) => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={() => onChange(tab.id)}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 text-[10px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground active:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
      {tab.label}
    </button>
  );
}
