export function devuelveSoloFecha(fecha: string | null | undefined): string {
  if (!fecha) return '';
  
  // caso: "2025-08-01 00:00" → "2025-08-01"
  if (fecha.includes(' ')) {
    return fecha.split(' ')[0];
  }

  // caso: "2025-08-01" ya viene sin hora
  return fecha;
}
