import fs from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';
import { loadUsecase } from './load-usecase';
import type { SingleUserTestsOptions, TestBaseSchema } from './types';

/**
 * single-user*.json を読み込み、Playwright の test() を動的に生成する。
 * プロダクト側の spec ファイルからこの関数を呼ぶだけでテストが登録される。
 */
export function createSingleUserTests(options: SingleUserTestsOptions): void {
  const {
    usecaseRegistry,
    loginFn,
    transitionFn,
    srcDir,
    targetFile = process.env.TEST_BASE,
    filePrefix = 'single-user',
  } = options;

  const dir = srcDir ?? path.dirname(new Error().stack?.split('\n')[2]?.match(/\((.+):\d+:\d+\)/)?.[1] ?? '');

  const jsonFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(filePrefix) && f.endsWith('.json'))
    .filter((f) => (targetFile ? f === targetFile : true));

  for (const file of jsonFiles) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const testBase: TestBaseSchema = JSON.parse(raw);
    const suffix = file.replace(/\.json$/, '').replace(new RegExp(`^${filePrefix}`), '');
    const testLabel = (name: string) =>
      suffix ? `${name}-${filePrefix}${suffix}` : `${name}-${filePrefix}`;

    for (const tc of testBase.testcases) {
      test(testLabel(tc.testName), async ({ page }) => {
        await test.step('login', async () => {
          await page.goto('/login');
          await loginFn(page, tc.login);
        });

        await test.step('transition', async () => {
          await transitionFn(page, {
            ...tc.transitions,
            testName: tc.testName,
            loginUser: tc.login.username,
          });
        });

        for (const uc of tc.usecases) {
          await test.step(`usecase: ${uc['usecase-id']}`, async () => {
            const usecase = loadUsecase(usecaseRegistry, uc['usecase-id']);
            await usecase(page, uc.params);
          });
        }
      });
    }
  }
}
