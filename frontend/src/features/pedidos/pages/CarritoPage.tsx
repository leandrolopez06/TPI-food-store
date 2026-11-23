import { Link, useNavigate } from "react-router-dom";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formato";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const IMAGEN_POR_DEFECTO = "/placeholder.svg";

export function CarritoPage() {
  const navigate = useNavigate();
  const items = useCartStore((estado) => estado.items);
  const total = useCartStore((estado) => estado.total());
  const cambiarCantidad = useCartStore((estado) => estado.cambiarCantidad);
  const quitar = useCartStore((estado) => estado.quitar);
  const vaciar = useCartStore((estado) => estado.vaciar);
  const hayUsuario = useAuthStore((estado) => estado.usuario !== null);

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-6 text-3xl font-bold">Tu carrito</h1>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo para armar tu pedido."
          accion={<Button onClick={() => navigate("/")}>Ver el menú</Button>}
        />
      </section>
    );
  }

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold">Tu carrito</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.producto_id}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <img
                  src={item.imagen_url ?? IMAGEN_POR_DEFECTO}
                  alt=""
                  onError={(evento) => {
                    if (!evento.currentTarget.src.endsWith(IMAGEN_POR_DEFECTO)) {
                      evento.currentTarget.src = IMAGEN_POR_DEFECTO;
                    }
                  }}
                  className="size-16 rounded-lg object-cover"
                />
                <div className="min-w-40 flex-1">
                  <p className="font-semibold text-stone-900">{item.nombre}</p>
                  <p className="text-sm text-stone-500">{formatearPrecio(item.precio_unitario)} c/u</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variante="secondary"
                    tamano="sm"
                    aria-label={`Quitar una unidad de ${item.nombre}`}
                    disabled={item.cantidad <= 1}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                  >
                    −
                  </Button>
                  <span aria-label={`Cantidad de ${item.nombre}`} className="w-8 text-center font-semibold">
                    {item.cantidad}
                  </span>
                  <Button
                    variante="secondary"
                    tamano="sm"
                    aria-label={`Agregar una unidad de ${item.nombre}`}
                    disabled={item.cantidad >= item.stock}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                  >
                    +
                  </Button>
                </div>

                <p className="w-28 text-right font-bold text-stone-900">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </p>
                <Button variante="ghost" tamano="sm" onClick={() => quitar(item.producto_id)}>
                  Quitar
                </Button>
              </Card>
            </li>
          ))}
        </ul>

        <aside>
          <Card className="sticky top-24 p-5">
            <h2 className="mb-3 text-lg font-bold">Resumen</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Productos</dt>
                <dd>{items.reduce((suma, item) => suma + item.cantidad, 0)}</dd>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold text-stone-900">{formatearPrecio(total)}</dd>
              </div>
            </dl>

            <Button className="mt-5 w-full" onClick={() => navigate("/checkout")}>
              Confirmar pedido
            </Button>
            {!hayUsuario && (
              <p className="mt-3 text-center text-xs text-stone-500">
                Para confirmar el pedido te vamos a pedir que inicies sesión.
              </p>
            )}
            <div className="mt-3 flex items-center justify-between text-sm">
              <Link to="/" className="font-medium text-orange-700 hover:underline">
                Seguir comprando
              </Link>
              <button type="button" onClick={vaciar} className="text-stone-500 hover:text-red-600">
                Vaciar carrito
              </button>
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
}