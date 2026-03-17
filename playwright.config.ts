import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './src',
  timeout: Number(process.env.TIMEOUT) || 30000,
  fullyParallel: true,
  /** 並列 worker 数。未設定時は Playwright のデフォルト（おおよそ CPU コア数）。例: PLAYWRIGHT_WORKERS=4 */
  workers: process.env.PLAYWRIGHT_WORKERS
    ? Number(process.env.PLAYWRIGHT_WORKERS)
    : undefined,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: process.env.HEADLESS !== 'false',
    actionTimeout: Number(process.env.ACTION_TIMEOUT) || 10000,
    launchOptions: {
      slowMo: Number(process.env.SLOW_MO) || 0,
    },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
