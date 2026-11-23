import axios from "axios";
import { axiosInstance } from "@/shared/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

const DETALLE_CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

interface CuerpoDeError {
  detail?: unknown;
}

// Id del interceptor ya registrado: así, aunque se llame dos veces, queda uno solo
let idInterceptor: number | null = null;

// Interceptor de respuesta:
//  - 401 fuera de /auth/token y /auth/me (sesión vencida o inválida): limpia el authStore.
//  - 400 con detail "Cuenta de usuario desactivada" (un admin desactivó la cuenta): limpia el authStore.
// Al quedar sin usuario, ProtectedRoute lleva al login. Los 401 de /auth/token (credenciales
// incorrectas) y de /auth/me (todavía no hay sesión) son esperables y no limpian nada.
// La solicitud no lleva token: el JWT viaja en la cookie HttpOnly que adjunta el navegador.
export function setupInterceptors(): void {
  if (idInterceptor !== null) {
    axiosInstance.interceptors.response.eject(idInterceptor);
  }

  idInterceptor = axiosInstance.interceptors.response.use(
    (respuesta) => respuesta,
    (error: unknown) => {
      if (axios.isAxiosError<CuerpoDeError>(error)) {
        const estado = error.response?.status;
        const url = error.config?.url ?? "";
        const { usuario, limpiarSesion } = useAuthStore.getState();
        const esLogin = url.includes("/auth/token");
        const esMe = url.includes("/auth/me");

        const sesionVencida = estado === 401 && !esLogin && !esMe;
        const cuentaDesactivada =
          estado === 400 && !esLogin && error.response?.data?.detail === DETALLE_CUENTA_DESACTIVADA;

        if (sesionVencida || cuentaDesactivada) {
          limpiarSesion();
          if (usuario !== null && !url.includes("/auth/logout")) {
            useNotificationStore
              .getState()
              .showNotification(
                cuentaDesactivada
                  ? "Tu cuenta fue desactivada."
                  : "Tu sesión venció. Iniciá sesión de nuevo.",
                "error",
              );
          }
        }
      }
      return Promise.reject(error);
    },
  );
}