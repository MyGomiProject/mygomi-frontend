# 마이고미(MAIGOMI) — 프론트엔드 개발 가이드 (주니어 팀용)

## 목표
- React + TypeScript 기반 프론트엔드가 **어떤 순서로**, **무엇을**, **어떤 기술로** 개발해야 하는지 단계별로 정리합니다.
- "지금 당장 개발을 시작할 수 있는 수준"으로 **작업 단위**, **필수 컴포넌트**, **검수 기준**, **구현 팁**까지 포함합니다.
- 주니어 개발자도 이해할 수 있도록 각 단계의 **목적**과 **왜 이렇게 하는지**를 자세히 설명합니다.

---

## 0. 공통 전제 및 MVP 정의

### 0.1 MVP 정의(재정의된 발표용 최소 완성)
**W3 종료 시점(02.15)에 반드시 데모 가능**해야 하는 3가지:
1) **지역 설정 → 수거 캘린더 표시** (REQ-02)
2) **품목 검색 → 버리는 방법 안내** (REQ-03, 04)
3) **지도에 "주변 나눔 물품" 핀 표시** (REQ-10, 단 **조회-only**)

> **핵심 전략**: 지도 기능을 "한 번에 끝내려 하지 않는다."  
> - W2~W3에서는 지도 조회(READ) + 핀 렌더링(초기형)만 만든다.
> - W4~W5에 게시판/채팅과 결합하여 "진짜 커뮤니티 지도"로 확장한다.
> - 게시판 글쓰기/업로드/채팅은 W4~W5에 본격 구현

### 0.2 개발 방식
- **백엔드가 API 계약을 먼저 정의(OpenAPI/Swagger)** → 프론트는 Mock 데이터로 UI 병렬 개발 → 백엔드 완성 후 실연동
- **왜 이렇게 하나요?**: API 스펙을 먼저 정하면 프론트와 백엔드가 병렬로 작업할 수 있어 일정이 단축됩니다.

### 0.3 환경 통일
- Node.js 버전 통일 (예: v18.x)
- 패키지 매니저 통일 (npm 또는 yarn)
- `.env.example` 제공 후 개인별 `.env`로 운영

---

## 1. 6주 타임라인 기반 개발 로드맵 (W1 ~ W6)

> **전체 타임라인**: Deadline 03.10 (6주)  
> 프론트엔드는 **백엔드 API가 준비되기 전**에도 Mock 데이터로 UI를 먼저 개발할 수 있습니다.  
> 각 주차마다: 컴포넌트 설계 → UI 구현 → API 연동 순서로 개발합니다.

| 주차 | 기간 | 프론트엔드 목표 | 핵심 산출물 |
|---|---|---|---|
| W1 | 01.27 ~ 02.01 | 기반 구축 | 로그인/회원가입 UI + 주소 설정 온보딩 |
| W2 | 02.02 ~ 02.08 | 캘린더 UI + 메인 페이지 레이아웃 + 지도 뼈대 | 캘린더 컴포넌트 + 메인 페이지 초안 + 지도 핀 렌더링 |
| W3 | 02.09 ~ 02.15 | 검색 UI + 메인 페이지 통합 | 검색 컴포넌트 + 메인 페이지 완성(데모 가능) |
| W4 | 02.16 ~ 02.22 | 게시판 UI | 게시판 CRUD 화면 + 이미지 업로드 |
| W5 | 02.23 ~ 03.01 | 채팅 UI + 지도 고도화 | 채팅 화면 + 지도 핀 커스텀 렌더링 |
| W6 | 03.02 ~ 03.10 | 폴리싱/발표 | 버그픽스 + UX 개선 |

---

## W1 — 환경 + 인증 + 주소 설정 (01.27 ~ 02.01)

### 목표
- 프로젝트 골격 구축
- 로그인/회원가입 UI 구현
- 주소 설정 온보딩 UI 구현

### 1.1 프로젝트 세팅

#### 필요 기술 스택
- **React 18.x** (최신 버전 사용)
- **TypeScript** (타입 안정성)
- **React Router** (페이지 라우팅)
- **Axios** (API 호출)
- **React Query (TanStack Query)** (권장) - 서버 상태 관리
- **ESLint/Prettier** (코드 품질)
- **Husky + lint-staged** (권장) - 커밋 전 자동 검사

#### 프로젝트 생성

**Create React App 또는 Vite 사용**
```bash
# Vite 권장 (더 빠름)
npm create vite@latest maigomi-frontend -- --template react-ts
cd maigomi-frontend
npm install
```

**필수 패키지 설치**
```bash
npm install react-router-dom axios @tanstack/react-query
npm install -D eslint prettier husky lint-staged
```

#### 폴더 구조 확정

```
src/
├── components/        # 재사용 가능한 컴포넌트
│   ├── common/       # 공통 컴포넌트 (Button, Input 등)
│   └── layout/       # 레이아웃 컴포넌트 (Header, Footer 등)
├── pages/            # 페이지 컴포넌트
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── OnboardingPage.tsx
│   ├── CalendarPage.tsx
│   ├── ItemSearchPage.tsx
│   └── SharePage.tsx
├── api/              # API 호출 함수
│   ├── auth.ts
│   ├── collection.ts
│   ├── items.ts
│   └── share.ts
├── hooks/            # 커스텀 훅
├── utils/            # 유틸리티 함수
├── types/            # TypeScript 타입 정의
└── App.tsx           # 메인 앱 컴포넌트
```

**왜 이렇게 구조를 나누나요?**
- `components/`: 여러 곳에서 사용하는 재사용 가능한 컴포넌트
- `pages/`: 특정 경로에 매핑되는 페이지 컴포넌트
- `api/`: 백엔드 API 호출 로직을 한 곳에 모음
- 이렇게 나누면 코드가 명확해지고 유지보수가 쉬워집니다.

#### 라우팅 구조 설정

**App.tsx**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding/location" element={<OnboardingPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/items/search" element={<ItemSearchPage />} />
          <Route path="/share" element={<SharePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

**왜 React Query를 사용하나요?**
- 서버 상태 관리가 쉬워집니다 (캐싱, 자동 리페치 등)
- 로딩/에러 상태를 쉽게 처리할 수 있습니다.

#### API 모듈 분리

**api/auth.ts**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
});

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

**왜 API 모듈을 분리하나요?**
- API 호출 로직을 한 곳에 모아서 관리하기 쉽습니다.
- 나중에 API가 변경되어도 한 곳만 수정하면 됩니다.

### 1.2 로그인/회원가입 UI 구현

#### 로그인 페이지

**LoginPage.tsx**
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data) => {
      // JWT 토큰 저장
      localStorage.setItem('token', data.data.token);
      // 메인 페이지로 이동
      navigate('/');
    },
    onError: (error) => {
      alert('로그인 실패: ' + error.message);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };
  
  return (
    <div className="login-page">
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <a href="/signup">회원가입</a>
    </div>
  );
}
```

**구현 포인트**
- React Hook Form을 사용하면 폼 검증이 더 쉬워집니다 (선택)
- 에러 처리는 사용자 친화적으로 표시합니다.
- 로딩 상태를 표시하여 UX를 개선합니다.

#### 회원가입 페이지

**SignupPage.tsx**
```typescript
// 로그인 페이지와 유사한 구조
// 이메일, 비밀번호, 닉네임 입력
// 회원가입 성공 시 로그인 페이지로 이동
```

### 1.3 주소 설정 온보딩 UI 구현

#### 온보딩 페이지

**OnboardingPage.tsx**
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { addressApi } from '../api/address';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prefecture: '',
    ward: '',
    town: '',
    chome: '',
    banchiText: '',
    isPrimary: true,
  });
  
  const createAddressMutation = useMutation({
    mutationFn: () => addressApi.createAddress(formData),
    onSuccess: () => {
      navigate('/calendar');
    },
  });
  
  // 주소 입력 폼 렌더링
  return (
    <div className="onboarding-page">
      <h1>주소를 설정해주세요</h1>
      <form onSubmit={(e) => { e.preventDefault(); createAddressMutation.mutate(); }}>
        <select
          value={formData.prefecture}
          onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
        >
          <option value="">도/현 선택</option>
          <option value="東京都">東京都</option>
        </select>
        
        <select
          value={formData.ward}
          onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
        >
          <option value="">구 선택</option>
          <option value="大田区">大田区</option>
        </select>
        
        {/* town, chome, banchiText 입력 필드 */}
        
        <button type="submit">다음</button>
      </form>
    </div>
  );
}
```

**구현 포인트**
- 엑셀 기준 단위로 선택할 수 있도록 드롭다운을 제공합니다.
- 주소 검증 로직을 추가합니다 (선택).

### 1.4 완료 기준

**검수 기준**
- [ ] 라우팅 이동 정상 (로그인 → 회원가입 → 온보딩)
- [ ] 더미 화면 4~5개 렌더링
- [ ] Mock 데이터로 컴포넌트 렌더링 가능
- [ ] 가입→로그인→주소 등록→대표 지정까지 UX 흐름 완성

---

## W2 — 캘린더 UI + 메인 페이지 레이아웃 + 지도 뼈대 (02.02 ~ 02.08)

### 목표
- FullCalendar 연동
- 메인 페이지 레이아웃 초안 생성
- 지도 SDK 연동 + 핀 렌더링(초기형)

### 2.1 FullCalendar 연동

#### FullCalendar 설치

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid
```

#### 캘린더 컴포넌트 구현

**CalendarPage.tsx**
```typescript
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useQuery } from '@tanstack/react-query';
import { collectionApi } from '../api/collection';

export default function CalendarPage() {
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 캘린더 이벤트 조회
  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar', selectedAddressId, currentMonth],
    queryFn: () => {
      if (!selectedAddressId) return [];
      const from = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const to = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      return collectionApi.getCalendar(selectedAddressId, from, to);
    },
    enabled: !!selectedAddressId,
  });
  
  // wasteType 필터
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  
  const filteredEvents = events?.filter(event => {
    if (selectedWasteTypes.length === 0) return true;
    return selectedWasteTypes.includes(event.extendedProps.wasteType);
  });
  
  return (
    <div className="calendar-page">
      <h1>수거 캘린더</h1>
      
      {/* wasteType 필터 */}
      <div className="waste-type-filter">
        <label>
          <input
            type="checkbox"
            checked={selectedWasteTypes.includes('BURNABLE')}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedWasteTypes([...selectedWasteTypes, 'BURNABLE']);
              } else {
                setSelectedWasteTypes(selectedWasteTypes.filter(t => t !== 'BURNABLE'));
              }
            }}
          />
          가연성
        </label>
        {/* 다른 wasteType 체크박스들 */}
      </div>
      
      {/* FullCalendar */}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        datesSet={(dateInfo) => {
          setCurrentMonth(dateInfo.start);
        }}
        eventContent={(eventInfo) => {
          // wasteType별 아이콘/색상 표시
          const wasteType = eventInfo.event.extendedProps.wasteType;
          return (
            <div className={`event-${wasteType.toLowerCase()}`}>
              {getWasteTypeLabel(wasteType)}
            </div>
          );
        }}
      />
    </div>
  );
}
```

**구현 포인트**
- 월 전환 시 `datesSet` 콜백에서 API를 다시 호출합니다.
- wasteType 필터는 클라이언트에서 처리합니다 (백엔드에서 필터링해도 OK).
- wasteType별 아이콘/색상을 매핑합니다.

**wasteType 매핑 함수**
```typescript
const getWasteTypeLabel = (wasteType: string): string => {
  const labels: Record<string, string> = {
    BURNABLE: '가연성',
    NON_BURNABLE: '불연성',
    PLASTIC: '플라스틱',
    CAN_BOTTLE: '병/캔',
    PAPER: '종이',
  };
  return labels[wasteType] || wasteType;
};
```

### 2.2 메인 페이지 레이아웃 초안 생성

#### 메인 페이지 구조

**MainPage.tsx**
```typescript
import { useState } from 'react';
import CalendarWidget from '../components/CalendarWidget';
import MapWidget from '../components/MapWidget';
import SearchBox from '../components/SearchBox';

export default function MainPage() {
  return (
    <div className="main-page">
      {/* 상단: 검색 박스 (W3에서 완성) */}
      <div className="search-section">
        <SearchBox />
      </div>
      
      {/* 하단: 좌우 분할 */}
      <div className="bottom-section">
        {/* 좌하단: 캘린더 */}
        <div className="calendar-widget">
          <CalendarWidget />
        </div>
        
        {/* 우하단: 지도 */}
        <div className="map-widget">
          <MapWidget />
        </div>
      </div>
    </div>
  );
}
```

**CSS (간단한 예시)**
```css
.main-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.search-section {
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.bottom-section {
  display: flex;
  flex: 1;
  gap: 20px;
  padding: 20px;
}

.calendar-widget {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.map-widget {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .bottom-section {
    flex-direction: column;
  }
}
```

**구현 포인트**
- 모바일 우선(Responsive) 디자인을 적용합니다.
- W3에서 검색 기능을 완성할 예정이므로, 지금은 UI만 만들어둡니다.

### 2.3 지도 SDK 연동 + 핀 렌더링(초기형)

#### 지도 라이브러리 선택

**옵션 1: Leaflet (권장)**
- 장점: 무료, 오픈소스, 커스터마이징 쉬움
- 단점: 기본 스타일이 단순함

**옵션 2: Google Maps**
- 장점: 스타일이 예쁨, 많은 기능
- 단점: API 키 필요, 사용량 제한 있음

**권장**: 초기에는 Leaflet으로 시작, 나중에 필요하면 Google Maps로 전환

#### Leaflet 설치 및 설정

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

**MapWidget.tsx**
```typescript
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { shareApi } from '../api/share';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet 기본 아이콘 설정 (한국어 환경에서 깨지는 문제 해결)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapWidget() {
  const [center, setCenter] = useState<[number, number]>([35.6812, 139.7671]); // 도쿄 중심
  const [zoom, setZoom] = useState(13);
  
  // 주변 나눔 물품 조회 (더미 데이터 가능)
  const { data: posts, isLoading } = useQuery({
    queryKey: ['nearby-posts', center],
    queryFn: () => shareApi.getNearbyPosts(center[0], center[1], 5),
  });
  
  return (
    <div className="map-widget">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* 핀 렌더링 (초기형) */}
        {posts?.map((post) => (
          <Marker
            key={post.id}
            position={[post.lat, post.lng]}
            icon={createCustomIcon(post.category)} // 커스텀 아이콘 (W5에서 고도화)
          >
            <Popup>
              <div className="popup-content">
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
    </div>
  );
}

// 커스텀 아이콘 생성 (초기형)
function createCustomIcon(category: string) {
  return L.icon({
    iconUrl: `/icons/${category.toLowerCase()}.png`, // 카테고리별 아이콘
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}
```

**구현 포인트**
- 더미 데이터로라도 핀이 최소 1개 이상 표시되어야 합니다.
- W5에서 아이콘/카테고리별 마커로 고도화할 예정입니다.
- 핀 클릭 시 미리보기 카드를 표시합니다 (W3에서 완성).

### 2.4 완료 기준

**검수 기준**
- [ ] 대표 주소 변경 시 캘린더 재요청/재렌더링
- [ ] 월 전환 시 from/to가 바뀌며 API 호출
- [ ] 메인 페이지에 "지도 박스"가 떠 있고 핀이 최소 1개 이상 표시됨(더미 가능)
- [ ] wasteType 필터 정상 작동

---

## W3 — 검색 UI + 메인 페이지 통합 (02.09 ~ 02.15)

### 목표
- 검색 UI 구현 (debounce 포함)
- 메인 페이지 통합 (검색 + 캘린더 + 지도 핀 클릭 → 미리보기 카드)

### 3.1 검색 UI 구현

#### 검색 컴포넌트

**SearchBox.tsx**
```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { useDebounce } from '../hooks/useDebounce';

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300); // 300ms debounce
  
  // 검색 API 호출
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['items-search', debouncedQuery],
    queryFn: () => {
      if (!debouncedQuery) return [];
      // 사용자 대표 주소의 '구' 정보 가져오기
      const ward = getUserWard(); // 로컬 스토리지 또는 Context에서 가져오기
      return itemsApi.searchItems(debouncedQuery, ward);
    },
    enabled: debouncedQuery.length > 0,
  });
  
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="품목을 검색하세요 (예: 냉장고, 책상)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {/* 검색 결과 표시 */}
      {isLoading && <div>검색 중...</div>}
      
      {searchResults && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((item) => (
            <div
              key={item.id}
              className="search-result-item"
              onClick={() => navigateToItemDetail(item.id)}
            >
              <div className="item-icon">{getWasteTypeIcon(item.wasteType)}</div>
              <div className="item-info">
                <h4>{item.nameKo}</h4>
                <p className="item-summary">{item.description.substring(0, 50)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {searchResults && searchResults.length === 0 && debouncedQuery && (
        <div className="empty-state">검색 결과가 없습니다</div>
      )}
    </div>
  );
}
```

**useDebounce 훅**
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
```

**왜 debounce를 사용하나요?**
- 사용자가 타이핑할 때마다 API를 호출하면 서버 부하가 증가합니다.
- 300ms 대기 후 호출하면 자연스러운 검색 경험을 제공할 수 있습니다.

#### 품목 상세 화면

**ItemDetailPage.tsx**
```typescript
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsApi.getItemDetail(Number(id)),
  });
  
  if (isLoading) return <div>로딩 중...</div>;
  if (!item) return <div>품목을 찾을 수 없습니다</div>;
  
  return (
    <div className="item-detail-page">
      <h1>{item.nameKo}</h1>
      <div className="waste-type-badge">{getWasteTypeLabel(item.wasteType)}</div>
      
      <section className="disposal-method">
        <h2>배출 방법</h2>
        <p>{item.description}</p>
      </section>
      
      {item.wardSpecificNote && (
        <section className="ward-specific-note">
          <h2>{item.ward} 특이사항</h2>
          <p>{item.wardSpecificNote}</p>
        </section>
      )}
      
      <section className="caution">
        <h2>주의사항</h2>
        <p>{item.caution}</p>
      </section>
    </div>
  );
}
```

### 3.2 메인 페이지 통합

#### 메인 페이지 완성

**MainPage.tsx (업데이트)**
```typescript
import { useState } from 'react';
import CalendarWidget from '../components/CalendarWidget';
import MapWidget from '../components/MapWidget';
import SearchBox from '../components/SearchBox';
import ItemDetailModal from '../components/ItemDetailModal';

export default function MainPage() {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  return (
    <div className="main-page">
      {/* 상단: 검색 박스 */}
      <div className="search-section">
        <SearchBox onItemSelect={setSelectedItemId} />
      </div>
      
      {/* 하단: 좌우 분할 */}
      <div className="bottom-section">
        {/* 좌하단: 캘린더 */}
        <div className="calendar-widget">
          <CalendarWidget />
        </div>
        
        {/* 우하단: 지도 */}
        <div className="map-widget">
          <MapWidget onPinClick={(postId) => {
            // 지도 핀 클릭 시 미리보기 카드 표시 (W4에서 상세 페이지로 연결)
            showPostPreview(postId);
          }} />
        </div>
      </div>
      
      {/* 품목 상세 모달 */}
      {selectedItemId && (
        <ItemDetailModal
          itemId={selectedItemId}
          onClose={() => setSelectedItemId(null)}
        />
      )}
    </div>
  );
}
```

#### 지도 핀 클릭 → 미리보기 카드

**MapWidget.tsx (업데이트)**
```typescript
// 핀 클릭 시 미리보기 카드 표시
<Marker
  key={post.id}
  position={[post.lat, post.lng]}
  eventHandlers={{
    click: () => {
      onPinClick?.(post.id);
    },
  }}
>
  <Popup>
    <div className="popup-preview-card">
      <h3>{post.title}</h3>
      {post.thumbnailUrl && (
        <img src={post.thumbnailUrl} alt={post.title} style={{ width: '150px' }} />
      )}
      <p>{post.ward}</p>
      <button onClick={() => navigateToPostDetail(post.id)}>상세 보기</button>
    </div>
  </Popup>
</Marker>
```

### 3.3 완료 기준

**검수 기준(중요)**
- [ ] 입력 즉시 "너무 잦은 호출" 없이 자연스러운 검색 경험
- [ ] 결과 클릭 시 상세로 이동
- [ ] **발표 데모로 "메인 페이지에서 검색 + 캘린더 + 지도 핀" 흐름이 된다.**
- [ ] 아직 게시판 글쓰기 없어도 OK (지도 핀은 더미/seed 기반이어도 OK)

---

## W4 — 게시판 UI (02.16 ~ 02.22)

### 목표
- 게시판 CRUD 화면 구현
- 이미지 업로드 UI 구현

### 4.1 게시판 리스트 화면

#### 게시글 리스트 컴포넌트

**SharePostListPage.tsx**
```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shareApi } from '../api/share';

export default function SharePostListPage() {
  const [filters, setFilters] = useState({
    ward: getUserWard(), // 사용자 대표 주소의 구
    status: 'OPEN' as 'OPEN' | 'RESERVED' | 'COMPLETED',
    page: 0,
  });
  
  const { data, isLoading } = useQuery({
    queryKey: ['share-posts', filters],
    queryFn: () => shareApi.getPosts(filters),
  });
  
  return (
    <div className="share-post-list-page">
      <h1>나눔 게시판</h1>
      
      {/* 필터 */}
      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
        >
          <option value="OPEN">나눔 가능</option>
          <option value="RESERVED">예약됨</option>
          <option value="COMPLETED">완료</option>
        </select>
      </div>
      
      {/* 게시글 리스트 */}
      <div className="post-list">
        {data?.data.map((post) => (
          <div key={post.id} className="post-card" onClick={() => navigateToDetail(post.id)}>
            {post.thumbnailUrl && (
              <img src={post.thumbnailUrl} alt={post.title} />
            )}
            <h3>{post.title}</h3>
            <p className="post-location">{post.ward}</p>
            <span className={`status-badge status-${post.status.toLowerCase()}`}>
              {getStatusLabel(post.status)}
            </span>
          </div>
        ))}
      </div>
      
      {/* 페이지네이션 */}
      <div className="pagination">
        <button
          disabled={filters.page === 0}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          이전
        </button>
        <span>페이지 {filters.page + 1}</span>
        <button
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          다음
        </button>
      </div>
    </div>
  );
}
```

### 4.2 게시글 작성 화면

#### 글쓰기 컴포넌트

**SharePostCreatePage.tsx**
```typescript
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { shareApi } from '../api/share';
import { useNavigate } from 'react-router-dom';

export default function SharePostCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'FURNITURE' as 'FURNITURE' | 'ELECTRONICS' | 'ETC',
    lat: 35.6812,
    lng: 139.7671,
  });
  const [images, setImages] = useState<File[]>([]);
  
  const createMutation = useMutation({
    mutationFn: () => shareApi.createPost(formData, images),
    onSuccess: () => {
      navigate('/share');
    },
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };
  
  return (
    <div className="share-post-create-page">
      <h1>나눔 글쓰기</h1>
      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}>
        <input
          type="text"
          placeholder="제목"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        
        <textarea
          placeholder="내용"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />
        
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
        >
          <option value="FURNITURE">가구</option>
          <option value="ELECTRONICS">전자제품</option>
          <option value="ETC">기타</option>
        </select>
        
        {/* 이미지 업로드 */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />
        
        {/* 이미지 프리뷰 */}
        <div className="image-preview">
          {images.map((file, index) => (
            <img
              key={index}
              src={URL.createObjectURL(file)}
              alt={`Preview ${index}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
          ))}
        </div>
        
        {/* 지도에서 위치 선택 (선택 사항) */}
        <div className="location-selector">
          <p>위치: {formData.lat}, {formData.lng}</p>
          <button type="button" onClick={() => {
            // 지도 모달 열기
            openMapModal();
          }}>
            지도에서 위치 선택
          </button>
        </div>
        
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? '등록 중...' : '등록'}
        </button>
      </form>
    </div>
  );
}
```

**구현 포인트**
- 모바일에서 사진 업로드 UX를 최적화합니다 (드래그 앤 드롭, 여러 장 선택 등).
- 이미지 프리뷰를 제공하여 사용자 경험을 개선합니다.

### 4.3 게시글 상세 화면

#### 상세 페이지

**SharePostDetailPage.tsx**
```typescript
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shareApi } from '../api/share';

export default function SharePostDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['share-post', id],
    queryFn: () => shareApi.getPostDetail(Number(id)),
  });
  
  if (isLoading) return <div>로딩 중...</div>;
  if (!post) return <div>게시글을 찾을 수 없습니다</div>;
  
  return (
    <div className="share-post-detail-page">
      <h1>{post.title}</h1>
      
      {/* 이미지 갤러리 */}
      <div className="image-gallery">
        {post.images.map((image, index) => (
          <img key={index} src={image.imageUrl} alt={`${post.title} ${index + 1}`} />
        ))}
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      <div className="post-info">
        <p>위치: {post.ward}</p>
        <p>상태: {getStatusLabel(post.status)}</p>
      </div>
      
      {/* 연락 버튼 (채팅 준비) */}
      <button onClick={() => {
        // W5에서 채팅 방 생성/이동
        navigateToChat(post.id);
      }}>
        연락하기
      </button>
    </div>
  );
}
```

### 4.4 완료 기준

**검수 기준**
- [ ] 모바일에서 글쓰기 UX 불편함 최소화(사진/입력)
- [ ] 게시글 작성 → 목록 노출 OK
- [ ] 이미지 업로드 및 프리뷰 정상 작동
- [ ] 지역 필터 정상 작동

---

## W5 — 채팅 UI + 지도 고도화 (02.23 ~ 03.01)

### 목표
- 채팅 UI 구현 (WebSocket 클라이언트)
- 지도 핀 커스텀 렌더링 고도화

### 5.1 채팅 UI 구현

#### WebSocket 클라이언트 설정

**websocket.ts**
```typescript
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
    onConnect: () => {
      stompClient?.subscribe(`/topic/rooms/${roomId}`, (message) => {
        onMessage(JSON.parse(message.body));
      });
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
  }
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
  }
}
```

#### 채팅방 목록 화면

**ChatRoomListPage.tsx**
```typescript
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../api/chat';

export default function ChatRoomListPage() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms(),
  });
  
  return (
    <div className="chat-room-list-page">
      <h1>채팅방</h1>
      {rooms?.map((room) => (
        <div
          key={room.id}
          className="chat-room-item"
          onClick={() => navigateToChatRoom(room.id)}
        >
          <h3>{room.postTitle}</h3>
          <p>{room.lastMessage}</p>
          <span className="last-message-time">
            {formatTime(room.lastMessageAt)}
          </span>
          {room.unreadCount > 0 && (
            <span className="unread-badge">{room.unreadCount}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

#### 채팅방 화면

**ChatRoomPage.tsx**
```typescript
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import { connectWebSocket, sendMessage, disconnectWebSocket } from '../utils/websocket';

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 메시지 히스토리 조회
  const { data: messages, refetch } = useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: () => chatApi.getMessages(Number(roomId)),
  });
  
  // WebSocket 연결
  useEffect(() => {
    if (roomId) {
      connectWebSocket(Number(roomId), (newMessage) => {
        // 새 메시지 수신 시 리스트 업데이트
        refetch();
      });
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [roomId]);
  
  // 스크롤 하단 고정
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = () => {
    if (message.trim()) {
      sendMessage(Number(roomId), message);
      setMessage('');
    }
  };
  
  return (
    <div className="chat-room-page">
      <div className="messages-container">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
          >
            <p>{msg.content}</p>
            <span className="message-time">{formatTime(msg.createdAt)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          placeholder="메시지를 입력하세요"
        />
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  );
}
```

**구현 포인트**
- 스크롤 하단 고정: 새 메시지가 올 때마다 자동으로 스크롤됩니다.
- 메시지 지연/중복 없이 대화 가능해야 합니다.

### 5.2 지도 핀 커스텀 렌더링 고도화

#### 카테고리별 마커 아이콘

**MapWidget.tsx (업데이트)**
```typescript
// 카테고리별 아이콘 매핑
const categoryIcons: Record<string, string> = {
  FURNITURE: '/icons/furniture.png',
  ELECTRONICS: '/icons/electronics.png',
  ETC: '/icons/etc.png',
};

function createCustomIcon(category: string, status: string) {
  // 상태에 따라 아이콘 색상 변경
  const iconColor = status === 'OPEN' ? 'green' : status === 'RESERVED' ? 'yellow' : 'gray';
  
  return L.icon({
    iconUrl: categoryIcons[category] || '/icons/default.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    className: `marker-${iconColor}`, // CSS로 색상 변경
  });
}
```

#### 핀 클릭 → 상세/채팅 진입

**MapWidget.tsx (업데이트)**
```typescript
<Marker
  key={post.id}
  position={[post.lat, post.lng]}
  icon={createCustomIcon(post.category, post.status)}
  eventHandlers={{
    click: () => {
      // 상세 페이지로 이동 또는 모달 표시
      navigateToPostDetail(post.id);
    },
  }}
>
  <Popup>
    <div className="popup-preview-card">
      <h3>{post.title}</h3>
      {post.thumbnailUrl && (
        <img src={post.thumbnailUrl} alt={post.title} />
      )}
      <p>{post.ward}</p>
      <div className="popup-actions">
        <button onClick={() => navigateToPostDetail(post.id)}>상세 보기</button>
        <button onClick={() => navigateToChat(post.id)}>채팅하기</button>
      </div>
    </div>
  </Popup>
</Marker>
```

### 5.3 완료 기준

**검수 기준**
- [ ] 메시지 지연/중복 없이 대화 가능
- [ ] 지도에서 실제 게시글이 핀으로 보이고, 상세로 들어가 채팅까지 이어짐
- [ ] 카테고리별 마커 아이콘 정상 표시

---

## W6 — 폴리싱/발표 (03.02 ~ 03.10)

### 목표
- 개발 중단 (기능 추가 금지)
- 버그 픽스
- UX 개선

### 6.1 버그 픽스

#### 체크리스트
- [ ] 메모리 누수 확인 (useEffect cleanup)
- [ ] 무한 리렌더링 문제 해결
- [ ] 에러 바운더리 추가
- [ ] 로딩 상태 일관성 확인

### 6.2 UX 개선

#### 포인트
- 로딩 스피너 일관성
- 에러 메시지 사용자 친화적으로 개선
- 모바일 반응형 최종 점검

---

## 2. 프론트/백이 "같이" 맞춰야 하는 계약

### 2.1 WasteType 코드 표준

**프론트엔드 매핑**
```typescript
const WASTE_TYPE_LABELS: Record<string, { ko: string; ja: string; icon: string }> = {
  BURNABLE: { ko: '가연성', ja: '可燃', icon: '🔥' },
  NON_BURNABLE: { ko: '불연성', ja: '不燃', icon: '🚫' },
  PLASTIC: { ko: '플라스틱', ja: 'プラスチック', icon: '♻️' },
  CAN_BOTTLE: { ko: '병/캔', ja: 'びん・缶', icon: '🥤' },
  PAPER: { ko: '종이', ja: '紙', icon: '📄' },
};
```

**왜 이렇게 하나요?**: 백엔드에서 변경하면 프론트도 자동으로 반영됩니다.

### 2.2 캘린더 이벤트 응답 포맷

**FullCalendar 형식으로 받기**
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  allDay: boolean;
  extendedProps: {
    wasteType: string;
  };
}
```

**왜 이 형식을 사용하나요?**: FullCalendar에 바로 사용할 수 있어 작업량이 줄어듭니다.

### 2.3 에러 코드 규약

**에러 처리**
```typescript
try {
  await api.call();
} catch (error) {
  if (error.response?.data?.errorCode === 'AUTH_001') {
    // 토큰 만료 → 로그인 페이지로 리다이렉트
    navigate('/login');
  } else if (error.response?.data?.errorCode === 'AREA_404') {
    // 지역 매칭 실패 → 주소 설정 페이지로 이동
    navigate('/onboarding/location');
  }
}
```

---

## 3. 병렬 개발 전략

### 3.1 Mock API 사용 (MSW)

**MSW 설정**
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/collection/calendar', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          { id: '1', title: '가연성', start: '2026-01-06', allDay: true, extendedProps: { wasteType: 'BURNABLE' } }
        ]
      })
    );
  }),
];
```

**왜 Mock API를 사용하나요?**
- 백엔드 API가 준비되기 전에도 UI를 개발할 수 있습니다.
- 백엔드 API 완성 후 MSW만 제거하면 됩니다.

---

## 부록: 각 주차별 프론트엔드 체크리스트

### W1 체크리스트
- [ ] 로그인/회원가입 UI
- [ ] 주소 설정 온보딩 UI(엑셀 기준 단위로 선택)

### W2 체크리스트
- [ ] FullCalendar 연동 + wasteType 필터
- [ ] 메인 페이지 레이아웃 초안 생성 (검색 박스 + 캘린더 + 지도)
- [ ] 지도 SDK 연동 + 핀 렌더링(초기형)

### W3 체크리스트
- [ ] 검색 UI + debounce + 상세 안내
- [ ] 메인 페이지 통합 (검색 + 캘린더 + 지도 핀 클릭 → 미리보기 카드)

### W4 체크리스트
- [ ] 글쓰기(사진 업로드) + 리스트/상세
- [ ] 공통 레이아웃/에러/로딩 정리

### W5 체크리스트
- [ ] 채팅 UI(방/메시지)
- [ ] 지도 핀 커스텀 렌더링 고도화 (아이콘/카테고리별 마커)

### W6 체크리스트
- [ ] 통합 테스트/버그 픽스
- [ ] UX 개선

---

## 리스크 관리: "지도 앞당기기"에 따른 안전장치

### W2~W3 지도는 조회-only로 제한
- 글쓰기/이미지/채팅과 엮지 않는다(일정 폭발 방지)
- 지도는 "서비스 형태"를 보여주기 위한 **데모 장치**로 먼저 완성
- **왜 이렇게 하나요?**: W3 종료 시점에 메인 페이지 데모가 필요합니다.  
  지도에 글쓰기/이미지 업로드까지 붙이면 W3 내에 완성하기 어렵습니다.  
  따라서 먼저 "조회 + 핀 표시"만 완성하고, W4~W5에 게시판 기능을 붙입니다.

### W4 이후에 게시판 데이터로 교체
- W2~W3에 만든 지도 UI/핀 렌더링을 그대로 쓰고,
- 데이터 소스만 더미 → 실제 게시글로 바꾼다
- **왜 이렇게 하나요?**: 지도 기능을 한 번에 완성하려 하면 게시판/이미지/채팅과 엮여서 일정이 폭발합니다.  
  먼저 "서비스 형태"를 보여주기 위해 조회 기능만 만들고, 나중에 데이터만 교체하는 방식이 안전합니다.

