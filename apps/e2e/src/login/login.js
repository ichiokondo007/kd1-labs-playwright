const DEFAULT_LOGIN_TIMEOUT_MS = 5000;
/**
 * ログイン画面でフォーム入力・送信し、Dashboard Home 表示まで待つ。
 * 呼び出し前に page.goto('/login') などでログイン画面に遷移しておくこと。
 */
export async function login(page, params) {
    const { username, password, timeoutMs = DEFAULT_LOGIN_TIMEOUT_MS } = params;
    await page.locator('input[name="userName"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page
        .getByRole('heading', { name: 'Dashboard Home', level: 1 })
        .waitFor({ state: 'visible', timeout: timeoutMs });
}
