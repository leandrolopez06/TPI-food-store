import type { Categoria, CategoriaPayload } from "@/features/categorias/types/categoria";
import { axiosInstance } from "@/shared/api/axiosInstance";

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>("/categorias");
  return data;
}

export async function crearCategoria(payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>("/categorias", payload);
  return data;
}

export async function actualizarCategoria(id: number, payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, payload);
  return data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`);
}