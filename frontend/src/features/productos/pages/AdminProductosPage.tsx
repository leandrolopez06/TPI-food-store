import { useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ProductoFormModal } from "@/features/productos/components/ProductoFormModal";
import { StockModal } from "@/features/productos/components/StockModal";
import {
  useActualizarStock,
  useEliminarProducto,
  useProductos,
} from "@/features/productos/hooks/useProductos";
import type { Producto } from "@/features/productos/types/producto";
import { handleApiError } from "@/shared/api/handleApiError";
import { Confirmar } from "@/shared/components/Confirmar";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/SkeletonTabla";
import { TablaDatos } from "@/shared/components/TablaDatos";
import { Button } from "@/shared/ui/Button";
import { formatearPrecio } from "@/shared/utils/formato";

const columnHelper = createColumnHelper<Producto>();
const SIN_FILAS: Producto[] = []; // referencia estable para cuando todavía no hay datos
const LIMITE_PANEL = 100; // máximo que permite la API: la paginación se hace del lado del cliente

type Ventana =
  | { tipo: "formulario"; producto: Producto | null }
  | { tipo: "stock"; producto: Producto }
  | { tipo: "eliminar"; producto: Producto }
  | null;

export function AdminProductosPage() {
  const { data, isPending, isError, error, refetch } = useProductos({ limit: LIMITE_PANEL });
  const eliminar = useEliminarProducto();
  const { mutate: cambiarDisponibilidad } = useActualizarStock();
  const [ventana, setVentana] = useState<Ventana>(null);
  const [filtro, setFiltro] = useState("");

  const columnas = useMemo(
    () => [
      columnHelper.accessor("nombre", {
        header: "Producto",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-stone-900">{row.original.nombre}</p>
            <p className="text-xs text-stone-500">{row.original.categoria?.nombre ?? "Sin categoría"}</p>
          </div>
        ),
      }),
      columnHelper.accessor("precio_base", {
        header: "Precio",
        cell: (info) => formatearPrecio(info.getValue()),
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: (info) => (
          <span className={info.getValue() === 0 ? "font-semibold text-red-600" : ""}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("disponible", {
        header: "Disponible",
        cell: ({ row }) => (
          <button
            type="button"
            role="switch"
            aria-checked={row.original.disponible}
            aria-label={`Disponibilidad de ${row.original.nombre}`}
            onClick={() =>
              cambiarDisponibilidad({
                id: row.original.id,
                payload: { disponible: !row.original.disponible },
              })
            }
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              row.original.disponible
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-stone-200 text-stone-600 hover:bg-stone-300"
            }`}
          >
            {row.original.disponible ? "Disponible" : "No disponible"}
          </button>
        ),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variante="secondary"
              tamano="sm"
              onClick={() => setVentana({ tipo: "stock", producto: row.original })}
            >
              Stock
            </Button>
            <Button
              variante="secondary"
              tamano="sm"
              onClick={() => setVentana({ tipo: "formulario", producto: row.original })}
            >
              Editar
            </Button>
            <Button
              variante="danger"
              tamano="sm"
              onClick={() => setVentana({ tipo: "eliminar", producto: row.original })}
            >
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [cambiarDisponibilidad],
  );

  const table = useReactTable({
    data: data?.items ?? SIN_FILAS,
    columns: columnas,
    state: { globalFilter: filtro },
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Productos</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={filtro}
            onChange={(evento) => setFiltro(evento.target.value)}
            placeholder="Filtrar por nombre..."
            aria-label="Filtrar productos"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
          <Button onClick={() => setVentana({ tipo: "formulario", producto: null })}>
            + Nuevo producto
          </Button>
        </div>
      </div>

      {isPending && <SkeletonTabla />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data !== undefined && data.items.length === 0 && (
        <EstadoVacio titulo="Todavía no hay productos" descripcion="Creá el primero con el botón de arriba." />
      )}
      {data !== undefined && data.items.length > 0 && <TablaDatos table={table} />}

      {ventana?.tipo === "formulario" && (
        <ProductoFormModal
          key={ventana.producto?.id ?? "nuevo"}
          producto={ventana.producto}
          onCerrar={() => setVentana(null)}
        />
      )}
      {ventana?.tipo === "stock" && (
        <StockModal key={ventana.producto.id} producto={ventana.producto} onCerrar={() => setVentana(null)} />
      )}
      {ventana?.tipo === "eliminar" && (
        <Confirmar
          titulo="Eliminar producto"
          mensaje={`¿Eliminar «${ventana.producto.nombre}»? Se da de baja y deja de aparecer en el catálogo. Los pedidos anteriores no cambian.`}
          textoConfirmar="Eliminar"
          cargando={eliminar.isPending}
          onCancelar={() => setVentana(null)}
          onConfirmar={() => eliminar.mutate(ventana.producto.id, { onSuccess: () => setVentana(null) })}
        />
      )}
    </section>
  );
}