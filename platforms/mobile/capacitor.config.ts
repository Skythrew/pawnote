import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pawnote.app',
  appName: 'Pawnote',
  webDir: 'dist',
  bundledWebRuntime: false,

  plugins: {
    CapacitorHttp: { enabled: true }
  }
};

export default config;
