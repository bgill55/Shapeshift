import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    allowedHosts: true,
    usePolling: true,
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
});
