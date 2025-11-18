/**
 * Normaliza un string para comparaciones:
 * - pasa a minúsculas
 * - elimina espacios al inicio y final
 * - convierte espacios internos en "_"
 */
export function normalize(value: any): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

/**
 * Traducción segura usando un mapa:
 * Si el valor no está en el mapa, devuelve el original o '—'
 *
 * Ej:
 * t({ high: "Alta" }, "HIGH") => "Alta"
 */
export const t = (map: Record<string, string>, v: any) =>
  map[normalize(v)] ?? (v ?? '—');
