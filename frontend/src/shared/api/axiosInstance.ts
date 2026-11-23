import axios from "axios";

// Instancia de Axios que usa TODA la aplicación.
// - baseURL: dirección del backend, se lee de VITE_API_URL (archivo .env).
// - withCredentials: el navegador envía la cookie HttpOnly "access_token" en cada petición
//   y acepta la que devuelve el login. El JWT nunca pasa por JavaScript.
// El interceptor de respuesta (401 y cuenta desactivada) se registra en setupInterceptors.ts.
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});