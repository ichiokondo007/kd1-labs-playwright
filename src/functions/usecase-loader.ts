import type { Page } from '@playwright/test';
import circleAdd from '../usecase/canvas-yjs/circle-add';

export type UsecaseFunction = (page: Page) => Promise<void>;

const usecaseMap: Record<string, UsecaseFunction> = {
  'circle-add': circleAdd,
};

/**
 * usecase-id に対応するユースケース関数を返す。
 * 新しいユースケースを追加する場合は、importと usecaseMap への登録を行うこと。
 */
export function loadUsecase(usecaseId: string): UsecaseFunction {
  const usecase = usecaseMap[usecaseId];
  if (!usecase) {
    throw new Error(`Unknown usecase-id: "${usecaseId}". Register it in usecase-loader.ts.`);
  }
  return usecase;
}
