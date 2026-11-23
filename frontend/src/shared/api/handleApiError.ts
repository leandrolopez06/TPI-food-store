import axios from "axios";

interface ErrorDeValidacion {
  msg: string;
  loc?: (string | number)[];
}

interface CuerpoDeError {
  detail?: string | ErrorDeValidacion[];
}

const MENSAJE_POR_DEFECTO = "Ocurrió un error inesperado. Probá de nuevo.";

// Traduce el "detail" que devuelve la API (un texto, o una lista en los errores 422)
// a un mensaje listo para mostrar en pantalla.
export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError<CuerpoDeError>(error)) return MENSAJE_POR_DEFECTO;

  if (error.response === undefined) {
    return "No se pudo conectar con el servidor. Revisá que el backend esté corriendo.";
  }

  const detalle = error.response.data?.detail;
  if (typeof detalle === "string") return detalle;
  if (Array.isArray(detalle) && detalle.length > 0) {
    return detalle.map((item) => item.msg).join(". ");
  }
  return MENSAJE_POR_DEFECTO;
}