// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// MSW v2의 최신 문법을 못 알아들어서 발생하는 에러 - TextEncoder 오류 보완용
// 이 폴리필은 서버(SetupServer)를 import 하기 전에 적용되어야 합니다.
import { TextEncoder, TextDecoder } from 'util';

// (global as any)를 사용해 타입 검사를 살짝 우회합니다.
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// MSW (Mock Service Worker) test server를 설정합니다.
import { server } from './mocks/server';

// 테스트 시작 전 한 번 실행
beforeAll(() => server.listen());
// 각 테스트 후 핸들러 리셋
afterEach(() => server.resetHandlers());
// 모든 테스트 완료 후 서버 닫기
afterAll(() => server.close());
