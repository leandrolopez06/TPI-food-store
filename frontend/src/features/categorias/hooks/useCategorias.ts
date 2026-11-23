import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from "@/features/categorias/api/categorias";
import type { CategoriaPayload } from "@/features/categorias/types/categoria";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";

export function useCategorias() {
  return useQuery({ queryKey: ["categorias"], queryFn: listarCategorias });
}

// Las tres mutaciones invalidan "categorias" y también "productos" (cada producto trae su categoría)
function useInvalidarCategorias() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["categorias"] });
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCategorias();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: (payload: CategoriaPayload) => crearCategoria(payload),
    onSuccess: () => {
      invalidar();
      showNotification("Categoría creada");
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCategorias();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaPayload }) =>
      actualizarCategoria(id, payload),
    onSuccess: () => {
      invalidar();
      showNotification("Categoría actualizada");
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCategorias();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => {
      invalidar();
      showNotification("Categoría eliminada");
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}