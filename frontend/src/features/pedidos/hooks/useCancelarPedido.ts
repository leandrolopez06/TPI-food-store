import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelarPedido } from "@/features/pedidos/api/pedidos";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";

// El dueño cancela su pedido (solo si está PENDIENTE) y el backend restituye el stock
export function useCancelarPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: (pedido) => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      void queryClient.invalidateQueries({ queryKey: ["resumen"] });
      showNotification(`Pedido #${pedido.id} cancelado. El stock fue restituido.`);
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}