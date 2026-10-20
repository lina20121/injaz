import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.injaz.app',
  appName: 'إنجاز',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;