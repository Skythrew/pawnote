import type { Theme } from "@unocss/preset-uno";
import type { Preset } from "unocss";

import { defineConfig } from "unocss";

// Presets.
import presetUno from "@unocss/preset-uno";
import { presetKobalte } from "unocss-preset-primitives";

// Transformers.
import transformerVariantGroup from "@unocss/transformer-variant-group";

// Themes.
import { extendCatppuccin } from "unocss-catppuccin-colours";

export default defineConfig({
  presets: [
    presetUno(),
    presetKobalte({
      prefix: "ui"
    }) as Preset<Theme>
  ],

  transformers: [
    transformerVariantGroup()
  ],

  theme: {
    colors: extendCatppuccin(),

    fontFamily: {
      sans: "Comfortaa"
    },

    animation: {
      keyframes: {
        "scale-in": "{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}",
        "scale-out": "{from{opacity:1;transform:scale(&)}to{opacity:0;transform:scale(0.96)}}"
      }
    }
  }
});
