import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_BASE_URL || "",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('router')) {
                return 'vendor-core';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('jspdf')) {
                return 'vendor-pdf';
              }
              if (id.includes('pdfjs-dist')) {
                return 'vendor-pdf-worker';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
