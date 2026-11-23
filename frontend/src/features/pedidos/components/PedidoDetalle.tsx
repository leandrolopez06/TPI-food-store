import { TEXTO_FORMA_PAGO } from "@/features/pedidos/constants";
import type { Pedido } from "@/features/pedidos/types/pedido";
import { formatearFechaHora, formatearPrecio } from "@/shared/utils/formato";

interface PedidoDetalleProps {
  pedido: Pedido;
}

// Detalle de un pedido: líneas (con el nombre y el precio que tenían al comprar) y datos de entrega
export function PedidoDetalle({ pedido }: PedidoDetalleProps) {
  return (
    <div className="space-y-4 text-sm">
      <table className="w-full text-left">
        <thead className="text-xs tracking-wide text-stone-500 uppercase">
          <tr>
            <th scope="col" className="py-2 font-semibold">
              Producto
            </th>
            <th scope="col" className="py-2 text-right font-semibold">
              Cant.
            </th>
            <th scope="col" className="py-2 text-right font-semibold">
              Precio
            </th>
            <th scope="col" className="py-2 text-right font-semibold">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((linea) => (
            <tr key={linea.producto_id}>
              <td className="py-2 font-medium text-stone-800">{linea.nombre_producto}</td>
              <td className="py-2 text-right">{linea.cantidad}</td>
              <td className="py-2 text-right">{formatearPrecio(linea.precio_unitario)}</td>
              <td className="py-2 text-right">{formatearPrecio(linea.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-stone-200">
            <th scope="row" colSpan={3} className="py-2 text-right font-semibold">
              Total
            </th>
            <td className="py-2 text-right text-base font-bold text-stone-900">
              {formatearPrecio(pedido.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-stone-500 uppercase">Forma de pago</dt>
          <dd>{TEXTO_FORMA_PAGO[pedido.forma_pago]}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-stone-500 uppercase">Dirección de entrega</dt>
          <dd>{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-stone-500 uppercase">Creado</dt>
          <dd>{formatearFechaHora(pedido.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-stone-500 uppercase">Última actualización</dt>
          <dd>{formatearFechaHora(pedido.updated_at)}</dd>
        </div>
        {pedido.notas !== null && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold text-stone-500 uppercase">Notas</dt>
            <dd>{pedido.notas}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}