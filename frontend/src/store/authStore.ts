import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest, logoutRequest, meRequest } from "@/features/auth/api/auth";
import type { Usuario } from "@/features/auth/types/auth";
import { queryClient } from "@/shared/api/queryClient";

// Datos que dependen de quién inició sesión (pedidos, resumen, usuarios): se descartan al abrir o
// cerrar la sesión para que otra persona en el mismo navegador no los vea. El catálogo y las
// categorías son públicos y no se tocan (así tampoco se cancelan consultas en curso al arrancar).
function descartarDatosDeUsuario(): void {
  for (const clave of ["pedidos", "resumen", "usuarios"]) {
    queryClient.removeQueries({ queryKey: [clave] });
  }
}

interface AuthState {
  usuario: Usuario | null; // datos del usuario (nunca el token: viaja en una cookie HttpOnly)
  cargando: boolean; // true mientras checkSession confirma la sesión al abrir la app
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void; // la usa el interceptor de Axios cuando la sesión deja de ser válida
}

// Estado de la sesión. persist guarda SOLO el usuario en localStorage (partialize):
// así la interfaz recuerda quién era tras recargar, y checkSession lo confirma con el backend.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginRequest(username, password); // el backend deja la cookie
        const usuario = await meRequest();
        descartarDatosDeUsuario(); // arranca una sesión limpia: nada de la sesión anterior
        set({ usuario });
      },

      logout: async () => {
        try {
          await logoutRequest();
        } finally {
          // Aunque el backend no responda, la sesión local se cierra igual
          descartarDatosDeUsuario(); // los pedidos y listados del usuario no deben quedar en caché
          set({ usuario: null });
        }
      },

      checkSession: async () => {
        try {
          const usuario = await meRequest();
          set({ usuario, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        descartarDatosDeUsuario();
        set({ usuario: null });
      },
    }),
    {
      name: "food-store-auth",
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
);