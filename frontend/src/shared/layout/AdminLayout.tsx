import { NavLink, Outlet } from "react-router-dom";

const SECCIONES = [
  { ruta: "/admin/resumen", texto: "Resumen" },
  { ruta: "/admin/pedidos", texto: "Pedidos" },
  { ruta: "/admin/productos", texto: "Productos" },
  { ruta: "/admin/categorias", texto: "Categorías" },
  { ruta: "/admin/usuarios", texto: "Usuarios" },
] as const;

// Panel de administración: pestañas de las secciones y el contenido de la sección activa
export function AdminLayout() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Panel de administración</h1>
      <nav aria-label="Secciones del panel" className="mb-6 flex flex-wrap gap-1 border-b border-stone-200">
        {SECCIONES.map((seccion) => (
          <NavLink
            key={seccion.ruta}
            to={seccion.ruta}
            className={({ isActive }) =>
              `-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-orange-600 text-orange-700"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`
            }
          >
            {seccion.texto}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}