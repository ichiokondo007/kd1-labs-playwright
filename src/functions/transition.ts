import type { Page } from '@playwright/test';
import transitionConfig from '../transition.json';

interface TransitionEntry {
  pageurl: string;
  pageName?: string;
  'data-testid': string;
}

interface TransitionConfigSchema {
  transitions: TransitionEntry[];
}

const config = transitionConfig as TransitionConfigSchema;

const TRANSITION_CHECK_TIMEOUT = 10000;

export interface TransitionParams {
  pageurl: string;
  /** プレースホルダ（:id 等）を置換するためのパラメータ。先頭要素のキーで pageurl の :key を置換する。 */
  params?: Array<Record<string, string>>;
  /** エラーメッセージ用（NG 時に testName:xxx として表示） */
  testName?: string;
  /** エラーメッセージ用（NG 時に loginUser:xxx として表示） */
  loginUser?: string;
}

/**
 * pageurl テンプレートと params から実際の URL を組み立てる。
 * 例: "/example/canvas-yjs/:id" + [{ id: "abc" }] → "/example/canvas-yjs/abc"
 */
function buildUrl(pageurl: string, params?: Array<Record<string, string>>): string {
  if (!params || params.length === 0) return pageurl;
  const replacements = params[0];
  let url = pageurl;
  for (const [key, value] of Object.entries(replacements)) {
    url = url.replace(`:${key}`, value);
  }
  return url;
}

/**
 * transition.json（SSOT）から pageurl に対応する data-testid を取得する。
 * 登録が無い場合はエラーを throw する。
 */
function getDataTestIdByPageurl(pageurl: string): string {
  const entry = config.transitions.find((e) => e.pageurl === pageurl);
  if (!entry) {
    throw new Error(
      `transition.json に pageurl "${pageurl}" が登録されていません。SSOT のため登録が必要です。`,
    );
  }
  return entry['data-testid'];
}

/**
 * 指定されたページURLへ遷移し、transition.json で定義された data-testid の要素が
 * 表示されるまで待つ。表示されない場合は指定フォーマットでエラーを throw する。
 */
export async function transition(
  page: Page,
  params: TransitionParams,
): Promise<void> {
  const { pageurl, params: urlParams, testName = '', loginUser = '' } = params;

  const expectedDataTestId = getDataTestIdByPageurl(pageurl);
  const url = buildUrl(pageurl, urlParams);

  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');

  try {
    await page
      .getByTestId(expectedDataTestId)
      .waitFor({ state: 'visible', timeout: TRANSITION_CHECK_TIMEOUT });
  } catch {
    throw new Error(
      `testName:${testName}, loginUser:${loginUser}, transitioncheck:${expectedDataTestId} NG`,
    );
  }
}
