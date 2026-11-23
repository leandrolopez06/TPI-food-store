import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CategoriaFormModal } from "@/features/categorias/components/CategoriaFormModal";
import { useCategorias, useEliminarCategoria } from "@/features/categorias/hooks/useCategorias";
import type { Categoria } from "@/features/categorias/types/categoria";
import { Confirmar } from "@/shared/components/Confirmar";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/SkeletonTabla";
import { TablaDatos } from "@/shared/components/TablaDatos";
import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";

const columnHelper = createColumnHelper<Categoria>();
const SIN_FILAS: Categoria[] = []; // referencia estable para cuando todavía no hay datos

// Una sola ventana abierta a la vez: crear, editar o confirmar la baja
type Ventana =
  | { tipo: "formulario"; categoria: Categoria | null }
  | { tipo: "eliminar"; categoria: Categoria }
  | null;

export function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias();
  const eliminar = useEliminarCategoria();
  const [ventana, setVentana] = useState<Ventana>(null);

  const columnas = useMemo(
    () => [
      columnHelper.accessor("nombre", {
        header: "Nombre",
        cell: (info) => <span className="font-semibold text-stone-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor("descripcion", {
        header: "Descripción",
        enableSorting: false,
        cell: (info) => info.getValue() ?? <span className="text-stone-400">Sin descripción</span>,
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variante="secondary"
              tamano="sm"
              onClick={() => setVentana({ tipo: "formulario", categoria: row.original })}
            >
              Editar
            </Button>
            <Button
              variante="danger"
              tamano="sm"
              onClick={() => setVentana({ tipo: "eliminar", categoria: row.original })}
            >
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data ?? SIN_FILAS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Categorías</h2>
        <Button onClick={() => setVentana({ tipo: "formulario", categoria: null })}>
          + Nueva categoría
        </Button>
      </div>

      {isPending && <SkeletonTabla />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data !== undefined && data.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hay categorías"
          descripcion="Creá la primera para poder cargar productos."
        />
      )}
      {data !== undefined && data.length > 0 && <TablaDatos table={table} />}

      {ventana?.tipo === "formulario" && (
        <CategoriaFormModal
          key={ventana.categoria?.id ?? "nueva"}
          categoria={ventana.categoria}
          onCerrar={() => setVentana(null)}
        />
      )}
      {ventana?.tipo === "eliminar" && (
        <Confirmar
          titulo="Eliminar categoría"
          mensaje={`¿Eliminar la categoría «${ventana.categoria.nombre}»? Se da de baja y deja de aparecer en el catálogo.`}
          textoConfirmar="Eliminar"
          cargando={eliminar.isPending}
          onCancelar={() => setVentana(null)}
          onConfirmar={() => eliminar.mutate(ventana.categoria.id, { onSuccess: () => setVentana(null) })}
        />
      )}
    </section>
  );
}