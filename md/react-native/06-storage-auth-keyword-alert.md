# 저장소·Auth·키워드 알림 상세 (React Native)

Web에서는 `localStorage`와 `window.dispatchEvent`를 쓰는 부분을 RN에서는 **AsyncStorage**와 **Context(또는 EventEmitter)**로 바꿉니다. 여기서는 구현 단계를 구체적으로 정리합니다.

---

## 1. AsyncStorage 공통 사용처

| 용도 | Web | RN |
|------|-----|-----|
| 인증 토큰 | `localStorage.getItem('authToken')` | `AsyncStorage.getItem(TOKEN_KEY)` |
| 키워드 알림 키워드 목록 | `localStorage KEYWORD_ALERT_KEYWORDS` | AsyncStorage 동일 키 |
| 키워드 알림 미확인 목록 | `localStorage KEYWORD_ALERT_UNSEEN` | AsyncStorage 동일 키 |

RN에서는 **비동기**이므로 `getItem`/`setItem`이 모두 `Promise`를 반환합니다. 앱 초기화·Auth·키워드 알림에서 이를 반드시 await 처리합니다.

---

## 2. api/client.ts (RN 전체 예시)

```ts
// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const TOKEN_KEY = 'authToken';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export async function setAuthToken(token: string | null): Promise<void> {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

export function getAuthTokenKey(): string {
  return TOKEN_KEY;
}

// 앱 시작 시 한 번 호출 (AuthProvider에서 사용)
export async function loadStoredToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return token;
}

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

- `setAuthToken`: 로그인/로그아웃 시 호출.
- `loadStoredToken`: 앱 최초 로드 시 한 번 호출해 토큰을 읽고 axios 헤더에 세팅.

---

## 3. AuthContext (RN용 전체 예시)

Web의 AuthContext와 **로직은 동일**하고, **저장소만 AsyncStorage**로 바꿉니다. 초기 `token`은 동기적으로 못 가져오므로 **상태를 “로딩”**으로 두고, `loadStoredToken()` 후에 `setToken`으로 넣습니다.

```tsx
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, LoginRequest, SignupRequest } from '../api/auth';
import { userApi } from '../api/user';
import { setAuthToken, loadStoredToken } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthTokenKey } from '../api/client';

interface User {
  id: number;
  email: string;
  nickname: string;
  address?: { id: number; ward: string; isPrimary: boolean };
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthReady: boolean;  // 토큰 복원이 끝났는지
  login: (payload: LoginRequest) => Promise<void>;
  signup: (payload: SignupRequest) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = getAuthTokenKey();

function mapUserWithAddress(userInfo: any, defaultEmail?: string): User {
  const primaryAddress = userInfo.addresses?.find((addr: any) => addr.isPrimary);
  let extractedWard = '';
  if (primaryAddress?.fullAddress) {
    const parts = primaryAddress.fullAddress.split(' ');
    extractedWard = parts.find((p: string) => p.endsWith('구')) ?? '';
  }
  return {
    id: userInfo.id,
    email: userInfo.email ?? defaultEmail ?? '',
    nickname: userInfo.nickname ?? '',
    address: primaryAddress
      ? { id: primaryAddress.id, ward: extractedWard, isPrimary: primaryAddress.isPrimary }
      : undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const clearSession = async () => {
    setUser(null);
    setToken(null);
    await setAuthToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
  };

  // 1) 앱 시작 시 저장된 토큰 복원
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadStoredToken();
      if (cancelled) return;
      setToken(stored);
      setIsAuthReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // 2) 토큰이 바뀌면 사용자 정보 조회
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const userInfo = await userApi.getMe();
        if (cancelled) return;
        if (userInfo?.id) {
          setUser(mapUserWithAddress(userInfo));
        } else {
          await clearSession();
        }
      } catch {
        if (!cancelled) await clearSession();
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const login = async (payload: LoginRequest) => {
    const res = await authApi.login(payload);
    const accessToken = res.accessToken;
    await setAuthToken(accessToken);
    setToken(accessToken);
    try {
      const userInfo = await userApi.getMe();
      if (userInfo?.id) setUser(mapUserWithAddress(userInfo, payload.email));
      else setUser({ id: res.userId, email: payload.email, nickname: '' });
    } catch {
      setUser({ id: res.userId, email: payload.email, nickname: '' });
    }
  };

  const signup = async (payload: SignupRequest) => {
    const res = await authApi.signup(payload);
    return res;
  };

  const logout = async () => {
    await clearSession();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthReady, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- `isAuthReady`: 앱이 켜졌을 때 `loadStoredToken()`이 끝날 때까지 true로 두고, 그동안 스플래시/로딩을 보여준 뒤 네비게이션을 결정할 수 있습니다.

---

## 4. 키워드 알림 (RN): Context로 “이벤트” 대체

Web은 `localStorage` + `window.dispatchEvent('keyword-alert-updated')`로 구독합니다. RN에는 `window`가 없으므로 **Context**에서 상태를 보관하고, 저장 시마다 Context의 setState로 목록을 다시 불러와 구독자(Header, Poller 등)가 리렌더되게 합니다.

### 4.1 키워드 알림 저장소 + Context

```ts
// src/utils/keywordAlertStorage.ts (RN 전용)
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYWORD_ALERT_KEYWORDS = 'keyword_alert_keywords';
const KEYWORD_ALERT_UNSEEN = 'keyword_alert_unseen';

export interface KeywordAlertItem {
  postId: string;
  title: string;
  keyword: string;
  createdAt: string;
}

export async function getKeywordAlertKeywords(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYWORD_ALERT_KEYWORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((k: unknown) => typeof k === 'string' && (k as string).trim())
      : [];
  } catch {
    return [];
  }
}

export async function setKeywordAlertKeywords(keywords: string[]): Promise<void> {
  const list = keywords.map((k) => k.trim()).filter(Boolean);
  await AsyncStorage.setItem(KEYWORD_ALERT_KEYWORDS, JSON.stringify(list));
}

export async function getKeywordAlertUnseen(): Promise<KeywordAlertItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYWORD_ALERT_UNSEEN);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addKeywordAlertUnseen(item: KeywordAlertItem): Promise<void> {
  const list = await getKeywordAlertUnseen();
  if (list.some((a) => a.postId === item.postId && a.keyword === item.keyword)) return;
  list.unshift(item);
  await AsyncStorage.setItem(KEYWORD_ALERT_UNSEEN, JSON.stringify(list.slice(0, 50)));
}

export async function markKeywordAlertSeen(postId: string): Promise<void> {
  const list = (await getKeywordAlertUnseen()).filter((a) => a.postId !== postId);
  await AsyncStorage.setItem(KEYWORD_ALERT_UNSEEN, JSON.stringify(list));
}

export async function markAllKeywordAlertsSeen(): Promise<void> {
  await AsyncStorage.setItem(KEYWORD_ALERT_UNSEEN, '[]');
}
```

### 4.2 Context: 미확인 목록 + 새로고침 트리거

```tsx
// src/contexts/KeywordAlertContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { KeywordAlertItem } from '../utils/keywordAlertStorage';
import * as keywordAlertStorage from '../utils/keywordAlertStorage';

type KeywordAlertContextValue = {
  unseen: KeywordAlertItem[];
  refreshUnseen: () => Promise<void>;
  markSeen: (postId: string) => Promise<void>;
  markAllSeen: () => Promise<void>;
};

const KeywordAlertContext = createContext<KeywordAlertContextValue | undefined>(undefined);

export const KeywordAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unseen, setUnseen] = useState<KeywordAlertItem[]>([]);

  const refreshUnseen = useCallback(async () => {
    const list = await keywordAlertStorage.getKeywordAlertUnseen();
    setUnseen(list);
  }, []);

  const markSeen = useCallback(async (postId: string) => {
    await keywordAlertStorage.markKeywordAlertSeen(postId);
    await refreshUnseen();
  }, [refreshUnseen]);

  const markAllSeen = useCallback(async () => {
    await keywordAlertStorage.markAllKeywordAlertsSeen();
    await refreshUnseen();
  }, [refreshUnseen]);

  useEffect(() => {
    refreshUnseen();
  }, [refreshUnseen]);

  return (
    <KeywordAlertContext.Provider value={{ unseen, refreshUnseen, markSeen, markAllSeen }}>
      {children}
    </KeywordAlertContext.Provider>
  );
};

export function useKeywordAlert() {
  const ctx = useContext(KeywordAlertContext);
  if (!ctx) throw new Error('useKeywordAlert must be used within KeywordAlertProvider');
  return ctx;
}
```

### 4.3 Poller에서 새 알림 추가 시 Context 갱신

`useKeywordAlertPolling` 훅 안에서, `addKeywordAlertUnseen` 호출 후 **Context의 `refreshUnseen()`을 호출**하거나, RN 전용 훅에서 `keywordAlertStorage.addKeywordAlertUnseen(item)` 후 `refreshUnseen()`을 호출하면 Header 등이 자동으로 갱신됩니다. RN용 Poller 훅은 `getKeywordAlertKeywords`만 **비동기**로 바꿔서 호출하면 됩니다 (예: `const keywords = await getKeywordAlertKeywords()`를 매 폴링 또는 키워드 변경 시 사용).

---

## 5. 요약

- **api/client**: 토큰을 AsyncStorage에 저장·조회하고, `loadStoredToken()`으로 앱 시작 시 한 번 복원.
- **AuthContext**: `isAuthReady`로 초기화 완료 후 네비게이션 분기, login/logout에서 `setAuthToken` 및 AsyncStorage 사용.
- **키워드 알림**: AsyncStorage 기반 유틸 + Context로 “미확인 목록”과 `refreshUnseen`/`markSeen`을 제공하면, Web의 `window.dispatchEvent` 역할을 대체할 수 있음.

이렇게 하면 Web과 동일한 인증·키워드 알림 동작을 RN에서 유지할 수 있습니다.
