# 환경 변수 및 API 연동 (React Native)

Web은 `setupProxy.js`로 `/api`를 백엔드로 넘기지만, RN에는 프록시가 없으므로 **Base URL을 환경별로 설정**해야 합니다.

---

## 1. 필요한 설정

- **API Base URL**: 백엔드 서버 주소 (예: `http://localhost:8080`, 스테이징/운영 URL)
- (선택) **WebSocket URL**: 채팅 등 STOMP/WebSocket 서버 주소

---

## 2. Expo 기준 환경 변수

Expo(Expo SDK 49+)에서는 `EXPO_PUBLIC_` 접두사가 붙은 변수만 클라이언트에서 읽을 수 있습니다.

**프로젝트 루트에 파일 추가:**

- `.env.development` (개발)
- `.env.production` (운영, 선택)
- `.env` (기본값)

예시:

```bash
# .env.development
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws

# .env.production (실제 배포 시에는 실제 서버 주소로)
# EXPO_PUBLIC_API_URL=https://api.mygomi.example.com
# EXPO_PUBLIC_WS_URL=wss://api.mygomi.example.com/ws
```

**주의:**  
- iOS 시뮬레이터에서 `localhost`는 Mac 기준.  
- Android 에뮬레이터에서는 `10.0.2.2:8080`으로 접근하는 경우가 많음.  
- 실제 기기에서 개발 서버 접속 시에는 PC의 로컬 IP를 써야 함 (예: `EXPO_PUBLIC_API_URL=http://192.168.0.10:8080`).

---

## 3. api/client에서 사용

```ts
// src/api/client.ts
import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ... 토큰·인터셉터 설정 (02-libraries-and-setup.md 참고)
export default apiClient;
```

환경을 바꾼 뒤에는 앱을 다시 빌드/실행해야 변수가 반영됩니다.

---

## 4. 참고: Web과의 차이

| 항목 | Web | React Native |
|------|-----|--------------|
| Base URL | `/api` (프록시가 8080으로 전달) | `EXPO_PUBLIC_API_URL` 등으로 직접 지정 |
| CORS | 브라우저에서 `localhost:3000` 허용 | 앱은 CORS 대상이 아님 (네이티브 요청) |
| 토큰 저장 | `localStorage` | `AsyncStorage` (02 문서 참고) |

API 경로·헤더·요청 body 형식은 [md/API_REFERENCE.md](../API_REFERENCE.md)와 동일하게 맞추면 됩니다.
