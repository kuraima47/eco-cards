import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    open:"192.168.1.28:3001",
    proxy: {
      "/api": {
        target: "http://192.168.1.28:8080",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://192.168.1.28:8080",
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

