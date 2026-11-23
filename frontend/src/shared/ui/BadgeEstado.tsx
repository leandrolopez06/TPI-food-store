import type { EstadoPedido } from "@/features/pedidos/types/pedido";

const ESTILOS: Record<EstadoPedido, { texto: string; clases: string }> = {
  PENDIENTE: { texto: "Pendiente", clases: "bg-amber-100 text-amber-800 ring-amber-200" },
  EN_PREPARACION: { texto: "En preparación", clases: "bg-blue-100 text-blue-800 ring-blue-200" },
  ENTREGADO: { texto: "Entregado", clases: "bg-green-100 text-green-800 ring-green-200" },
  CANCELADO: { texto: "Cancelado", clases: "bg-red-100 text-red-800 ring-red-200" },
};

interface BadgeEstadoProps {
  estado: EstadoPedido;
}

// Etiqueta de color para los cuatro estados del pedido
export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const { texto, clases } = ESTILOS[estado];
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${clases}`}
    >
      {texto}
    </span>
  );
}