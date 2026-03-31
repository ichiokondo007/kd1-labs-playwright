import type { Page } from '@playwright/test';

/** canvas 上でクリックする座標（要素左上からの相対）。未指定時はデフォルト値 */
const DEFAULT_CLICK_POSITION = { x: 100, y: 10 };

export interface RectAddParams {
  x?: number;
  y?: number;
}

const INTERVAL_MS = 3000;
const RECT_COUNT = 5;
const Y_STEP = 50;

/**
 * yjs collab canvas画面で Circle ツールを選択し、canvas 上に 5 つの円を追加する。
 * 5 秒間隔で 1 つずつ追加。X は params.x のまま、Y は 1 つごとに +50（y, y+50, y+100, y+150, y+200）。
 * params で開始座標 (x, y) を指定可能。
 */
export default async function circleAdd(
  page: Page,
  params?: RectAddParams,
): Promise<void> {
  const { x = DEFAULT_CLICK_POSITION.x, y = DEFAULT_CLICK_POSITION.y } =
    params ?? {};

  const rectButton = page.getByRole('button', { name: 'Rect' });
  const canvas = page.locator('canvas.upper-canvas');

  for (let i = 0; i < RECT_COUNT; i++) {
    await rectButton.click();
    await canvas.click({ position: { x, y: y + i * Y_STEP } });
    if (i < RECT_COUNT - 1) {
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
    }
  }
}
