// src/mocks/handlers.ts

import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/collection/calendar', () => {
    return HttpResponse.json({
      data: [
        // 2월 데이터를 넉넉하게 넣어볼까요?
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
];