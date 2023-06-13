import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pawnote.app",
  appName: "Pawnote",
  webDir: "dist",

  android: { allowMixedContent: true }
};

export default config;
