import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './test/browser', testMatch: '**/workflows.spec.js', fullyParallel: false, workers: 1, timeout: 60000,
  use: { baseURL: 'http://localhost:5173', browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'node ../backend/test/e2e-server.cjs', url: 'http://127.0.0.1:5051/api/health', timeout: 120000, reuseExistingServer: false,
      env: { NODE_ENV: 'test', FRONTEND_URL: 'http://localhost:5173', MONGOMS_DOWNLOAD_DIR: process.env.MONGOMS_DOWNLOAD_DIR || '/tmp/codershub-mongodb' } },
    { command: 'npm run dev -- --host localhost --port 5173 --strictPort', url: 'http://localhost:5173', timeout: 30000, reuseExistingServer: false,
      env: { VITE_API_BASE_URL: '/api', API_PROXY_TARGET: 'http://127.0.0.1:5051' } },
  ],
});
