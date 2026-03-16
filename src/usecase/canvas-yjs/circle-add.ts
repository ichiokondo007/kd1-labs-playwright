import type { Page } from '@playwright/test';

/** canvas 上でクリックする座標（要素左上からの相対）。未指定時は中央 */
const DEFAULT_CLICK_POSITION = { x: 400, y: 300 };

/**
 * yjs collab canvas画面で Circle ツールを選択し、canvas の指定座標をクリックして円を追加する。
 */
export default async function circleAdd(
  page: Page,
  options?: { x?: number; y?: number },
): Promise<void> {
  const { x = DEFAULT_CLICK_POSITION.x, y = DEFAULT_CLICK_POSITION.y } = options ?? {};

  await page.getByRole('button', { name: 'Circle' }).click();

  const canvas = page.locator('canvas.upper-canvas');
  await canvas.click({ position: { x, y } });
}
