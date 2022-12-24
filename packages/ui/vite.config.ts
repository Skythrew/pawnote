import { defineConfig } from "vite";
import path from "node:path";

import solid from "vite-plugin-solid";
import windi from "vite-plugin-windicss";

export default defineConfig({
  plugins: [solid(), windi()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },

  build: {
    lib: {
      formats: ["es"],
      entry: path.resolve(__dirname, "src/index.tsx"),
      fileName: "index"
    },
    rollupOptions: {
      external: ["solid-js"]
    }
  }
});