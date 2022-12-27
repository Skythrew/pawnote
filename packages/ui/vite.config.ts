import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";

import solid from "vite-plugin-solid";
import windi from "vite-plugin-windicss";

const pkg = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../pornote/package.json"),
    { encoding: "utf-8" }
  )
);

export default defineConfig({
  plugins: [solid(), windi()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },

  define: {
    "APP_NAME": JSON.stringify("Pornote"),
    "APP_VERSION": JSON.stringify(pkg.version as string)
  },

  build: {
    lib: {
      formats: ["es"],
      entry: {
        components: path.resolve(__dirname, "src/components/index.tsx"),
        pages: path.resolve(__dirname, "./src/pages/index.tsx")
      }
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "@solidjs/router"]
    }
  }
});
