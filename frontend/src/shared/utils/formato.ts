const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

const formatoFechaHora = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

// 1500 -> "$ 1.500,00"
export function formatearPrecio(valor: number): string {
  return formatoMoneda.format(valor);
}

// "2026-11-21T06:10:31Z" -> "21 nov 2026, 03:10"
export function formatearFechaHora(fechaIso: string): string {
  return formatoFechaHora.format(new Date(fechaIso));
}