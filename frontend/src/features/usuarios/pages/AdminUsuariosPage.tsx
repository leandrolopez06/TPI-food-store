import { useMemo } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Usuario } from "@/features/auth/types/auth";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "@/features/usuarios/hooks/useUsuarios";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonTabla } from "@/shared/components/SkeletonTabla";
import { TablaDatos } from "@/shared/components/TablaDatos";
import { Button } from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";

const columnHelper = createColumnHelper<Usuario>();
const SIN_FILAS: Usuario[] = []; // referencia estable para cuando todavía no hay datos

export function AdminUsuariosPage() {
  const { data, isPending, isError, error, refetch } = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const idDeLaSesion = useAuthStore((estado) => estado.usuario?.id);

  const columnas = useMemo(
    () => [
      columnHelper.accessor("username", {
        header: "Usuario",
        cell: (info) => <span className="font-semibold text-stone-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor("full_name", { header: "Nombre" }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("role", {
        header: "Rol",
        cell: (info) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              info.getValue() === "admin" ? "bg-orange-100 text-orange-800" : "bg-stone-100 text-stone-700"
            }`}
          >
            {info.getValue() === "admin" ? "Administrador" : "Cliente"}
          </span>
        ),
      }),
      columnHelper.accessor("disabled", {
        header: "Estado",
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              Desactivado
            </span>
          ) : (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
              Activo
            </span>
          ),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const usuario = row.original;
          return (
            <div className="flex justify-end">
              {usuario.disabled ? (
                <Button
                  variante="secondary"
                  tamano="sm"
                  onClick={() => activar.mutate(usuario.id)}
                  disabled={activar.isPending}
                >
                  Activar
                </Button>
              ) : (
                // El admin no puede desactivar su propia cuenta: en su fila no hay botón
                usuario.id !== idDeLaSesion && (
                  <Button
                    variante="danger"
                    tamano="sm"
                    onClick={() => desactivar.mutate(usuario.id)}
                    disabled={desactivar.isPending}
                  >
                    Desactivar
                  </Button>
                )
              )}
            </div>
          );
        },
      }),
    ],
    [activar, desactivar, idDeLaSesion],
  );

  const table = useReactTable({
    data: data ?? SIN_FILAS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Usuarios</h2>

      {isPending && <SkeletonTabla />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data !== undefined && data.length === 0 && <EstadoVacio titulo="No hay usuarios registrados" />}
      {data !== undefined && data.length > 0 && <TablaDatos table={table} />}
    </section>
  );
}