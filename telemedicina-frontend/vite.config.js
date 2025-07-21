import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Otimizações para produção
    minify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
        },
      },
    },
    // Configurações de performance
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },
  // Configurações do servidor de desenvolvimento
  server: {
    port: 5173,
    host: true,
  },
  // Configurações de preview (produção local)
  preview: {
    port: 4173,
    host: true,
  },
})
