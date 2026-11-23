import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "@/App";
import { queryClient } from "@/shared/api/queryClient";
import { setupInterceptors } from "@/shared/api/setupInterceptors";

// Se registra una sola vez el interceptor de Axios (sesión vencida o cuenta desactivada)
setupInterceptors();

const raiz = document.getElementById("root");
if (raiz === null) throw new Error("No se encontró el elemento #root en index.html");

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);