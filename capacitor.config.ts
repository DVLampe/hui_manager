import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.huimanager.app',
  appName: 'Hui Manager',
  webDir: 'out',
  server: {
    url: 'http://192.168.1.4:3000',
    cleartext: true
  }
};

export default config;
