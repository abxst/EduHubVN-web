import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['sockjs-client']
  }

  server: {
    proxy: {
      '/api': {
        target: 'http://14.161.18.135:8880',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

export default {
  
};