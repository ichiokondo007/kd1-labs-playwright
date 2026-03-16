import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './src',
  timeout: Number(process.env.TIMEOUT) || 30000,
  fullyParallel: true,
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
