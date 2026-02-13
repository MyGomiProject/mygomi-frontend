// src/mocks/handlers.ts

import { http, HttpResponse } from 'msw';
import { mockAddresses, mockAreas } from './data';

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
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;

    // 간단한 샘플 유효성: 테스트 계정
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        data: {
          accessToken: 'fake-token-123',
          userId: 1,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // 실제 API와 동일한 형식으로 에러 응답
    return HttpResponse.json({
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    }, { status: 401 });
  }), 
 
  http.post('/api/auth/signup', async ({ request }) => { 
    const body = await request.json(); 
    const { email, password, nickname } = body as { email?: string; password?: string; nickname?: string }; 

    // 간단히 이메일 중복을 막는 시나리오
    if (email === 'existing@example.com') {
      return HttpResponse.json({ message: '이미 등록된 이메일입니다.' }, { status: 400 });
    }

    // 성공 응답 (guide.md 스펙에 맞춤)
    return HttpResponse.json({
      data: {
        userId: Math.floor(Math.random() * 1000) + 1,
        token: `fake-token-${Date.now()}`,
      },
    }, { status: 201 });
  }),

  // 사용자 정보 조회
  http.get('/api/users/me', () => {
    return HttpResponse.json({
      data: {
        id: 1,
        email: 'test@example.com',
        nickname: '테스트유저',
        role: 'USER',
        status: 'ACTIVE',
      },
    });
  }),

  // 사용자 정보 수정
  http.put('/api/users/me', async ({ request }) => {
    const body = (await request.json()) as { nickname?: string } | null;
    return HttpResponse.json({
      data: {
        id: 1,
        email: 'test@example.com',
        nickname: body?.nickname || '테스트유저',
        role: 'USER',
        status: 'ACTIVE',
      },
    });
  }),

  // 주소 목록 조회
  http.get('/api/users/me/addresses', () => {
    return HttpResponse.json({
      data: mockAddresses,
    });
  }),

  // 주소 등록
  http.post('/api/users/me/addresses', async ({ request }) => {
    const body = (await request.json()) as {
      prefecture: string;
      ward: string;
      town?: string;
      chome?: string;
      banchiText?: string;
      banchi_text?: string;
      isPrimary?: boolean;
      is_primary?: boolean;
      lat?: number;
      lng?: number;
    } | null;

    if (!body) {
      return HttpResponse.json({ message: '요청 본문이 없습니다.' }, { status: 400 });
    }

    const newAddress = {
      id: mockAddresses.length + 1,
      userId: 1,
      areaId: mockAreas.find(area => 
        area.prefecture === body.prefecture &&
        area.ward === body.ward &&
        area.town === body.town
      )?.id,
      prefecture: body.prefecture,
      ward: body.ward,
      town: body.town,
      chome: body.chome,
      banchiText: body.banchiText || body.banchi_text,
      isPrimary: body.isPrimary || body.is_primary || false,
      lat: body.lat,
      lng: body.lng,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 대표 주소로 설정하면 다른 주소들의 isPrimary를 false로 변경
    if (newAddress.isPrimary) {
      mockAddresses.forEach(addr => {
        if (addr.id !== newAddress.id) {
          addr.isPrimary = false;
        }
      });
    }

    mockAddresses.push(newAddress);
    return HttpResponse.json({
      data: newAddress,
    }, { status: 201 });
  }),

  // 주소 수정
  http.put('/api/users/me/addresses/:id', async ({ request, params }) => {
    const id = Number(params.id);
    const body = (await request.json()) as {
      prefecture?: string;
      ward?: string;
      town?: string;
      chome?: string;
      banchiText?: string;
      banchi_text?: string;
      isPrimary?: boolean;
      is_primary?: boolean;
      lat?: number;
      lng?: number;
    } | null;

    if (!body) {
      return HttpResponse.json({ message: '요청 본문이 없습니다.' }, { status: 400 });
    }

    const address = mockAddresses.find(addr => addr.id === id);


    if (!address) {
      return HttpResponse.json({ message: '주소를 찾을 수 없습니다.' }, { status: 404 });
    }

    Object.assign(address, {
      prefecture: body.prefecture ?? address.prefecture,
      ward: body.ward ?? address.ward,
      town: body.town ?? address.town,
      chome: body.chome ?? address.chome,
      banchiText: body.banchiText || body.banchi_text || address.banchiText,
      isPrimary: body.isPrimary !== undefined ? body.isPrimary : (body.is_primary !== undefined ? body.is_primary : address.isPrimary),
      lat: body.lat ?? address.lat,
      lng: body.lng ?? address.lng,
      updatedAt: new Date().toISOString(),
    });

    // 대표 주소로 설정하면 다른 주소들의 isPrimary를 false로 변경
    if (address.isPrimary) {
      mockAddresses.forEach(addr => {
        if (addr.id !== address.id) {
          addr.isPrimary = false;
        }
      });
    }

    return HttpResponse.json({
      data: address
    });
  }),

  // REQ-03, 04 품목 검색 및 배출 방법 안내
  http.get('/api/items/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || ''; // 검색어
    const ward = url.searchParams.get('ward'); // 구 정보

    // 민지님이 궁금해하던 품목들을 포함한 Mock Data 세트입니다.
    const mockItems = [
      {
        id: 1,
        nameKo: '피자 상자',
        nameJa: 'ピザの箱',
        wasteType: 'BURNABLE',
        description: '음식물이나 기름이 묻은 종이는 재활용이 불가능합니다.',
        ward: '大田区',
        wardSpecificNote: '오타구는 오염된 종이를 가연성 쓰레기로 분류합니다.'
      },
      {
        id: 2,
        nameKo: '종이컵',
        nameJa: '紙コップ',
        wasteType: 'BURNABLE',
        description: '내부 코팅 처리된 종이컵은 가연성 쓰레기로 배출하세요.',
        ward: '大田区'
      },
      {
        id: 3,
        nameKo: '냉장고',
        nameJa: '冷蔵庫',
        wasteType: 'SODAI',
        description: '가전제품 재활용법 대상입니다. 구청에 신고 후 배출하세요.',
        ward: '大田区',
        wardSpecificNote: '신고 후 대형 폐기물 스티커(A 또는 B)를 부착해야 합니다.'
      },
      {
        id: 4,
        nameKo: '페트병',
        nameJa: 'ペットボトル',
        wasteType: 'PLASTIC',
        description: '뚜껑과 라벨을 제거하고 내용물을 비운 뒤 압착하여 배출하세요.',
        ward: '大田区'
      },
      {
        id: 5,
        nameKo: '세면대',
        nameJa: '洗面台',
        wasteType: 'NON_BURNABLE',
        description: '도자기 재질은 불연성 쓰레기로 분류됩니다.',
        ward: '大田区'
      }
    ];

    // 검색어(query)가 포함된 품목만 필터링합니다.
    const filteredResults = mockItems.filter(item => 
      item.nameKo.includes(query) || item.nameJa.includes(query)
    );

    // 검색 결과가 있으면 데이터 전달, 없으면 빈 배열 전달
    return HttpResponse.json({
      data: filteredResults
    });
  }),

  // 주소 삭제
  http.delete('/api/users/me/addresses/:id', ({ params }) => {
    const id = Number(params.id);
    const index = mockAddresses.findIndex(addr => addr.id === id);

    if (index === -1) {
      return HttpResponse.json({ message: '주소를 찾을 수 없습니다.' }, { status: 404 });
    }

    mockAddresses.splice(index, 1);
    return HttpResponse.json({}, { status: 204 });
  }),

  // 대표 주소 설정
  http.patch('/api/users/me/addresses/:id/primary', ({ params }) => {
    const id = Number(params.id);
    const address = mockAddresses.find(addr => addr.id === id);

    if (!address) {
      return HttpResponse.json({ message: '주소를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 다른 주소들의 isPrimary를 false로 변경
    mockAddresses.forEach(addr => {
      addr.isPrimary = addr.id === id;
    });

    return HttpResponse.json({
      data: address,
    });
  }),

  // 지역 검색
  http.get('/api/areas/search', ({ request }) => {
    const url = new URL(request.url);
    const prefecture = url.searchParams.get('prefecture');
    const ward = url.searchParams.get('ward');
    const town = url.searchParams.get('town');
    const chome = url.searchParams.get('chome');
    const banchi = url.searchParams.get('banchi');

    // 필터링된 지역 반환
    let filteredAreas = mockAreas.filter(area => {
      if (prefecture && area.prefecture !== prefecture) return false;
      if (ward && area.ward !== ward) return false;
      if (town && area.town !== town) return false;
      if (chome && area.chome !== chome) return false;
      return true;
    });

    // 매칭되는 지역이 없으면 빈 배열 반환
    return HttpResponse.json({
      data: filteredAreas,
    });
  }),
];