import { test } from '@playwright/test';
import testBase from './test-base.json';
import { login } from './functions/login';
import { transition } from './functions/transition';
import { loadUsecase } from './functions/usecase-loader';

for (const tc of testBase.testcases) {
  test(tc.testName, async ({ page }) => {
    // 1. ログイン
    await page.goto('/login');
    await login(page, tc.login);

    // 2. 画面遷移
    await transition(page, {
      ...tc.transitions,
      testName: tc.testName,
      loginUser: tc.login.username,
    });

    // 3. ユースケース実行
    const usecase = loadUsecase(tc.usecase['usecase-id']);
    await usecase(page, tc.usecase.params);
  });
}
