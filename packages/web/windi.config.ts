import { defineConfig } from "windicss/helpers";

export default defineConfig ({
  darkMode: "media",
  attributify: false,

  theme: {
    extend: {
      colors: {
        brand: {
          white: "#F5FEFA",
          primary: "#17AA67",
          light: "#D1FAE7",
          dark: "#222222"
        }
      }
    },

    fontFamily: {
      sans: ["Poppins", "sans-serif"]
    }
  }
});
