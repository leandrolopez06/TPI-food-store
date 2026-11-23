import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Alias @/ -> src/ (el mismo alias está declarado en tsconfig.app.json)
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // El backend solo acepta el origen http://localhost:5173 (CORS con cookies):
  // si el puerto está ocupado, Vite avisa en lugar de usar otro.
  server: { port: 5173, strictPort: true },
  build: { chunkSizeWarningLimit: 700 },
})