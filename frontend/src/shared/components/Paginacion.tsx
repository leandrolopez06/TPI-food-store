import { Button } from "@/shared/ui/Button";

interface PaginacionProps {
  pagina: number; // página actual (empieza en 1)
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

// Botones Anterior / Siguiente. No se dibuja si hay una sola página.
export function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) return null;

  return (
    <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-4 text-sm">
      <Button variante="secondary" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span className="text-stone-600">
        Página {pagina} de {totalPaginas}
      </span>
      <Button
        variante="secondary"
        disabled={pagina >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </nav>
  );
}