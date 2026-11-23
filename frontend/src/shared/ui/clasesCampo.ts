const BASE_CAMPO =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2";

// Clases de Tailwind de los campos de formulario (Input, Select y Textarea);
// el borde se pone rojo cuando el campo tiene un error
export function clasesDeCampo(hayError: boolean): string {
  return `${BASE_CAMPO} ${
    hayError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-stone-300 focus:border-orange-500 focus:ring-orange-100"
  }`;
}