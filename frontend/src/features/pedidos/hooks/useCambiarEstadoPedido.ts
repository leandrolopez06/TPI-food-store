import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cambiarEstadoPedido } from "@/features/pedidos/api/pedidos";
import type { EstadoPedido } from "@/features/pedidos/types/pedido";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";

// El admin cambia el estado de un pedido. Si pasa a CANCELADO el backend restituye el stock,
// por eso se invalidan también los productos.
export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: (pedido) => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      void queryClient.invalidateQueries({ queryKey: ["resumen"] });
      showNotification(
        pedido.estado === "CANCELADO"
          ? `Pedido #${pedido.id} cancelado. El stock fue restituido.`
          : `Pedido #${pedido.id} actualizado`,
      );
    },
    onError: (error) => showNotification(handleApiError(error), "error"),
  });
}