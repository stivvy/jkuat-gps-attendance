import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stivvy.jkuat',
  appName: 'Student App',
  webDir: 'dist', // Must be 'dist' for Vite projects like Base44
  bundledWebRuntime: false
};

export default config;
