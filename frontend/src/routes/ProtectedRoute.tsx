import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/auth/types/auth";
import { Cargando } from "@/shared/components/Cargando";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  roles?: Rol[]; // si se indica, el usuario debe tener uno de estos roles
}

// Ruta protegida: sin sesión va a /login; con sesión pero sin el rol, a /unauthorized.
// Mientras checkSession confirma la sesión se muestra un indicador de carga.
// La protección real está en el backend (require_role); esto solo evita mostrar pantallas de más.
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((estado) => estado.usuario);
  const cargando = useAuthStore((estado) => estado.cargando);
  const ubicacion = useLocation();

  if (cargando) return <Cargando />;
  if (usuario === null) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  if (roles !== undefined && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}