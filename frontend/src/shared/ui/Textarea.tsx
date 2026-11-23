import type { TextareaHTMLAttributes } from "react";
import { clasesDeCampo } from "@/shared/ui/clasesCampo";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  etiqueta: string;
  error?: string;
  ayuda?: string;
}

export function Textarea({ etiqueta, error, ayuda, id, name, ...resto }: TextareaProps) {
  const idCampo = id ?? name;
  return (
    <div className="mb-4">
      <label htmlFor={idCampo} className="mb-1 block text-sm font-medium text-stone-700">
        {etiqueta}
      </label>
      <textarea
        id={idCampo}
        name={name}
        rows={3}
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