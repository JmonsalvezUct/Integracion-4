/**
 * Convierte un string ISO (YYYY-MM-DD) en formato legible YYYY/MM/DD
 * Ej: "2025-11-17" → "2025/11/17"
 */
export function displayDateFromISO(iso?: string | null): string {
  if (!iso) return "";
  return String(iso).slice(0, 10).replace(/-/g, "/");
}

/**
 * Convierte un string ingresado como YYYY/MM/DD o YYYY-MM-DD a ISO YYYY-MM-DD
 * Si no calza con el formato esperado, intenta convertir con Date()
 */
export function parseDisplayDateToISO(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  // Reemplazar "/" por "-" para estandarizar
  const cleaned = raw.replace(/\//g, "-");
  const parts = cleaned.split("-");

  // Formato correcto (YYYY-MM-DD)
  if (parts.length === 3) {
    const y = parts[0].padStart(4, "0");
    const m = parts[1].padStart(2, "0");
    const d = parts[2].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Intento automático con Date()
  const dt = new Date(raw);
  if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);

  return cleaned;
}
