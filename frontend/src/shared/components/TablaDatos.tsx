import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";

interface TablaDatosProps<TData> {
  table: Table<TData>; // la crea cada página con useReactTable
  paginar?: boolean; // true: muestra la paginación del lado del cliente
}

// Dibuja cualquier tabla de TanStack Table: encabezados con orden y paginación opcional
export function TablaDatos<TData>({ table, paginar = true }: TablaDatosProps<TData>) {
  const totalFilas = table.getPrePaginationRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-xs tracking-wide text-stone-500 uppercase">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((encabezado) => {
                  const orden = encabezado.column.getIsSorted();
                  return (
                    <th
                      key={encabezado.id}
                      scope="col"
                      aria-sort={
                        orden === "asc" ? "ascending" : orden === "desc" ? "descending" : "none"
                      }
                      className="px-4 py-3 font-semibold"
                    >
                      {encabezado.isPlaceholder ? null : encabezado.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={encabezado.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-stone-900"
                        >
                          {flexRender(encabezado.column.columnDef.header, encabezado.getContext())}
                          <span aria-hidden="true">
                            {orden === "asc" ? "▲" : orden === "desc" ? "▼" : "↕"}
                          </span>
                        </button>
                      ) : (
                        flexRender(encabezado.column.columnDef.header, encabezado.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-stone-100">
            {table.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="hover:bg-stone-50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3 align-middle text-stone-700">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginar && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-4 py-3 text-sm text-stone-600">
          <span>
            {totalFilas} {totalFilas === 1 ? "registro" : "registros"}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-stone-300 px-3 py-1.5 font-medium hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span>
              Página {pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-stone-300 px-3 py-1.5 font-medium hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}