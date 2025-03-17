import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://nginx:8080",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://nginx:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    watch: {
      usePolling: true,
    },
    host: "0.0.0.0",
    port: 3001,
  },
})

