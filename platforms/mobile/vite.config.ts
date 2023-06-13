import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";

import solid from "vite-plugin-solid";
import pages from "vite-plugin-pages";
import unocss from "unocss/vite";
import icons from "unplugin-icons/vite";
import auto from "unplugin-auto-import/vite";
import icons_resolver from "unplugin-icons/resolver";

const workspace_pkg = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../package.json"),
    { encoding: "utf-8" }
  )
);

export default defineConfig({
  build: {
    minify: false,
    target: "esnext"
  },

  plugins: [
    solid(),
    pages(),

    auto({
      dts: "./src/auto-imports.d.ts",

      resolvers: [
        icons_resolver({
          prefix: "Icon",
          extension: "jsx"
        })
      ],

      imports: [
        "solid-js"
      ]
    }),

    unocss(),
    icons({ compiler: "solid" })
  ],

  define: {
    APP_NAME: JSON.stringify("Pawnote"),
    APP_VERSION: JSON.stringify(workspace_pkg.version),
    BETA_GITHUB_SHA: JSON.stringify(process.env.GITHUB_SHA ?? "")
  },

  server: {
    strictPort: true
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
