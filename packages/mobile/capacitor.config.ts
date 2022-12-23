import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pornote.app',
  appName: 'Pornote',
  webDir: 'dist',
  bundledWebRuntime: false,

  plugins: {
    CapacitorHttp: { enabled: true }
  }
};

export default config;
