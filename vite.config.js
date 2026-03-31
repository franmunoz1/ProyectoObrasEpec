import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- Importa esto

export default defineConfig({
  base: '/proyectoobrasepec/',
  plugins: [
    react(),
    tailwindcss(), // <--- Agrégalo aquí
  ],
})