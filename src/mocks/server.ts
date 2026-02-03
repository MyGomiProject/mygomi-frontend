// Node 환경에서 msw가 필요로 하는 TextEncoder/TextDecoder가 없을 수 있어
// 여기서 간단한 폴리필을 적용합니다 (테스트 환경용, 최소 기능).
if (typeof (global as any).TextEncoder === 'undefined') {
  (global as any).TextEncoder = class {
    encode(input: string = '') {
      return Buffer.from(input, 'utf8');
    }
  };
}
if (typeof (global as any).TextDecoder === 'undefined') {
  (global as any).TextDecoder = class {
    decode(buf: any) {
      return Buffer.from(buf).toString('utf8');
    }
  };
}

// NOTE: ESM import hoisting may load msw before our polyfills apply. Use require() here to ensure polyfill runs first.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setupServer } = require('msw/node');
import { handlers } from './handlers';

export const server = setupServer(...handlers);
