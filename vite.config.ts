import { defineConfig } from "vite";
import pkg from "./package.json";
import path from "path";

// @ts-ignore
import vercel from "solid-start-vercel";
import solid from "solid-start/vite";
import windi from "vite-plugin-windicss";
import { VitePWA as pwa } from "vite-plugin-pwa";
import auto from "unplugin-auto-import/vite";

export default defineConfig ({
  plugins: [
    solid ({
      ssr: false,
      adapter: vercel()
    }),

    auto ({
      dts: "./src/auto-imports.d.ts",

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

    windi()
  ],

  define: {
    APP_NAME: JSON.stringify("Pornote"),
    APP_VERSION: JSON.stringify(pkg.version),
    APP_DESCRIPTION: JSON.stringify(pkg.description)
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
