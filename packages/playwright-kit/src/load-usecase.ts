import type { UsecaseFunction, UsecaseRegistry } from './types';

/**
 * usecase-id に対応するユースケース関数を返す。
 * registry はプロダクト側で定義した UsecaseRegistry を渡すこと。
 */
export function loadUsecase(
  registry: UsecaseRegistry,
  usecaseId: string,
): UsecaseFunction {
  const usecase = registry[usecaseId];
  if (!usecase) {
    const available = Object.keys(registry).join(', ');
    throw new Error(
      `Unknown usecase-id: "${usecaseId}". Available: [${available}]`,
    );
  }
  return usecase;
}
