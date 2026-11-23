import type { HTMLAttributes } from "react";

// Tarjeta blanca con borde: contenedor base de formularios, listas y paneles
export function Card({ className = "", children, ...resto }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white shadow-sm ${className}`}
      {...resto}
    >
      {children}
    </div>
  );
}