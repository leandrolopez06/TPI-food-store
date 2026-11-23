import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Button } from "@/shared/ui/Button";

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-orange-100 text-orange-800" : "text-stone-600 hover:bg-stone-100"
  }`;

// Barra superior: navegación, carrito, datos de la sesión y acceso al panel (solo admin)
export function Navbar() {
  const navigate = useNavigate();
  const usuario = useAuthStore((estado) => estado.usuario);
  const logout = useAuthStore((estado) => estado.logout);
  const unidades = useCartStore((estado) =>
    estado.items.reduce((suma, item) => suma + item.cantidad, 0),
  );
  const showNotification = useNotificationStore((estado) => estado.showNotification);

  const cerrarSesion = async () => {
    await logout();
    showNotification("Sesión cerrada", "info");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-orange-700">
          <img src="/favicon.svg" alt="" className="size-7" />
          Food Store
        </Link>

        <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseEnlace}>
            Catálogo
          </NavLink>
          {usuario !== null && (
            <NavLink to="/mis-pedidos" className={claseEnlace}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === "admin" && (
            <NavLink to="/admin" className={claseEnlace}>
              Panel de administración
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <NavLink
            to="/carrito"
            className="relative rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Carrito
            {unidades > 0 && (
              <span
                aria-label={`${unidades} unidades en el carrito`}
                className="ml-2 inline-block min-w-5 rounded-full bg-orange-600 px-1.5 text-center text-xs font-bold text-white"
              >
                {unidades}
              </span>
            )}
          </NavLink>

          {usuario === null ? (
            <>
              <Button variante="ghost" onClick={() => navigate("/login")}>
                Ingresar
              </Button>
              <Button onClick={() => navigate("/register")}>Crear cuenta</Button>
            </>
          ) : (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-stone-800">{usuario.full_name}</p>
                <p className="text-xs text-stone-500">
                  {usuario.role === "admin" ? "Administrador" : "Cliente"}
                </p>
              </div>
              <Button variante="secondary" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}