import type { Page } from '@playwright/test';

const DEFAULT_CLICK_POSITION = { x: 100, y: 100 };
const DEFAULT_SVG_NAME = 'track';

export interface SvgAddParams {
  x?: number;
  y?: number;
  svgName?: string;
}

const INTERVAL_MS = 3000;
const SVG_COUNT = 5;
const Y_STEP = 50;

/**
 * yjs collab canvas画面で「登録画像」パネルから SVG アセットを選択し、
 * canvas 上に 10 個の SVG を追加する。
 * 3 秒間隔で 1 つずつ追加。X は params.x のまま、Y は 1 つごとに +50。
 * params で開始座標 (x, y) と SVG アセット名 (svgName) を指定可能。
 */
export default async function svgAdd(
  page: Page,
  params?: SvgAddParams,
): Promise<void> {
  const {
    x = DEFAULT_CLICK_POSITION.x,
    y = DEFAULT_CLICK_POSITION.y,
    svgName = DEFAULT_SVG_NAME,
  } = params ?? {};

  const assetLibraryButton = page.getByRole('button', { name: '登録画像' });
  const canvas = page.locator('canvas.upper-canvas');

  for (let i = 0; i < SVG_COUNT; i++) {
    await assetLibraryButton.click();

    const svgAssetButton = page.getByRole('button', { name: svgName });
    await svgAssetButton.waitFor({ state: 'visible' });
    await svgAssetButton.click();

    await canvas.click({ position: { x, y: y + i * Y_STEP } });

    if (i < SVG_COUNT - 1) {
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
    }
  }
}
