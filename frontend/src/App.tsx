import { useEffect } from "react";
import { AppRouter } from "@/routes/AppRouter";
import { Toast } from "@/shared/components/Toast";
import { useAuthStore } from "@/store/authStore";

function App() {
  const checkSession = useAuthStore((estado) => estado.checkSession);

  // Es el único useEffect de la aplicación: al abrirla confirma con GET /auth/me
  // si la cookie de sesión todavía es válida.
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;