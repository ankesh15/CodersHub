import { defineConfig } from '@playwright/test';
import config from './playwright.config.js';
export default defineConfig({ ...config, testMatch: '**/live.spec.js', outputDir: 'test-results-live', timeout: 180000 });
