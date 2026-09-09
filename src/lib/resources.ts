import { api } from "./api";
import type { Categoria, CrearRecordatorioInput, Lista, Recordatorio } from "@/types/recordatorio";

export const listasApi = {
  listar: () => api.get<Lista[]>("/listas"),
  crear: (nombre: string) => api.post<Lista>("/listas", { nombre }),
};

export const categoriasApi = {
  listar: (listaId?: string) =>
    api.get<Categoria[]>(`/categorias${listaId ? `?listaId=${listaId}` : ""}`),
  crear: (nombre: string, listaId: string) =>
    api.post<Categoria>("/categorias", { nombre, listaId }),
};

export const recordatoriosApi = {
  listar: () => api.get<Recordatorio[]>("/recordatorios"),
  crear: (input: CrearRecordatorioInput) => api.post<Recordatorio>("/recordatorios", input),
  actualizar: (id: string, patch: Partial<CrearRecordatorioInput> & { estado?: string }) =>
    api.patch<Recordatorio>(`/recordatorios/${id}`, patch),
};

export interface InterpretacionRecordatorio {
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  prioridad?: "BAJA" | "MEDIA" | "ALTA";
  monto?: number;
  banco?: string;
}

export const asistenteApi = {
  interpretar: (texto: string) =>
    api.post<InterpretacionRecordatorio>("/asistente/interpretar", {
      texto,
      // Sin esto el backend no tiene forma de saber en qué zona horaria interpretar
      // horas relativas como "4 de la tarde" — las resolvía en UTC por defecto.
      zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
};

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export const notificacionesApi = {
  suscribir: (sub: PushSubscriptionInput) => api.post("/notificaciones/suscripcion", sub),
  desuscribir: (endpoint: string) => api.delete("/notificaciones/suscripcion", { endpoint }),
};

export interface CuentaGmail {
  id: string;
  email: string;
  filtrarPorPrincipal: boolean;
  createdAt: string;
}

export const gmailApi = {
  listarCuentas: () => api.get<CuentaGmail[]>("/gmail/cuentas"),
  desconectarCuenta: (id: string) => api.delete<void>(`/gmail/cuentas/${id}`),
};
