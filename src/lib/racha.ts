import { addDays, toISODate } from "./date";
import type { Recordatorio } from "@/types/recordatorio";

export interface EstadisticasActividad {
  /** Días consecutivos (terminando hoy) con todos los nodos de ese día completados. */
  rachaActual: number;
  /** La racha más larga dentro de la ventana analizada. */
  rachaMaxima: number;
  /** % de nodos completados cuya última actualización fue antes o igual a su fechaLimite. Null si no hay completados con fecha. */
  porcentajeATiempo: number | null;
  totalCompletados: number;
}

const MAX_DIAS = 90;
const MAX_VACIOS_SEGUIDOS = 14;

/**
 * Un día sin nodos ni suma ni rompe la racha (no había nada que cumplir).
 * Hoy nunca rompe la racha aunque esté incompleto — el día no terminó todavía.
 * Se corta la ventana de análisis tras muchos días vacíos seguidos para no
 * inflar la racha con un nodo aislado de hace meses.
 */
export function calcularEstadisticas(nodos: Recordatorio[]): EstadisticasActividad {
  let rachaActual = 0;
  let rachaMaxima = 0;
  let rachaEnCurso = 0;
  let rachaActualCerrada = false;
  let vaciosSeguidos = 0;
  let cursor = new Date();

  for (let i = 0; i < MAX_DIAS; i++) {
    const key = toISODate(cursor);
    const delDia = nodos.filter((n) => n.fechaLimite && toISODate(new Date(n.fechaLimite)) === key);

    if (delDia.length === 0) {
      vaciosSeguidos++;
      if (vaciosSeguidos > MAX_VACIOS_SEGUIDOS) break;
      cursor = addDays(cursor, -1);
      continue;
    }
    vaciosSeguidos = 0;

    const todosCompletados = delDia.every((n) => n.estado === "COMPLETADO");
    if (todosCompletados) {
      rachaEnCurso++;
      rachaMaxima = Math.max(rachaMaxima, rachaEnCurso);
      if (!rachaActualCerrada) rachaActual++;
    } else {
      rachaEnCurso = 0;
      if (i > 0) rachaActualCerrada = true;
    }
    cursor = addDays(cursor, -1);
  }

  const completadosConFecha = nodos.filter((n) => n.estado === "COMPLETADO" && n.fechaLimite);
  const aTiempo = completadosConFecha.filter(
    (n) => new Date(n.updatedAt).getTime() <= new Date(n.fechaLimite!).getTime(),
  ).length;

  return {
    rachaActual,
    rachaMaxima,
    porcentajeATiempo:
      completadosConFecha.length > 0 ? Math.round((aTiempo / completadosConFecha.length) * 100) : null,
    totalCompletados: nodos.filter((n) => n.estado === "COMPLETADO").length,
  };
}
