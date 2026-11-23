import { Link } from "react-router-dom";
import { CheckoutForm } from "@/features/pedidos/components/CheckoutForm";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Card } from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore } from "@/store/cartStore";

export function CheckoutPage() {
  const items = useCartStore((estado) => estado.items);
  const total = useCartStore((estado) => estado.total());

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-6 text-3xl font-bold">Confirmar pedido</h1>
        <EstadoVacio
          titulo="No hay nada para confirmar"
          descripcion="Tu carrito está vacío."
          accion={
            <Link to="/" className="font-semibold text-orange-700 hover:underline">
              Ir al menú
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Confirmar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold">Datos de entrega</h2>
          <CheckoutForm />
        </Card>

        <aside>
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-bold">Tu pedido</h2>
            <ul className="divide-y divide-stone-100 text-sm">
              {items.map((item) => (
                <li key={item.producto_id} className="flex justify-between gap-3 py-2">
                  <span>
                    {item.cantidad} × {item.nombre}
                  </span>
                  <span className="font-medium">
                    {formatearPrecio(item.precio_unitario * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{formatearPrecio(total)}</span>
            </p>
            <Link to="/carrito" className="mt-3 inline-block text-sm font-medium text-orange-700 hover:underline">
              Volver al carrito
            </Link>
          </Card>
        </aside>
      </div>
    </section>
  );
}