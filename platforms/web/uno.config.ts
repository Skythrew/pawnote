import { defineConfig } from "unocss";

import presetUno from "@unocss/preset-uno";
import transformerVariantGroup from "@unocss/transformer-variant-group";

import { extendCatppuccin } from "unocss-catppuccin-colours";

export default defineConfig({
  presets: [
    presetUno()
  ],

  transformers: [
    transformerVariantGroup()
  ],

  theme: {
    colors: extendCatppuccin(),

    fontFamily: {
      sans: "Comfortaa"
    }
  }
});
