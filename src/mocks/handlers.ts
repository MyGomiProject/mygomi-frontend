// src/mocks/handlers.ts

import { http, HttpResponse } from 'msw';

export const handlers = [


  // REQ-02 캘린더 데이터 (기존 코드 유지)
  http.get('/api/collection/calendar', () => {
    return HttpResponse.json({
      data: [
        { id: '1', title: '가연성', start: '2026-02-02', allDay: true, extendedProps: { wasteType: 'BURNABLE' } },
        { id: '2', title: '플라스틱', start: '2026-02-04', allDay: true, extendedProps: { wasteType: 'PLASTIC' } },
        { id: '3', title: '가연성', start: '2026-02-05', allDay: true, extendedProps: { wasteType: 'BURNABLE' } },
        { id: '4', title: '병/캔', start: '2026-02-06', allDay: true, extendedProps: { wasteType: 'CAN_BOTTLE' } },
        { id: '5', title: '종이', start: '2026-02-11', allDay: true, extendedProps: { wasteType: 'PAPER' } },
        { id: '6', title: '불연성', start: '2026-02-13', allDay: true, extendedProps: { wasteType: 'NON_BURNABLE' } },
        { id: '7', title: '가연성', start: '2026-02-16', allDay: true, extendedProps: { wasteType: 'BURNABLE' } },
        { id: '8', title: '플라스틱', start: '2026-02-18', allDay: true, extendedProps: { wasteType: 'PLASTIC' } },
      ]
    });
  }),

  // REQ-01 로그인/회원가입 
http.post('/api/auth/login', async ({ request }) => {
    // req.json() 대신 request.json()을 사용합니다.
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    // 간단한 샘플 유효성: 테스트 계정
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        data: {
          token: 'fake-token-123',
          user: { id: 1, email, nickname: '테스트유저' },
        },
      });
    }

    return HttpResponse.json({
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    }, { status: 401 });
  }),

  // 여기도 ({ request }) 로 수정
  http.post('/api/auth/signup', async ({ request }) => {
    const body = await request.json();
    const { email } = body as { email?: string };

    // 간단히 이메일 중복을 막는 시나리오
    if (email === 'existing@example.com') {
      return HttpResponse.json({ message: '이미 등록된 이메일입니다.' }, { status: 400 });
    }

    return HttpResponse.json({ data: { userId: 123 } }, { status: 201 });
  }),
];