export type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

// Mismos campos que DetallePedidoRead del backend: copia del nombre y del precio al comprar
export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

// Mismos campos que PedidoRead del backend
export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

// Respuesta de GET /pedidos (PedidosPaginados)
export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

// Respuesta de GET /pedidos/resumen (ResumenPedidos)
export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}

// Parámetros de consulta de GET /pedidos
export interface FiltrosPedidos {
  estado?: EstadoPedido;
  skip?: number;
  limit?: number;
}

// Cuerpo de POST /pedidos (PedidoCreate)
export interface PedidoPayload {
  items: { producto_id: number; cantidad: number }[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}