# 마이고미 프론트엔드 라이브러리 가이드

이 문서는 마이고미 프로젝트에서 사용하는 모든 라이브러리에 대한 상세한 설명과 사용법을 제공합니다.

---

## 목차
1. [핵심 라이브러리](#1-핵심-라이브러리)
2. [캘린더 라이브러리](#2-캘린더-라이브러리)
3. [지도 라이브러리](#3-지도-라이브러리)
4. [WebSocket/채팅 라이브러리](#4-websocket채팅-라이브러리)
5. [개발 도구](#5-개발-도구)
6. [선택 라이브러리](#6-선택-라이브러리)

---

## 1. 핵심 라이브러리

### 1.1 React Router DOM

**설치**
```bash
npm install react-router-dom
```

**용도**
- SPA(Single Page Application)에서 페이지 간 라우팅을 처리합니다.
- URL 기반으로 컴포넌트를 렌더링합니다.

**주요 API**
- `BrowserRouter`: HTML5 History API를 사용하여 라우팅
- `Routes`, `Route`: 경로와 컴포넌트 매핑
- `useNavigate`: 프로그래밍 방식으로 페이지 이동
- `useParams`: URL 파라미터 추출
- `Link`: 클릭 시 페이지 이동 (a 태그 대신 사용)

**사용 예시**
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// 컴포넌트 내에서 사용
import { useNavigate, useParams } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const handleClick = () => {
    navigate('/calendar');
  };
  
  return <button onClick={handleClick}>캘린더로 이동</button>;
}
```

**왜 사용하나요?**
- SPA에서 페이지 전환을 자연스럽게 처리할 수 있습니다.
- 브라우저 뒤로가기/앞으로가기 버튼이 정상 작동합니다.
- URL을 통해 특정 페이지로 직접 접근할 수 있습니다.

---

### 1.2 Axios

**설치**
```bash
npm install axios
```

**용도**
- HTTP 클라이언트로 백엔드 API와 통신합니다.
- Promise 기반으로 비동기 요청을 처리합니다.

**주요 기능**
- 요청/응답 인터셉터
- 자동 JSON 변환
- 요청 취소
- 타임아웃 설정

**사용 예시**
```typescript
// api/auth.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 이동
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  signup: async (email: string, password: string, nickname: string) => {
    const response = await api.post('/auth/signup', { email, password, nickname });
    return response.data;
  },
};
```

**왜 사용하나요?**
- Fetch API보다 기능이 풍부하고 사용하기 쉽습니다.
- 인터셉터로 공통 로직(인증, 에러 처리)을 한 곳에서 관리할 수 있습니다.
- 요청 취소, 타임아웃 등 고급 기능을 쉽게 사용할 수 있습니다.

---

### 1.3 TanStack Query (React Query)

**설치**
```bash
npm install @tanstack/react-query
```

**용도**
- 서버 상태 관리 및 데이터 페칭을 간편하게 처리합니다.
- 캐싱, 자동 리페치, 로딩/에러 상태 관리를 자동화합니다.

**주요 기능**
- 자동 캐싱 및 리페치
- 로딩/에러 상태 자동 관리
- 낙관적 업데이트 (Optimistic Updates)
- 무한 스크롤 지원
- 페이지네이션 지원

**사용 예시**
```typescript
// App.tsx - QueryClient 설정
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
      retry: 1, // 실패 시 재시도 횟수
      staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 유지
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 앱 컴포넌트 */}
    </QueryClientProvider>
  );
}

// 컴포넌트에서 사용
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionApi } from '../api/collection';

function CalendarPage() {
  const [addressId, setAddressId] = useState(1);
  
  // 데이터 조회 (GET)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['calendar', addressId], // 캐시 키
    queryFn: () => collectionApi.getCalendar(addressId, from, to),
    enabled: !!addressId, // addressId가 있을 때만 실행
  });
  
  // 데이터 변경 (POST, PUT, DELETE)
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (newData) => collectionApi.create(newData),
    onSuccess: () => {
      // 성공 시 캐시 무효화하여 자동 리페치
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
  
  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;
  
  return (
    <div>
      {data?.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

**주요 Hook**
- `useQuery`: 데이터 조회 (GET)
- `useMutation`: 데이터 변경 (POST, PUT, DELETE)
- `useQueryClient`: 캐시 제어

**왜 사용하나요?**
- 서버 상태 관리를 위한 보일러플레이트 코드가 크게 줄어듭니다.
- 로딩/에러 상태를 자동으로 관리합니다.
- 캐싱으로 불필요한 API 호출을 방지합니다.
- 백그라운드에서 자동으로 데이터를 최신 상태로 유지합니다.

---

## 2. 캘린더 라이브러리

### 2.1 FullCalendar

**설치**
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid
```

**용도**
- 수거 캘린더를 표시하기 위한 캘린더 UI 라이브러리입니다.
- 월간/주간 뷰를 제공하며, 이벤트를 표시할 수 있습니다.

**주요 기능**
- 월간/주간/일간 뷰
- 이벤트 드래그 앤 드롭
- 날짜 클릭/이벤트 클릭 이벤트
- 커스텀 이벤트 렌더링

**사용 예시**
```typescript
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useQuery } from '@tanstack/react-query';
import { collectionApi } from '../api/collection';

function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: events } = useQuery({
    queryKey: ['calendar', currentMonth],
    queryFn: () => {
      const from = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const to = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      return collectionApi.getCalendar(addressId, from, to);
    },
  });
  
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      }}
      datesSet={(dateInfo) => {
        // 월 변경 시 호출
        setCurrentMonth(dateInfo.start);
      }}
      eventContent={(eventInfo) => {
        // 커스텀 이벤트 렌더링
        const wasteType = eventInfo.event.extendedProps.wasteType;
        return (
          <div className={`event-${wasteType.toLowerCase()}`}>
            {getWasteTypeLabel(wasteType)}
          </div>
        );
      }}
      eventClick={(info) => {
        // 이벤트 클릭 시 처리
        console.log('이벤트 클릭:', info.event);
      }}
    />
  );
}
```

**이벤트 데이터 형식**
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD 또는 ISO 8601
  end?: string; // 선택 사항
  allDay?: boolean; // 종일 이벤트 여부
  extendedProps?: {
    wasteType: string; // 커스텀 속성
  };
}
```

**왜 사용하나요?**
- 캘린더 UI를 직접 구현하는 것보다 훨씬 빠르고 안정적입니다.
- 다양한 뷰(월간/주간/일간)를 쉽게 제공할 수 있습니다.
- 이벤트 드래그 앤 드롭 등 고급 기능을 쉽게 추가할 수 있습니다.

---

## 3. 지도 라이브러리

### 3.1 Leaflet & React Leaflet

**설치**
```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

**용도**
- 지도 표시 및 마커(핀) 렌더링을 위한 오픈소스 지도 라이브러리입니다.
- 나눔 물품의 위치를 지도에 표시합니다.

**주요 기능**
- 지도 표시 및 줌/팬
- 마커(핀) 추가 및 커스터마이징
- 팝업 표시
- 클릭 이벤트 처리

**CSS 파일 import 필요**
```typescript
import 'leaflet/dist/leaflet.css';
```

**사용 예시**
```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { shareApi } from '../api/share';

// Leaflet 기본 아이콘 설정 (한국어 환경에서 깨지는 문제 해결)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapWidget() {
  const [center, setCenter] = useState<[number, number]>([35.6812, 139.7671]); // [위도, 경도]
  const [zoom, setZoom] = useState(13);
  
  const { data: posts } = useQuery({
    queryKey: ['nearby-posts', center],
    queryFn: () => shareApi.getNearbyPosts(center[0], center[1], 5),
  });
  
  // 커스텀 아이콘 생성
  const createCustomIcon = (category: string) => {
    return L.icon({
      iconUrl: `/icons/${category.toLowerCase()}.png`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };
  
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      {/* 타일 레이어 (지도 배경) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* 마커 렌더링 */}
      {posts?.map((post) => (
        <Marker
          key={post.id}
          position={[post.lat, post.lng]}
          icon={createCustomIcon(post.category)}
          eventHandlers={{
            click: () => {
              // 마커 클릭 시 처리
              console.log('마커 클릭:', post.id);
            },
          }}
        >
          <Popup>
            <div>
              <h3>{post.title}</h3>
              {post.thumbnailUrl && (
                <img src={post.thumbnailUrl} alt={post.title} style={{ width: '100px' }} />
              )}
              <p>{post.ward}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

**주요 컴포넌트**
- `MapContainer`: 지도 컨테이너
- `TileLayer`: 지도 타일 레이어 (배경 지도)
- `Marker`: 마커(핀)
- `Popup`: 마커 클릭 시 표시되는 팝업

**왜 사용하나요?**
- Google Maps보다 무료이고 커스터마이징이 쉽습니다.
- 오픈소스이므로 라이선스 문제가 없습니다.
- React와 잘 통합되는 `react-leaflet`이 제공됩니다.

---

## 4. WebSocket/채팅 라이브러리

### 4.1 STOMP.js & SockJS

**설치**
```bash
npm install @stomp/stompjs sockjs-client
```

**용도**
- WebSocket을 통한 실시간 채팅 기능을 구현합니다.
- STOMP 프로토콜을 사용하여 메시지 브로커와 통신합니다.

**주요 기능**
- WebSocket 연결 관리
- 메시지 구독 및 발행
- 자동 재연결
- 하트비트 지원

**사용 예시**
```typescript
// utils/websocket.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

export function connectWebSocket(
  roomId: number,
  onMessage: (message: any) => void
) {
  const socket = new SockJS('http://localhost:8080/ws');
  
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000, // 재연결 지연 시간
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket 연결 성공');
      
      // 채팅방 구독
      stompClient?.subscribe(`/topic/rooms/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        onMessage(data);
      });
    },
    onStompError: (frame) => {
      console.error('STOMP 에러:', frame);
    },
    onWebSocketClose: () => {
      console.log('WebSocket 연결 종료');
    },
  });
  
  stompClient.activate();
}

export function sendMessage(roomId: number, content: string) {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/messages`,
      body: JSON.stringify({ roomId, content }),
    });
  } else {
    console.error('WebSocket이 연결되지 않았습니다');
  }
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}
```

**컴포넌트에서 사용**
```typescript
import { useEffect, useState } from 'react';
import { connectWebSocket, sendMessage, disconnectWebSocket } from '../utils/websocket';

function ChatRoomPage({ roomId }: { roomId: number }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  
  useEffect(() => {
    // WebSocket 연결
    connectWebSocket(roomId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });
    
    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      disconnectWebSocket();
    };
  }, [roomId]);
  
  const handleSend = () => {
    if (message.trim()) {
      sendMessage(roomId, message);
      setMessage('');
    }
  };
  
  return (
    <div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>{msg.content}</div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        }}
      />
      <button onClick={handleSend}>전송</button>
    </div>
  );
}
```

**왜 사용하나요?**
- 실시간 양방향 통신이 필요할 때 WebSocket이 가장 적합합니다.
- STOMP 프로토콜을 사용하면 메시지 브로커와 쉽게 통신할 수 있습니다.
- Spring Boot의 STOMP 지원과 잘 맞습니다.

---

## 5. 개발 도구

### 5.1 ESLint

**설치**
```bash
npm install -D eslint
```

**용도**
- JavaScript/TypeScript 코드의 오류와 문제를 찾아냅니다.
- 코드 스타일을 일관되게 유지합니다.

**설정 파일 예시 (.eslintrc.json)**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

**왜 사용하나요?**
- 코드 품질을 일관되게 유지할 수 있습니다.
- 버그를 미리 발견할 수 있습니다.
- 팀원 간 코딩 스타일을 통일할 수 있습니다.

---

### 5.2 Prettier

**설치**
```bash
npm install -D prettier
```

**용도**
- 코드를 자동으로 포맷팅합니다.
- 들여쓰기, 따옴표, 세미콜론 등을 일관되게 유지합니다.

**설정 파일 예시 (.prettierrc)**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

**VS Code 설정 (.vscode/settings.json)**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

**왜 사용하나요?**
- 코드 포맷팅 논쟁을 피할 수 있습니다.
- 저장 시 자동으로 포맷팅되어 일관된 코드를 유지할 수 있습니다.

---

### 5.3 Husky & lint-staged

**설치**
```bash
npm install -D husky lint-staged
```

**용도**
- Git 커밋 전에 자동으로 코드 검사 및 포맷팅을 실행합니다.
- 잘못된 코드가 저장소에 들어가는 것을 방지합니다.

**설정 방법**

1. **package.json에 스크립트 추가**
```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

2. **Husky 초기화**
```bash
npm run prepare
```

3. **pre-commit 훅 생성**
```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

**왜 사용하나요?**
- 커밋 전에 자동으로 코드를 검사하여 품질을 유지할 수 있습니다.
- 팀원들이 일관된 코드 스타일을 유지할 수 있습니다.
- CI/CD에서 실패하기 전에 로컬에서 문제를 발견할 수 있습니다.

---

## 6. 선택 라이브러리

### 6.1 React Hook Form

**설치**
```bash
npm install react-hook-form
```

**용도**
- 폼 검증 및 관리를 간편하게 처리합니다.
- 성능 최적화가 잘 되어 있습니다.

**사용 예시**
```typescript
import { useForm } from 'react-hook-form';

interface LoginForm {
  email: string;
  password: string;
}

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  
  const onSubmit = (data: LoginForm) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: '이메일을 입력해주세요',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '올바른 이메일 형식이 아닙니다',
          },
        })}
        placeholder="이메일"
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input
        {...register('password', {
          required: '비밀번호를 입력해주세요',
          minLength: {
            value: 8,
            message: '비밀번호는 8자 이상이어야 합니다',
          },
        })}
        type="password"
        placeholder="비밀번호"
      />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">로그인</button>
    </form>
  );
}
```

**왜 사용하나요?**
- 폼 검증 로직을 간단하게 작성할 수 있습니다.
- 불필요한 리렌더링을 방지하여 성능이 좋습니다.
- 에러 메시지를 쉽게 표시할 수 있습니다.

---

### 6.2 MSW (Mock Service Worker)

**설치**
```bash
npm install -D msw
```

**용도**
- 백엔드 API가 준비되기 전에 Mock API를 제공합니다.
- 프론트엔드와 백엔드가 병렬로 개발할 수 있게 합니다.

**설정 방법**

1. **Mock 핸들러 작성**
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/collection/calendar', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          {
            id: '1',
            title: '가연성 쓰레기',
            start: '2026-01-06',
            allDay: true,
            extendedProps: { wasteType: 'BURNABLE' },
          },
        ],
      })
    );
  }),
  
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        data: {
          token: 'mock-token-123',
          user: { id: 1, email: 'test@example.com' },
        },
      })
    );
  }),
];
```

2. **브라우저에서 사용**
```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

3. **개발 환경에서 활성화**
```typescript
// src/index.tsx
if (process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/browser');
  worker.start();
}
```

**왜 사용하나요?**
- 백엔드 API가 준비되기 전에도 프론트엔드 개발을 진행할 수 있습니다.
- 네트워크 없이도 개발할 수 있습니다.
- 백엔드 API 완성 후 MSW만 제거하면 됩니다.

---

## 라이브러리 버전 관리

### package.json 예시
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.14.0",
    "@fullcalendar/react": "^6.1.10",
    "@fullcalendar/daygrid": "^6.1.10",
    "@fullcalendar/timegrid": "^6.1.10",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "@stomp/stompjs": "^7.0.0",
    "sockjs-client": "^1.6.1",
    "react-hook-form": "^7.48.0"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.1.0",
    "msw": "^2.0.0"
  }
}
```

---

## 문제 해결 가이드

### Leaflet 아이콘 깨짐 문제
```typescript
// Leaflet 기본 아이콘 설정
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
```

### React Query 캐시 무효화
```typescript
const queryClient = useQueryClient();

// 특정 쿼리 무효화
queryClient.invalidateQueries({ queryKey: ['calendar'] });

// 모든 쿼리 무효화
queryClient.invalidateQueries();
```

### WebSocket 재연결 문제
```typescript
stompClient = new Client({
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});
```

---

## 참고 자료

- [React Router 공식 문서](https://reactrouter.com/)
- [Axios 공식 문서](https://axios-http.com/)
- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [FullCalendar 공식 문서](https://fullcalendar.io/)
- [Leaflet 공식 문서](https://leafletjs.com/)
- [STOMP.js 공식 문서](https://stomp-js.github.io/stomp-websocket/codo/class/Client.html)
- [React Hook Form 공식 문서](https://react-hook-form.com/)
- [MSW 공식 문서](https://mswjs.io/)

