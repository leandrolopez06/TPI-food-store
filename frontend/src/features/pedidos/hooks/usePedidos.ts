import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarPedidos } from "@/features/pedidos/api/pedidos";
import type { FiltrosPedidos } from "@/features/pedidos/types/pedido";

// Un cliente recibe solo sus pedidos; un admin, todos (lo decide el backend).
// La queryKey incluye los filtros: cada combinación de estado y página tiene su caché.
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}