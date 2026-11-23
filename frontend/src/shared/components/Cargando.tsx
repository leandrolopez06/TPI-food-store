// Indicador de carga de pantalla completa (por ejemplo, mientras se confirma la sesión)
export function Cargando() {
  return (
    <div role="status" className="flex min-h-[50vh] items-center justify-center gap-3 text-stone-500">
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-2 border-orange-600 border-t-transparent"
      />
      <span className="text-sm font-medium">Cargando...</span>
    </div>
  );
}