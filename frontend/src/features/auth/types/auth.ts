export type Rol = "user" | "admin";

// Mismos campos que UserPublic del backend (nunca incluye la contraseña)
export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

// Mismos campos que UserCreate del backend
export interface RegistroPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
}