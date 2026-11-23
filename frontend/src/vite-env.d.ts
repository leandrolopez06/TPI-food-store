/// <reference types="vite/client" />

// Variables de entorno que usa la aplicación (se leen del archivo .env)
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}