import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoPayload,
  PedidosPaginados,
  ResumenPedidos,
} from "@/features/pedidos/types/pedido";
import { axiosInstance } from "@/shared/api/axiosInstance";

export async function crearPedido(payload: PedidoPayload): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>("/pedidos", payload);
  return data;
}

export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", { params: filtros });
  return data;
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}

export async function obtenerResumen(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}