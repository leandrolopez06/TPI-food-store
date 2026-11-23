import type { EstadoPedido } from "@/features/pedidos/types/pedido";

// Máquina de estados: a qué estados puede pasar un pedido desde el actual.
// Es la misma tabla que valida el backend; acá solo sirve para mostrar los botones correctos.
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

// Texto del botón que lleva el pedido a cada estado
export const ACCION_HACIA: Record<EstadoPedido, string> = {
  PENDIENTE: "Volver a pendiente",
  EN_PREPARACION: "Pasar a preparación",
  ENTREGADO: "Marcar entregado",
  CANCELADO: "Cancelar pedido",
};

export const TEXTO_FORMA_PAGO = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
} as const;