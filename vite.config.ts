import { defineConfig } from "vite";
import pkg from "./package.json";
import path from "path";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import solid from "solid-start/vite";
import vercel from "solid-start-vercel";

import windi from "vite-plugin-windicss";
import { VitePWA as pwa } from "vite-plugin-pwa";
import icons from "unplugin-icons/vite";

import auto from "unplugin-auto-import/vite";
import icons_resolver from "unplugin-icons/resolver";

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
      includeAssets: [
        "favicon.ico",
        "robots.txt"
      ],

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
    APP_URL: JSON.stringify(pkg.homepage),
    APP_NAME: JSON.stringify("Pornote"),
    APP_VERSION: JSON.stringify(pkg.version),
    APP_DESCRIPTION: JSON.stringify(pkg.description)
  },

  build: {
    target: "esnext"
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});