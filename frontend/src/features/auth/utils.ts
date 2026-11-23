// El estado que viaja en la navegación (location.state) llega como "unknown":
// estas funciones lo leen de forma segura, sin usar any.

// Ruta a la que volver después de iniciar sesión (la pone ProtectedRoute)
export function leerDestinoTrasLogin(estado: unknown): string {
  if (typeof estado === "object" && estado !== null && "desde" in estado) {
    const { desde } = estado;
    if (typeof desde === "string" && desde.startsWith("/")) return desde;
  }
  return "/";
}

// true si se llegó al login justo después de registrarse
export function leerRecienRegistrado(estado: unknown): boolean {
  return (
    typeof estado === "object" &&
    estado !== null &&
    "registrado" in estado &&
    estado.registrado === true
  );
}