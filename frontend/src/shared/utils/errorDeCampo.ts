import type { AnyFieldApi } from "@tanstack/react-form";

// Mensaje de error de un campo de TanStack Form. Solo se muestra después de tocar el campo.
export function errorDeCampo(campo: AnyFieldApi): string | undefined {
  if (!campo.state.meta.isTouched) return undefined;
  const errores = campo.state.meta.errors.map((error) => String(error));
  return errores.length > 0 ? errores.join(". ") : undefined;
}