import type { UsecaseRegistry } from '@kd1-labs/playwright-kit';
import circleAdd from './usecase/canvas-yjs/circle-add';
import rectAdd from './usecase/canvas-yjs/rect-add';
import svgAdd from './usecase/canvas-yjs/svg-add';

/**
 * プロダクト固有のユースケース登録表。
 * usecase を追加する場合は、import と下記マップへの追加を行う。
 */
export const usecaseRegistry: UsecaseRegistry = {
  'circle-add': circleAdd,
  'rect-add': rectAdd,
  'svg-add': svgAdd,
};
