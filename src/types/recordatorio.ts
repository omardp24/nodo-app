export type Prioridad = "BAJA" | "MEDIA" | "ALTA";
export type EstadoRecordatorio = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO";
export type OrigenRecordatorio = "CORREO" | "VOZ" | "MANUAL";

export interface Lista {
  id: string;
  nombre: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  listaId: string;
  lista?: Lista;
}

export interface Recordatorio {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaLimite: string | null;
  prioridad: Prioridad;
  estado: EstadoRecordatorio;
  origen: OrigenRecordatorio;
  monto: number | null;
  banco: string | null;
  categoriaId: string;
  categoria: Categoria;
  createdAt: string;
  updatedAt: string;
}

export interface CrearRecordatorioInput {
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  prioridad?: Prioridad;
  origen?: OrigenRecordatorio;
  monto?: number;
  banco?: string;
  categoriaId: string;
}
