import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    proxy: {
      "/api-creditech": {
        target: "https://apiloan.creditech.com.ar",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-creditech/, ""),
      },
      "/api-directo": {
        target: "https://public.pro.directo.com.ar/ecommerce-pro",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-directo/, ""),
      },
    },
  },
});