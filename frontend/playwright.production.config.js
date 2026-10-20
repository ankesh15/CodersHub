import { defineConfig } from '@playwright/test';
import config from './playwright.config.js';

// Exercise compiled assets and the real API using a local reverse proxy.
// This starts only local preview/test servers and never deploys to a host.
export default defineConfig({
  ...config,
  webServer: [
    config.webServer[0],
    {
      ...config.webServer[1],
      command: 'npm run build && npm run preview -- --host localhost --port 5173 --strictPort',
      timeout: 60000,
    },
  ],
});
