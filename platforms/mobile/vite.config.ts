import { defineConfig } from 'vite';
import path from "node:path";

import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],

  server: {
    strictPort: true,
    port: 3000
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },

  build: {
    target: "esnext"
  }
});
