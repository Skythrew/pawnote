import { defineConfig } from "vite";
import path from "node:path";

import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      outputDir: "dist",
      staticImport: true
    })
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },

  build: {
    lib: {
      formats: ["es"],
      entry: path.resolve(__dirname, "src/index.ts"),
      fileName: "index"
    },
    rollupOptions: {
      external: ["node-forge"]
    }
  }
});
