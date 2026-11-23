import type { InputHTMLAttributes } from "react";
import { clasesDeCampo } from "@/shared/ui/clasesCampo";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string;
  ayuda?: string;
}

// Etiqueta + input + mensaje de error. Es presentacional: el estado lo maneja el formulario.
export function Input({ etiqueta, error, ayuda, id, name, ...resto }: InputProps) {
  const idCampo = id ?? name;
  return (
    <div className="mb-4">
      <label htmlFor={idCampo} className="mb-1 block text-sm font-medium text-stone-700">
        {etiqueta}
      </label>
      <input
        id={idCampo}
        name={name}
        aria-invalid={error !== undefined}
        className={clasesDeCampo(error !== undefined)}
        {...resto}
      />
      {ayuda !== undefined && error === undefined && (
        <p className="mt-1 text-xs text-stone-500">{ayuda}</p>
      )}
      {error !== undefined && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}