import { useNotificationStore } from "@/store/notificationStore";

const COLORES = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-stone-800 text-white",
} as const;

// Aviso emergente. Se monta una sola vez (en App.tsx) y muestra el mensaje del
// notificationStore; el store lo oculta solo a los pocos segundos.
export function Toast() {
  const message = useNotificationStore((estado) => estado.message);
  const type = useNotificationStore((estado) => estado.type);
  const visible = useNotificationStore((estado) => estado.visible);
  const hideNotification = useNotificationStore((estado) => estado.hideNotification);

  if (!visible) return null;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${COLORES[type]}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={hideNotification}
        aria-label="Cerrar aviso"
        className="-mt-0.5 text-lg leading-none opacity-80 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}