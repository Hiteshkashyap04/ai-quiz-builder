import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests to your backend
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Your backend URL
        changeOrigin: true,
        // remove /api prefix if your backend doesn't expect it
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
})