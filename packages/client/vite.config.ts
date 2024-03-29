import { defineConfig } from "vite";
import path from "node:path";

import solid from "vite-plugin-solid";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      outputDir: "dist",
      staticImport: true
    }),

    solid()
  ],

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
      external: ["solid-js", "solid-js/store", "solid-js/web", "@solidjs/router", "node-forge", "@pawnote/api", "@pawnote/i18n"]
    }
  }
});
