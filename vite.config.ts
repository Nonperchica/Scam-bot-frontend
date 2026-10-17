import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), 'MINI_')
  const miniOrigin = environment.MINI_WEB_ORIGIN?.trim()
  return {
    plugins: [react()],
    server: {
      allowedHosts: miniOrigin ? [new URL(miniOrigin).hostname] : [],
      proxy: {
        '/api/mini': { target: 'http://127.0.0.1:8001', changeOrigin: true },
        '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      },
    },
  }
})
