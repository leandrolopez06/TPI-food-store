import type { RegistroPayload, Usuario } from "@/features/auth/types/auth";
import { axiosInstance } from "@/shared/api/axiosInstance";

// Login con formulario OAuth2 (application/x-www-form-urlencoded). El backend deja el JWT
// en una cookie HttpOnly: la respuesta solo trae un mensaje.
export async function loginRequest(username: string, password: string): Promise<void> {
  await axiosInstance.post("/auth/token", new URLSearchParams({ username, password }));
}

export async function logoutRequest(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}

export async function meRequest(): Promise<Usuario> {
  const { data } = await axiosInstance.get<Usuario>("/auth/me");
  return data;
}

export async function registerRequest(datos: RegistroPayload): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>("/auth/register", datos);
  return data;
}