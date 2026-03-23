import fs from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';
import { login } from './functions/login';
import { transition } from './functions/transition';
import { loadUsecase } from './functions/usecase-loader';

interface TestCase {
  testName: string;
  login: { username: string; password: string; timeoutMs?: number };
  transitions: {
    pageurl: string;
    params?: Array<Record<string, string>>;
    description?: string;
    'data-testid': string;
  };
  usecase: {
    'usecase-id': string;
    description?: string;
    params?: Record<string, unknown>;
    'params-description'?: string;
  };
}

interface TestBaseSchema {
  _purpose?: string;
  testcases: TestCase[];
}

const srcDir = __dirname;
const targetFile = process.env.TEST_BASE;

const jsonFiles = fs
  .readdirSync(srcDir)
  .filter((f) => f.startsWith('test-base') && f.endsWith('.json'))
  .filter((f) => (targetFile ? f === targetFile : true));

for (const file of jsonFiles) {
  const raw = fs.readFileSync(path.join(srcDir, file), 'utf-8');
  const testBase: TestBaseSchema = JSON.parse(raw);
  const label = file.replace(/\.json$/, '');

  for (const tc of testBase.testcases) {
    test(`[${label}] ${tc.testName}`, async ({ page }) => {
      await page.goto('/login');
      await login(page, tc.login);

      await transition(page, {
        ...tc.transitions,
        testName: tc.testName,
        loginUser: tc.login.username,
      });

      const usecase = loadUsecase(tc.usecase['usecase-id']);
      await usecase(page, tc.usecase.params);
    });
  }
}
