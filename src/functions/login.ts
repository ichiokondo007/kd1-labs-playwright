import type { Page } from '@playwright/test';

/** test-base.json の login フィールドと互換 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * ログイン画面でフォーム入力・送信し、Dashboard Home 表示まで待つ。
 * 呼び出し前に page.goto('/login') などでログイン画面に遷移しておくこと。
 */
export async function login(
  page: Page,
  params: LoginParams,
): Promise<void> {
  const { username, password } = params;

  await page.locator('input[name="userName"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('heading', { name: 'Dashboard Home', level: 1 }).waitFor({ state: 'visible', timeout: 5000 });
}
