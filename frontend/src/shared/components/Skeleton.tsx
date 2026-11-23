interface SkeletonProps {
  className?: string;
}

// Bloque gris animado que ocupa el lugar del contenido mientras carga
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-stone-200 ${className}`} />;
}