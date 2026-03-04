# React Native 폴더 구조 가이드

React Web 프로젝트(mygomi-frontend)를 기준으로, React Native 앱에서 **어디에 무슨 파일을 두면 되는지** 매핑한 문서입니다. 이 구조를 바탕으로 RN 앱을 개발하면 Web과 역할을 맞추기 쉽습니다.

---

## 1. 현재 Web 프로젝트 폴더 구조 (src 기준)

```
src/
├── api/                    # 백엔드 API 호출
│   ├── client.ts           # axios 인스턴스, 토큰/인터셉터
│   ├── auth.ts
│   ├── user.ts
│   ├── address.ts
│   ├── sharePost.ts
│   ├── chat.ts
│   ├── calendar.ts
│   ├── items.ts
│   ├── area.ts
│   └── reservation.ts
├── components/             # 재사용 UI 컴포넌트
│   ├── Header.tsx / .css
│   ├── Loading.tsx / .css
│   ├── ErrorDisplay.tsx / .css
│   ├── ErrorBoundary.tsx
│   ├── ToastNotification.tsx / .css
│   ├── Map.tsx / .css
│   ├── SearchBox.tsx
│   ├── ParallaxBackground.tsx / .css
│   ├── SharingPostList.tsx / .css
│   ├── SharingPostModal.tsx / .css
│   ├── AllPostsModal.tsx / .css
│   ├── ChatRoomModal.tsx / .css
│   ├── ChatNotificationListener.tsx
│   ├── KeywordAlertModal.tsx / .css
│   ├── KeywordAlertPoller.tsx
│   ├── BellIcon.tsx
│   ├── EditInfoModal.tsx / .css
│   ├── ChangePasswordModal.tsx / .css
│   ├── ItemDetailView.tsx / .css
│   └── NotFoundSection.tsx
├── contexts/
│   └── AuthContext.tsx     # 인증 상태·로그인/로그아웃
├── hooks/
│   ├── useDebounce.ts
│   ├── useCalendar.ts
│   ├── useChatSocket.ts
│   ├── useChatNotificationSocket.ts
│   └── useKeywordAlertPolling.ts
├── pages/                  # 라우트별 화면 (Web: Route 하나 = 페이지 하나)
│   ├── HomePage.tsx / .css
│   ├── SharingPage.tsx / .css
│   ├── SharePostCreatePage.tsx / .css
│   ├── AddressInputPage.tsx / .css
│   ├── IntegratedSearchPage.tsx / .css
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── MyPage.tsx / .css
│   ├── TestPage.tsx
│   └── __tests__/
├── constants/
│   ├── constants.ts        # 기본값, 도쿄 23구 등
│   ├── waste.ts            # 쓰레기 타입 라벨/이모지
│   └── sharePost.ts        # 나눔 카테고리 라벨/이모지
├── types/
│   ├── index.ts
│   ├── auth.ts
│   ├── user.ts
│   ├── address.ts
│   ├── area.ts
│   ├── items.ts
│   ├── calendar.ts
│   └── ...
├── utils/
│   └── keywordAlert.ts     # 키워드 알림 localStorage + 이벤트
├── mocks/                  # MSW 핸들러 (개발/테스트용)
│   ├── browser.ts
│   ├── server.ts
│   ├── handlers.ts
│   └── data.ts
├── App.tsx / App.css
├── index.tsx
├── index.css
├── setupProxy.js           # Web 전용: dev 서버 프록시
├── setupTests.ts
└── react-app-env.d.ts
```

---

## 2. React Native 권장 폴더 구조

아래는 **같은 기능을 RN에서 구현할 때** 권장하는 디렉터리 구조입니다. Web의 `src/` 역할을 RN 프로젝트 루트의 `src/`에 두고, 플랫폼 전용만 분리합니다.

```
mygomi-mobile/                 # RN 프로젝트 루트 (예: npx create-expo-app)
├── App.tsx                    # 네비게이션 루트 + Provider
├── app.json / app.config.js
├── package.json
│
├── src/
│   ├── api/                   # ✅ Web과 동일 역할, 대부분 공유 가능
│   │   ├── client.ts          # RN: axios + AsyncStorage 토큰
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── address.ts
│   │   ├── sharePost.ts
│   │   ├── chat.ts
│   │   ├── calendar.ts
│   │   ├── items.ts
│   │   ├── area.ts
│   │   └── reservation.ts
│   │
│   ├── components/            # RN용 컴포넌트 (View, Text, StyleSheet)
│   │   ├── common/            # 공통 UI
│   │   │   ├── Header.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorDisplay.tsx
│   │   │   └── ToastNotification.tsx
│   │   ├── sharing/           # 나눔 관련
│   │   │   ├── SharingPostList.tsx
│   │   │   ├── SharingPostModal.tsx
│   │   │   ├── SharingPostCard.tsx
│   │   │   └── AllPostsModal.tsx
│   │   ├── chat/
│   │   │   ├── ChatRoomModal.tsx
│   │   │   └── ChatNotificationListener.tsx
│   │   ├── keyword/
│   │   │   ├── KeywordAlertModal.tsx
│   │   │   └── KeywordAlertPoller.tsx
│   │   ├── map/
│   │   │   └── MapView.tsx    # react-native-maps
│   │   └── modals/
│   │       ├── EditInfoModal.tsx
│   │       └── ChangePasswordModal.tsx
│   │
│   ├── screens/               # RN: 페이지 = Screen (네비게이션 1:1)
│   │   ├── HomeScreen.tsx
│   │   ├── SharingScreen.tsx
│   │   ├── SharePostCreateScreen.tsx
│   │   ├── AddressInputScreen.tsx
│   │   ├── IntegratedSearchScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── MyPageScreen.tsx
│   │   └── TestScreen.tsx
│   │
│   ├── navigation/            # RN 전용: 스택/탭 라우트 설정
│   │   ├── RootNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── types.ts           # 네비게이션 타입
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx    # ✅ 로직 공유, 저장소만 AsyncStorage로 교체
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts     # ✅ 그대로 공유
│   │   ├── useCalendar.ts
│   │   ├── useChatSocket.ts
│   │   ├── useChatNotificationSocket.ts
│   │   └── useKeywordAlertPolling.ts  # ✅ 로직 공유, storage만 RN용
│   │
│   ├── constants/             # ✅ Web과 동일 파일 공유 가능
│   │   ├── constants.ts
│   │   ├── waste.ts
│   │   └── sharePost.ts
│   │
│   ├── types/                 # ✅ Web과 동일 파일 공유 가능
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── address.ts
│   │   └── ...
│   │
│   ├── utils/
│   │   └── keywordAlert.ts    # RN: AsyncStorage + EventEmitter 또는 Context
│   │
│   ├── theme/                 # RN 전용: 디자인 토큰 (선택)
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   │
│   └── __tests__/             # 테스트
│       └── ...
│
├── assets/                   # 이미지, 폰트
│   ├── images/
│   └── fonts/
│
└── mocks/                    # (선택) API 모킹
    └── ...
```

---

## 3. 파일/역할 매핑표

| Web (src) | React Native (src) | 비고 |
|-----------|--------------------|------|
| **api/** | **api/** | 동일. `client.ts`만 RN에서 `localStorage` → `AsyncStorage` 등으로 교체 |
| **components/** | **components/** | 같은 역할. 하위를 `common/`, `sharing/`, `chat/`, `map/`, `modals/` 등으로 구분 권장. 스타일은 `.css` 대신 `StyleSheet` 또는 theme |
| **pages/** | **screens/** | 페이지 = Screen. 하나의 Screen 파일에 Web의 Page + Page.css 역할 |
| (없음) | **navigation/** | RN 전용. `react-navigation` 스택/탭 설정 |
| **contexts/** | **contexts/** | 동일. AuthContext는 저장소만 플랫폼별 구현 |
| **hooks/** | **hooks/** | 대부분 공유. `window`/`document`/`localStorage` 쓰는 훅만 RN용 래퍼 |
| **constants/** | **constants/** | 동일. 공유 가능 |
| **types/** | **types/** | 동일. 공유 가능 |
| **utils/** | **utils/** | 동일. `keywordAlert`만 `localStorage` → `AsyncStorage`, `window.dispatchEvent` → EventEmitter 등으로 교체 |
| **mocks/** | **mocks/** (선택) | MSW 대신 RN에서는 fetch mock 또는 별도 서버 사용 |
| **index.css, App.css** | **theme/** + 각 Screen/Component 내 StyleSheet | 전역 스타일 → theme 토큰 + 컴포넌트별 스타일 |
| **setupProxy.js** | (없음 또는 env) | RN은 `baseURL`을 env로 두고 실제 API 서버 주소 사용 |

---

## 4. 라우트(Web) ↔ 화면(RN) 매핑

| Web Route | RN Screen / Navigator |
|-----------|-------------------------|
| `/` | `HomeScreen` |
| `/sharing` | `SharingScreen` |
| `/sharing/create` | `SharePostCreateScreen` |
| `/address-input` | `AddressInputScreen` |
| `/integrated-search` | `IntegratedSearchScreen` |
| `/login` | `LoginScreen` |
| `/signup` | `SignupScreen` |
| `/mypage` | `MyPageScreen` |
| `/test` | `TestScreen` (개발용) |

RN에서는 위 Screen들을 **스택 네비게이터**로 묶고, 필요하면 **탭**(홈 / 나눔 / 마이페이지 등)으로 구분하면 됩니다.

---

## 5. 공유 vs 플랫폼 전용 정리

- **그대로 또는 최소 수정으로 공유**
  - `api/*.ts` (client 제외)
  - `constants/*.ts`
  - `types/*.ts`
  - `hooks/useDebounce.ts`, `useCalendar.ts` 등 (DOM/브라우저 미사용 훅)

- **플랫폼별 구현 필요**
  - `api/client.ts`: Web → `localStorage` / RN → `AsyncStorage`
  - `contexts/AuthContext.tsx`: 토큰 저장소만 교체
  - `utils/keywordAlert.ts`: 저장소 + 이벤트 전달 방식(RN은 EventEmitter 또는 Context)
  - `components/*`, `pages/*`: 마크업을 View/Text 등 RN 컴포넌트로, 스타일을 StyleSheet 등으로 전환

- **RN 전용**
  - `navigation/` 전체
  - `theme/` (Web의 전역 CSS 대신)
  - 지도: Web `leaflet` → RN `react-native-maps`

이 구조를 기준으로 파일을 두고 개발하면, Web과 RN이 **같은 API·타입·상수·비즈니스 로직**을 쓰면서 **UI와 네비게이션만 플랫폼별**로 가져갈 수 있습니다.
