# Expo vs React Native CLI (Bare)

이 문서들은 **Expo**를 전제로 작성되어 있습니다. **React Native CLI(bare)** 로 만들 경우 어떤 점이 다른지만 정리합니다.

---

## 1. 요약

| 항목 | Expo | React Native CLI (bare) |
|------|------|--------------------------|
| 프로젝트 생성 | `npx create-expo-app mygomi-mobile` | `npx react-native init MyGomiMobile` |
| 패키지 설치 | `npx expo install ...` (호환 버전 자동) | `npm install` / `yarn add` |
| 환경 변수 | `EXPO_PUBLIC_*` (클라이언트 노출) | `react-native-config` 등 별도 패키지 |
| 네이티브 코드 | 대부분 건드리지 않음 | `ios/`, `android/` 직접 수정 |
| 지도/위치 등 | `expo install react-native-maps`, `expo-location` | 동일 패키지 + 네이티브 링크/권한 직접 설정 |

**문서에서 “Expo”라고 한 부분**은 위 표의 Expo 열에 해당한다고 보면 됩니다. 폴더 구조, API·Auth·키워드 알림 로직, 디자인 토큰, 네비게이션 구조는 **Expo든 CLI든 동일**하게 적용할 수 있습니다.

---

## 2. Expo로 쓰는 경우 (현재 문서 기준)

- **설치**: `npx create-expo-app mygomi-mobile --template tabs` 후 02 문서대로 패키지 추가.
- **실행**: `npx expo start` → QR로 기기 실행 또는 시뮬레이터.
- **환경 변수**: `.env`에 `EXPO_PUBLIC_API_URL` 등 정의 후 `process.env.EXPO_PUBLIC_*`로 접근.
- **문서의 명령어**: `npx expo install ...` 그대로 사용.

---

## 3. React Native CLI(bare)로 쓰는 경우

- **설치**: `npx react-native init MyGomiMobile` 후 같은 라이브러리들을 `npm install`로 추가.
- **실행**: `npx react-native run-ios` / `npx react-native run-android`.
- **환경 변수**: `react-native-config` 등으로 `.env`를 읽고, `Config.API_URL` 형태로 사용. `EXPO_PUBLIC_*`는 없으므로 04 문서의 변수명만 `API_URL` 등으로 바꾸면 됨.
- **패키지**: 문서의 `npx expo install`는 `npm install <패키지>`로 대체.  
  예: `npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context`
- **지도/위치**: `react-native-maps`, `@react-native-community/geolocation` 등 설치 후 `ios/`, `android/`에 API 키·권한 설정 필요 (07 문서 내용은 동일, 설정 경로만 Xcode/Android Studio 기준).
- **AsyncStorage, react-query, axios, navigation** 등은 Expo/CLI 동일하게 사용.

---

## 4. 정리

- **Expo**: 문서에 나온 대로 그대로 따라가면 됨.
- **CLI(bare)**: 프로젝트 생성·실행·환경 변수·네이티브 설정만 위처럼 바꾸고, 나머지(폴더 구조, api/client, AuthContext, 키워드 알림, 네비게이션, 디자인, 마이그레이션)는 동일하게 적용하면 됨.
