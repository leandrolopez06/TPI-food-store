import type { SelectHTMLAttributes } from "react";
import { clasesDeCampo } from "@/shared/ui/clasesCampo";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string;
  error?: string;
}

// Lista desplegable con etiqueta; las <option> van como hijos
export function Select({ etiqueta, error, id, name, children, ...resto }: SelectProps) {
  const idCampo = id ?? name;
  return (
    <div className="mb-4">
      <label htmlFor={idCampo} className="mb-1 block text-sm font-medium text-stone-700">
        {etiqueta}
      </label>
      <select
        id={idCampo}
        name={name}
        aria-invalid={error !== undefined}
        className={clasesDeCampo(error !== undefined)}
        {...resto}
      >
        {children}
      </select>
      {error !== undefined && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}