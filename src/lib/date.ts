export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

const DIA_ABBR = ["D", "L", "M", "X", "J", "V", "S"];
const MES_ABBR = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** Hora local a partir de un ISO string — "HH:mm" (24h) o "h:mm a. m./p. m." (12h) según formato12h. */
export function horaDeISO(iso: string, formato12h = false): string {
  const d = new Date(iso);
  if (formato12h) {
    return d.toLocaleTimeString("es", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Suma horas a un ISO string y devuelve el nuevo ISO string. */
export function sumarHorasISO(iso: string, horas: number): string {
  return new Date(new Date(iso).getTime() + horas * 60 * 60 * 1000).toISOString();
}

/** Mueve un ISO string al mismo horario, un día después. */
export function sumarUnDiaISO(iso: string): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

export function diaAbreviado(date: Date): string {
  return DIA_ABBR[date.getDay()];
}

export function mesAbreviado(date: Date): string {
  return MES_ABBR[date.getMonth()];
}

/** Tiempo relativo corto a un ISO string futuro/pasado ("en 1 h 20", "atrasado"). */
export function faltaPara(iso: string): string {
  const diffMin = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (diffMin <= 0) return "atrasado";
  if (diffMin < 60) return `en ${diffMin} min`;
  const horas = Math.floor(diffMin / 60);
  const min = diffMin % 60;
  if (horas < 24) return min > 0 ? `en ${horas} h ${min}` : `en ${horas} h`;
  return `en ${Math.floor(horas / 24)} d`;
}
