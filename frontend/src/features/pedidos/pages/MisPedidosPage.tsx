import { useState } from "react";
import { Link } from "react-router-dom";
import { PedidoDetalle } from "@/features/pedidos/components/PedidoDetalle";
import { useCancelarPedido } from "@/features/pedidos/hooks/useCancelarPedido";
import { usePedidos } from "@/features/pedidos/hooks/usePedidos";
import type { Pedido } from "@/features/pedidos/types/pedido";
import { handleApiError } from "@/shared/api/handleApiError";
import { Confirmar } from "@/shared/components/Confirmar";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { Skeleton } from "@/shared/components/Skeleton";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { formatearFechaHora, formatearPrecio } from "@/shared/utils/formato";
import { useAuthStore } from "@/store/authStore";

const PEDIDOS_POR_PAGINA = 10;

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(1);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);
  const cancelar = useCancelarPedido();
  // Un admin recibe en esta lista los pedidos de todos; cancelar desde acá es solo para el dueño
  const usuarioId = useAuthStore((estado) => estado.usuario?.id);

  const { data, isPending, isError, error, refetch, isPlaceholderData } = usePedidos({
    skip: (pagina - 1) * PEDIDOS_POR_PAGINA,
    limit: PEDIDOS_POR_PAGINA,
  });
  const totalPaginas = data === undefined ? 1 : Math.max(Math.ceil(data.total / PEDIDOS_POR_PAGINA), 1);

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Mis pedidos</h1>

      {isPending && (
        <div role="status" aria-label="Cargando pedidos" className="space-y-3">
          {Array.from({ length: 3 }, (_, indice) => (
            <Card key={indice} className="space-y-3 p-5">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      )}

      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}

      {data !== undefined && data.items.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hiciste ningún pedido"
          descripcion="Cuando confirmes uno, lo vas a ver acá."
          accion={
            <Link to="/" className="font-semibold text-orange-700 hover:underline">
              Ver el menú
            </Link>
          }
        />
      )}

      {data !== undefined && data.items.length > 0 && (
        <ul className={`space-y-4 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
          {data.items.map((pedido) => (
            <li key={pedido.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">Pedido #{pedido.id}</p>
                    <p className="text-sm text-stone-500">{formatearFechaHora(pedido.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <BadgeEstado estado={pedido.estado} />
                    <p className="text-lg font-bold">{formatearPrecio(pedido.total)}</p>
                  </div>
                </div>

                <details className="group mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-orange-700 select-none hover:underline">
                    Ver detalle ({pedido.items.length} {pedido.items.length === 1 ? "producto" : "productos"})
                  </summary>
                  <div className="mt-3 border-t border-stone-100 pt-3">
                    <PedidoDetalle pedido={pedido} />
                  </div>
                </details>

                {pedido.estado === "PENDIENTE" && pedido.usuario_id === usuarioId && (
                  <div className="mt-4 flex justify-end">
                    <Button variante="danger" tamano="sm" onClick={() => setACancelar(pedido)}>
                      Cancelar pedido
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {data !== undefined && data.total > 0 && (
        <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
      )}

      {aCancelar !== null && (
        <Confirmar
          titulo="Cancelar pedido"
          mensaje={`¿Cancelar el pedido #${aCancelar.id}? Los productos vuelven al stock y no se puede deshacer.`}
          textoConfirmar="Cancelar pedido"
          cargando={cancelar.isPending}
          onCancelar={() => setACancelar(null)}
          onConfirmar={() => cancelar.mutate(aCancelar.id, { onSuccess: () => setACancelar(null) })}
        />
      )}
    </section>
  );
}