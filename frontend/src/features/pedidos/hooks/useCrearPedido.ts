import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearPedido } from "@/features/pedidos/api/pedidos";
import type { PedidoPayload } from "@/features/pedidos/types/pedido";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";

// Crea el pedido. El stock cambió, así que se invalidan también los productos y el resumen.
export function useCrearPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: (payload: PedidoPayload) => crearPedido(payload),
    onSuccess: (pedido) => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      void queryClient.invalidateQueries({ queryKey: ["resumen"] });
      showNotification(`¡Pedido #${pedido.id} confirmado!`);
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}