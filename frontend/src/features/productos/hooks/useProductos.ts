import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from "@/features/productos/api/productos";
import type {
  FiltrosProductos,
  ProductoPayload,
  StockPayload,
} from "@/features/productos/types/producto";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";

// La queryKey incluye los filtros: cada combinación (búsqueda, categoría, página) tiene su caché.
// placeholderData mantiene la página anterior en pantalla mientras llega la nueva.
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData,
  });
}

function useInvalidarProductos() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: (payload: ProductoPayload) => crearProducto(payload),
    onSuccess: () => {
      invalidar();
      showNotification("Producto creado");
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoPayload }) =>
      actualizarProducto(id, payload),
    onSuccess: () => {
      invalidar();
      showNotification("Producto actualizado");
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StockPayload }) =>
      actualizarStock(id, payload),
    onSuccess: () => {
      invalidar();
      showNotification("Stock actualizado");
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: () => {
      invalidar();
      showNotification("Producto eliminado");
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}