import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ACCION_HACIA, TEXTO_FORMA_PAGO, TRANSICIONES } from "@/features/pedidos/constants";
import type { EstadoPedido, Pedido } from "@/features/pedidos/types/pedido";
import { TablaDatos } from "@/shared/components/TablaDatos";
import { Button } from "@/shared/ui/Button";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { formatearFechaHora, formatearPrecio } from "@/shared/utils/formato";

const columnHelper = createColumnHelper<Pedido>();

interface TablaPedidosProps {
  pedidos: Pedido[];
  nombreDeUsuario: (usuarioId: number) => string;
  ocupado: boolean; // true mientras se procesa un cambio de estado
  onVerDetalle: (pedido: Pedido) => void;
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void;
}

// Tabla de pedidos del panel de administración. Cada fila ofrece solo los botones que
// permite la máquina de estados (TRANSICIONES).
export function TablaPedidos({
  pedidos,
  nombreDeUsuario,
  ocupado,
  onVerDetalle,
  onCambiarEstado,
}: TablaPedidosProps) {
  const columnas = [
    columnHelper.accessor("id", {
      header: "Pedido",
      enableSorting: false,
      cell: (info) => <span className="font-semibold text-stone-900">#{info.getValue()}</span>,
    }),
    columnHelper.accessor("usuario_id", {
      header: "Cliente",
      enableSorting: false,
      cell: (info) => nombreDeUsuario(info.getValue()),
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha",
      enableSorting: false,
      cell: (info) => formatearFechaHora(info.getValue()),
    }),
    columnHelper.accessor("total", {
      header: "Total",
      enableSorting: false,
      cell: (info) => <span className="font-semibold">{formatearPrecio(info.getValue())}</span>,
    }),
    columnHelper.accessor("forma_pago", {
      header: "Pago",
      enableSorting: false,
      cell: (info) => TEXTO_FORMA_PAGO[info.getValue()],
    }),
    columnHelper.accessor("estado", {
      header: "Estado",
      enableSorting: false,
      cell: (info) => <BadgeEstado estado={info.getValue()} />,
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const pedido = row.original;
        return (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variante="ghost" tamano="sm" onClick={() => onVerDetalle(pedido)}>
              Ver detalle
            </Button>
            {TRANSICIONES[pedido.estado].map((destino) => (
              <Button
                key={destino}
                tamano="sm"
                variante={destino === "CANCELADO" ? "danger" : "primary"}
                disabled={ocupado}
                onClick={() => onCambiarEstado(pedido, destino)}
              >
                {ACCION_HACIA[destino]}
              </Button>
            ))}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: pedidos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  });

  return <TablaDatos table={table} paginar={false} />;
}