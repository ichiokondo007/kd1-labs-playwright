import { createSingleUserTests } from '@kd1-labs/playwright-kit';
import { login } from './login/login';
import { transition } from './transition/transition';
import { usecaseRegistry } from './usecase-registry';

createSingleUserTests({
  usecaseRegistry,
  loginFn: login,
  transitionFn: transition,
  srcDir: __dirname,
});
