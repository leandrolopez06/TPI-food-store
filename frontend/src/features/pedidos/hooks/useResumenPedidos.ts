import { useQuery } from "@tanstack/react-query";
import { obtenerResumen } from "@/features/pedidos/api/pedidos";

export function useResumenPedidos() {
  return useQuery({ queryKey: ["resumen"], queryFn: obtenerResumen });
}