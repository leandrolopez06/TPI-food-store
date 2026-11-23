import { QueryClient } from "@tanstack/react-query";

// Instancia única de TanStack Query para toda la aplicación.
// retry: false -> si una petición falla (401, 403, 409...) el error se muestra enseguida.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 10_000 },
  },
});