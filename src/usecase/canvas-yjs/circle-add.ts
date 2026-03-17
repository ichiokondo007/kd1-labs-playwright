import type { Page } from '@playwright/test';

/** canvas 上でクリックする座標（要素左上からの相対）。未指定時はデフォルト値 */
const DEFAULT_CLICK_POSITION = { x: 100, y: 10 };

export interface CircleAddParams {
  x?: number;
  y?: number;
  waitMs?: number;
}

/**
 * yjs collab canvas画面で Circle ツールを選択し、canvas の指定座標をクリックして円を追加する。
 * params で座標 (x, y) と末尾の待機時間 waitMs を指定可能。
 */
export default async function circleAdd(
  page: Page,
  params?: CircleAddParams,
): Promise<void> {
  const { x = DEFAULT_CLICK_POSITION.x, y = DEFAULT_CLICK_POSITION.y } = params ?? {};

  await page.getByRole('button', { name: 'Circle' }).click();

  const canvas = page.locator('canvas.upper-canvas');
  await canvas.click({ position: { x, y } });

  // 動作確認用: テスト終了前にブラウザを開いたまま待機する（headed 実行時など）
  const waitMs =
    params?.waitMs ?? (Number(process.env.WAIT_AFTER_MS) || 20000);
  await new Promise((resolve) => setTimeout(resolve, waitMs));
}
