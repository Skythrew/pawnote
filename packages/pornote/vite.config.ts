import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";

import solid from "solid-start/vite";
import vercel from "solid-start-vercel";

import windi from "vite-plugin-windicss";
import { VitePWA as pwa } from "vite-plugin-pwa";
import icons from "unplugin-icons/vite";

import auto from "unplugin-auto-import/vite";
import icons_resolver from "unplugin-icons/resolver";

const pkg = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "package.json"),
  { encoding: "utf-8" }
));

export default defineConfig ({
  plugins: [
    solid ({
      ssr: false,
      adapter: vercel()
    }),

    auto ({
      dts: "./src/auto-imports.d.ts",

      resolvers: [
        icons_resolver({
          prefix: "Icon",
          extension: "jsx"
        })
      ],

      imports: [
        "solid-js",
        "@solidjs/router",
        {
          "@solidjs/meta": [
            "Title"
          ]
        }
      ]
    }),

    pwa ({
      base: "/",
      registerType: "prompt",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,woff,woff2}"
        ]
      },

      manifest: {
        name: "Pornote",
        short_name: "Pornote",
        description: pkg.description,

        categories: [
          "productivity"
        ],

        icons: [
          {
            src: "/icons/icon-default.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-default-large.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/icon-default-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icons/icon-default-maskable-large.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],

        start_url: "/",
        theme_color: "#17AA67",
        background_color: "#17AA67",
        display: "standalone",
        orientation: "portrait"
      }
    }),

    windi(),
    icons({ compiler: "solid" })
  ],

  define: {
    APP_NAME: JSON.stringify("Pornote"),
    APP_VERSION: JSON.stringify(pkg.version)
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