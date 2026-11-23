import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

// Mensaje para listas sin resultados
export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <p className="text-lg font-semibold text-stone-800">{titulo}</p>
      {descripcion !== undefined && <p className="mt-1 text-sm text-stone-500">{descripcion}</p>}
      {accion !== undefined && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  );
}