import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/creators': 'http://localhost:8000',
      '/brands': 'http://localhost:8000',
      '/requirements': 'http://localhost:8000',
      '/feedback': 'http://localhost:8000',
      '/social': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
    },
  },
})
