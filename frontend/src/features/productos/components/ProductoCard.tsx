import type { Producto } from "@/features/productos/types/producto";
import { formatearPrecio } from "@/shared/utils/formato";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";

const IMAGEN_POR_DEFECTO = "/placeholder.svg";

interface ProductoCardProps {
  producto: Producto;
}

// Tarjeta de un producto del catálogo, con el botón «Agregar al carrito»
export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((estado) => estado.agregar);
  const enCarrito = useCartStore(
    (estado) => estado.items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0,
  );
  const showNotification = useNotificationStore((estado) => estado.showNotification);

  const sinStock = producto.stock < 1;
  const noDisponible = !producto.disponible || sinStock;

  const agregarAlCarrito = () => {
    const agregado = agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
    });
    if (agregado) {
      showNotification(`«${producto.nombre}» se agregó al carrito`);
    } else {
      showNotification(`No hay más unidades de «${producto.nombre}» en stock`, "error");
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <img
        src={producto.imagen_url ?? IMAGEN_POR_DEFECTO}
        alt={producto.nombre}
        loading="lazy"
        onError={(evento) => {
          // Si la URL de la imagen está rota se muestra la imagen por defecto (una sola vez)
          if (!evento.currentTarget.src.endsWith(IMAGEN_POR_DEFECTO)) {
            evento.currentTarget.src = IMAGEN_POR_DEFECTO;
          }
        }}
        className="h-40 w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        {producto.categoria !== null && (
          <span className="text-xs font-semibold tracking-wide text-orange-700 uppercase">
            {producto.categoria.nombre}
          </span>
        )}
        <h3 className="text-base font-bold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion !== null && (
          <p className="line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <p className="text-lg font-bold text-stone-900">{formatearPrecio(producto.precio_base)}</p>
          {noDisponible ? (
            <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
              {sinStock ? "Sin stock" : "No disponible"}
            </span>
          ) : (
            <span className="text-xs text-stone-500">
              {producto.stock <= 5 ? `¡Quedan ${producto.stock}!` : `${producto.stock} en stock`}
            </span>
          )}
        </div>

        <Button onClick={agregarAlCarrito} disabled={noDisponible} className="mt-2 w-full">
          {enCarrito > 0 ? `Agregar otro (${enCarrito} en el carrito)` : "Agregar al carrito"}
        </Button>
      </div>
    </Card>
  );
}