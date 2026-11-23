import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activarUsuario,
  desactivarUsuario,
  listarUsuarios,
} from "@/features/usuarios/api/usuarios";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";

export function useUsuarios() {
  return useQuery({ queryKey: ["usuarios"], queryFn: listarUsuarios });
}

export function useActivarUsuario() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: (id: number) => activarUsuario(id),
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      showNotification(`Se activó la cuenta de ${usuario.username}`);
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: (id: number) => desactivarUsuario(id),
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      showNotification(`Se desactivó la cuenta de ${usuario.username}`);
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}