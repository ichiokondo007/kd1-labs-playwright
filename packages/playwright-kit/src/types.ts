import type { Page } from '@playwright/test';

/** usecase 関数のシグネチャ。各プロダクトの usecase はこの型に合わせて実装する。 */
export type UsecaseFunction = (
  page: Page,
  params?: Record<string, unknown>,
) => Promise<void>;

/** usecase-id をキーに UsecaseFunction を束ねるレジストリ。プロダクト側で定義する。 */
export type UsecaseRegistry = Record<string, UsecaseFunction>;

export interface LoginParams {
  username: string;
  password: string;
  /** ログイン完了を待つタイムアウト（ミリ秒）。未指定時は 5000 */
  timeoutMs?: number;
}

export interface TransitionEntry {
  pageurl: string;
  pageName?: string;
  'data-testid': string;
}

export interface TransitionConfigSchema {
  transitions: TransitionEntry[];
}

export interface TransitionParams {
  pageurl: string;
  /** プレースホルダ（:id 等）を置換するためのパラメータ。先頭要素のキーで pageurl の :key を置換する。 */
  params?: Array<Record<string, string>>;
  /** エラーメッセージ用（NG 時に testName:xxx として表示） */
  testName?: string;
  /** エラーメッセージ用（NG 時に loginUser:xxx として表示） */
  loginUser?: string;
}

/** プロダクト側で実装するログイン関数のシグネチャ */
export type LoginFn = (page: Page, params: LoginParams) => Promise<void>;

/** プロダクト側で実装する画面遷移関数のシグネチャ */
export type TransitionFn = (page: Page, params: TransitionParams) => Promise<void>;

export interface TestCase {
  testName: string;
  login: LoginParams;
  transitions: {
    pageurl: string;
    params?: Array<Record<string, string>>;
    description?: string;
    'data-testid': string;
  };
  usecases: {
    'usecase-id': string;
    description?: string;
    params?: Record<string, unknown>;
    'params-description'?: string;
  }[];
}

export interface TestBaseSchema {
  _purpose?: string;
  testcases: TestCase[];
}

export interface SingleUserTestsOptions {
  usecaseRegistry: UsecaseRegistry;
  /** プロダクト側で実装したログイン関数 */
  loginFn: LoginFn;
  /** プロダクト側で実装した画面遷移関数 */
  transitionFn: TransitionFn;
  /** テストシナリオ JSON を探すディレクトリ。デフォルトは呼び出し元の __dirname */
  srcDir?: string;
  /** 特定の JSON ファイルだけ実行する場合のファイル名 */
  targetFile?: string;
  /** JSON ファイル名のプレフィックス。デフォルトは 'single-user' */
  filePrefix?: string;
}
