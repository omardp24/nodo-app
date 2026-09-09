import type { Prioridad } from "@/types/recordatorio";

// Usa la paleta de marca: ALTA = naranja acento (alert state), MEDIA = azul
// principal, BAJA = texto secundario (gris neutro, la menos llamativa).
export const PRIORIDAD_COLOR: Record<Prioridad, string> = {
  ALTA: "#FF7043",
  MEDIA: "#1E88E5",
  BAJA: "#8B949E",
};
