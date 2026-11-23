import type {
  FiltrosProductos,
  Producto,
  ProductoPayload,
  ProductosPaginados,
  StockPayload,
} from "@/features/productos/types/producto";
import { axiosInstance } from "@/shared/api/axiosInstance";

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await axiosInstance.get<ProductosPaginados>("/productos", { params: filtros });
  return data;
}

export async function crearProducto(payload: ProductoPayload): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>("/productos", payload);
  return data;
}

export async function actualizarProducto(id: number, payload: ProductoPayload): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, payload);
  return data;
}

export async function actualizarStock(id: number, payload: StockPayload): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, payload);
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`);
}