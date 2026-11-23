import { Button } from "@/shared/ui/Button";

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

// Mensaje para cuando falla la carga de una lista
export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="font-semibold text-red-800">No se pudo cargar la información</p>
      <p className="mt-1 text-sm text-red-700">{mensaje}</p>
      {onReintentar !== undefined && (
        <div className="mt-4 flex justify-center">
          <Button variante="secondary" onClick={onReintentar}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}