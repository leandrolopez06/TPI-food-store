import { Skeleton } from "@/shared/components/Skeleton";

interface SkeletonTablaProps {
  filas?: number;
}

// Filas grises que ocupan el lugar de una tabla mientras carga
export function SkeletonTabla({ filas = 5 }: SkeletonTablaProps) {
  return (
    <div
      role="status"
      aria-label="Cargando datos"
      className="space-y-3 rounded-xl border border-stone-200 bg-white p-4"
    >
      {Array.from({ length: filas }, (_, indice) => (
        <Skeleton key={indice} className="h-10 w-full" />
      ))}
    </div>
  );
}