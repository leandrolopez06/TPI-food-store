import { create } from "zustand";

export type TipoNotificacion = "success" | "error" | "info";

interface NotificationState {
  message: string; // texto que muestra el Toast
  type: TipoNotificacion;
  visible: boolean; // true = el Toast está en pantalla
  showNotification: (message: string, type?: TipoNotificacion) => void;
  hideNotification: () => void;
}

const DURACION_MS = 3500;

// Temporizador del aviso actual: un aviso nuevo reinicia la cuenta
let temporizador: ReturnType<typeof setTimeout> | null = null;

// Estado global de los avisos emergentes. Lo usan los hooks (altas, bajas, errores) y el
// interceptor de Axios; lo dibuja el componente Toast.
export const useNotificationStore = create<NotificationState>()((set) => ({
  message: "",
  type: "success",
  visible: false,
  showNotification: (message, type = "success") => {
    if (temporizador !== null) clearTimeout(temporizador);
    set({ message, type, visible: true });
    temporizador = setTimeout(() => set({ visible: false }), DURACION_MS);
  },
  hideNotification: () => {
    if (temporizador !== null) clearTimeout(temporizador);
    set({ visible: false });
  },
}));