# React Native 라이브러리 및 설정 가이드

Web 프로젝트(mygomi-frontend)에서 쓰는 라이브러리와 **React Native에서 같은 역할을 할 때 쓸 라이브러리**를 매핑한 문서입니다. 필요한 라이브러리와 설정을 그대로 맞추고, 디자인도 웬만하면 비슷하게 가져가기 위한 기준입니다.

---

## 1. Web 프로젝트 현재 의존성 요약

| 용도 | 패키지 (Web) |
|------|------------------|
| HTTP | axios |
| 상태/서버 상태 | @tanstack/react-query |
| 라우팅 | react-router-dom |
| 폼 | react-hook-form |
| 캘린더 | @fullcalendar/react, daygrid, timegrid |
| 지도 | leaflet, react-leaflet |
| 실시간 채팅 | @stomp/stompjs, sockjs-client |
| UI 선택 | react-select |
| 테스트 | @testing-library/react, jest, msw |
| 기타 | TypeScript, web-vitals |

---

## 2. React Native 권장 라이브러리 매핑

### 2.1 반드시 맞추면 좋은 것 (동일/유사 유지)

| 용도 | Web | React Native | 비고 |
|------|-----|--------------|------|
| HTTP | axios | **axios** | 그대로 사용. baseURL만 env로 분리 |
| 서버 상태·캐시 | @tanstack/react-query | **@tanstack/react-query** | 동일. QueryClientProvider로 감싸기 |
| 폼 | react-hook-form | **react-hook-form** | 동일. Controller로 TextInput 등 연결 |
| 타입 | TypeScript | TypeScript | 동일 |

### 2.2 라우팅 (Web → RN)

| Web | React Native |
|-----|--------------|
| react-router-dom | **@react-navigation/native** + **@react-navigation/native-stack** (및 **@react-navigation/bottom-tabs**) |

- 스택: `createNativeStackNavigator`로 Screen 구성 (Web의 Route와 1:1 매핑).
- 탭: 홈 / 나눔 / 마이페이지 등은 `createBottomTabNavigator`로 구성하면 Web의 “상단 네비”와 비슷한 체감 가능.

```bash
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

### 2.3 지도 (Web → RN)

| Web | React Native |
|-----|--------------|
| leaflet, react-leaflet | **react-native-maps** |

- Web의 “근처 나눔 글 지도”와 동일한 개념으로 마커·영역 표시.
- iOS: Apple Maps / Android: Google Maps 사용 가능.

```bash
npx expo install react-native-maps
```

### 2.4 캘린더 (수거일 등)

| Web | React Native |
|-----|--------------|
| @fullcalendar/react | **react-native-calendars** 또는 **react-native-big-calendar** |

- “월별 수거일 표시” 수준이면 `react-native-calendars`로 비슷한 UI 구성 가능.

```bash
npm install react-native-calendars
```

### 2.5 실시간 채팅 (WebSocket/STOMP)

| Web | React Native |
|-----|--------------|
| @stomp/stompjs, sockjs-client | **@stomp/stompjs** + **sockjs-client** (또는 **react-native**용 WebSocket 폴리필) |

- STOMP 프로토콜은 그대로 사용. RN 환경에서 `sockjs-client`가 동작하는지 확인 필요. 안 되면 네이티브 WebSocket으로 STOMP만 붙이는 방식 고려.

### 2.6 로컬 저장소 (토큰, 키워드 알림 등)

| Web | React Native |
|-----|--------------|
| localStorage | **@react-native-async-storage/async-storage** |

- `api/client.ts`: 토큰 저장/조회를 AsyncStorage로 교체.
- `contexts/AuthContext.tsx`: `localStorage` → AsyncStorage.
- `utils/keywordAlert.ts`: 키워드·미확인 알림 저장을 AsyncStorage로, 이벤트는 `EventEmitter` 또는 Context로 전달.

```bash
npx expo install @react-native-async-storage/async-storage
```

### 2.7 UI 선택 (드롭다운/셀렉트)

| Web | React Native |
|-----|--------------|
| react-select | **react-native-picker-select** 또는 **@react-native-picker/picker** + 커스텀 스타일 |

- “카테고리 선택”, “구 선택” 등 Web의 Select와 비슷한 UX를 위해 위 중 하나 사용 후 디자인 토큰(색상·폰트)만 맞추면 됨.

### 2.8 기타 유틸

| 용도 | Web | React Native |
|------|-----|--------------|
| 이미지 | \<img\>, background-image | **expo-image** 또는 **react-native FastImage** |
| 아이콘 | 이모지 / SVG | **@expo/vector-icons** 또는 **react-native-vector-icons** |
| 안전 영역 | (CSS env) | **react-native-safe-area-context** (네비게이션과 함께 설치) |

---

## 3. RN 프로젝트 package.json 예시 (핵심만)

```json
{
  "dependencies": {
    "@react-navigation/native": "^7.x",
    "@react-navigation/native-stack": "^7.x",
    "@react-navigation/bottom-tabs": "^7.x",
    "@tanstack/react-query": "^5.x",
    "@react-native-async-storage/async-storage": "^2.x",
    "axios": "^1.x",
    "react-hook-form": "^7.x",
    "react-native-maps": "1.x",
    "react-native-screens": "~4.x",
    "react-native-safe-area-context": "4.x",
    "react-native-calendars": "^1.x",
    "@stomp/stompjs": "^7.x",
    "sockjs-client": "^1.x",
    "expo": "~52.x",
    "expo-image": "~1.x",
    "react": "18.x",
    "react-native": "0.76.x"
  }
}
```

- Expo 사용 시: `npx create-expo-app mygomi-mobile --template tabs` 후 위 패키지 추가.
- 디자인을 비슷하게 하려면 **색상·폰트·간격**은 `md/react-native/03-design-tokens-and-styles.md`의 theme을 사용하면 됩니다.

---

## 4. API 클라이언트 설정 (RN용)

- Web: `setupProxy.js`로 `/api` → 백엔드 서버.
- RN: 프록시가 없으므로 **baseURL을 환경별로 설정**.

예시 (`src/api/client.ts` RN 버전):

```ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';  // 실제 배포 시 .env

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'authToken';

export async function setAuthToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

// 앱 시작 시: AsyncStorage에서 토큰 읽어서 헤더 설정
AsyncStorage.getItem(TOKEN_KEY).then((existing) => {
  if (existing) apiClient.defaults.headers.common['Authorization'] = `Bearer ${existing}`;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      delete apiClient.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

- `api/auth.ts`, `api/sharePost.ts` 등은 **그대로 두고** import만 `./client`에서 가져오면 됩니다.

---

## 5. AuthContext 저장소만 교체

- Web: `localStorage.getItem('authToken')`, `localStorage.setItem`, `removeItem`.
- RN: 위 `client`에서처럼 AsyncStorage 사용하고, AuthContext 내부에서 `token` 초기값만 **비동기**로 가져오기.

예: 초기화 시 `AsyncStorage.getItem('authToken')` 한 번 호출 후 `setToken`으로 넣고, 나머지 로직(login, logout, getMe)은 Web과 동일하게 유지.

---

## 6. 키워드 알림 유틸 (RN)

- Web: `localStorage` + `window.dispatchEvent(new CustomEvent('keyword-alert-updated'))`.
- RN: `AsyncStorage` + 이벤트 전달용 **작은 Context** 또는 **EventEmitter**.
  - 예: `KeywordAlertStorageContext`에서 `getKeywordAlertUnseen`, `addKeywordAlertUnseen`, `markKeywordAlertSeen` 제공하고, 저장 시마다 `setUnseen(await getKeywordAlertUnseen())` 등으로 상태 갱신.

이렇게 하면 Web과 **같은 API·react-query·폼·비즈니스 로직**을 유지하면서, 라우팅·지도·저장소·UI만 RN에 맞게 바꿀 수 있습니다.
