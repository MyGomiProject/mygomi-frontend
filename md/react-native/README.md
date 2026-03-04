# React Native 개발 가이드 (마이고미)

React Web 프로젝트(mygomi-frontend)를 바탕으로 **React Native 앱**을 만들 때 참고하는 문서 모음입니다.  
폴더 구조, 필요한 라이브러리, 디자인을 웬만하면 비슷하게 맞추기 위한 기준을 담고 있습니다.

**이 가이드는 기본적으로 Expo 기준**으로 작성되어 있습니다. React Native CLI(bare)로 개발할 경우 [09-expo-vs-cli.md](./09-expo-vs-cli.md)를 참고하세요.

---

## 1. 이 레포의 다른 문서 참조

RN만 보지 말고 **아래 문서들을 함께 보면** 도메인·API·기존 Web 구현과 맞추기 쉽습니다.

| 문서 | 용도 |
|------|------|
| **[00-references.md](./00-references.md)** | **RN 개발 시 함께 볼 문서들** 정리 — [guide.md](../guide.md)(도메인·일정), [API_REFERENCE.md](../API_REFERENCE.md), [CHAT_FRONTEND_GUIDE.md](../CHAT_FRONTEND_GUIDE.md), [frontend_libraries.md](../frontend_libraries.md) 등 링크와 설명 |

---

## 2. RN 전용 문서 목록

| 문서 | 내용 |
|------|------|
| [00-references.md](./00-references.md) | **참조 문서** – 프로젝트 내 guide, API, 채팅 가이드 등 링크 |
| [01-folder-structure.md](./01-folder-structure.md) | **폴더 구조** – Web `src/` 구조, RN 권장 구조, 파일/역할 매핑, 라우트 ↔ Screen |
| [02-libraries-and-setup.md](./02-libraries-and-setup.md) | **라이브러리·설정** – Web 의존성 → RN 패키지, API 클라이언트·Auth·키워드 알림 |
| [03-design-tokens-and-styles.md](./03-design-tokens-and-styles.md) | **디자인·스타일** – 색상/폰트/간격 토큰, 컴포넌트별 스타일, theme/StyleSheet 예시 |
| [04-environment-and-api.md](./04-environment-and-api.md) | **환경 변수·API 연동** – Base URL, `.env`, Expo `EXPO_PUBLIC_*` |
| [05-navigation-detail.md](./05-navigation-detail.md) | **네비게이션 상세** – 스택/탭 구조, 화면별 파라미터, RootNavigator·타입 예시 코드 |
| [06-storage-auth-keyword-alert.md](./06-storage-auth-keyword-alert.md) | **저장소·Auth·키워드 알림 상세** – AsyncStorage, AuthContext RN 전체 예시, 키워드 알림 Context 구현 |
| [07-maps-calendar-chat.md](./07-maps-calendar-chat.md) | **지도·캘린더·채팅 상세** – react-native-maps 설정/권한, 캘린더 markedDates, STOMP/채팅 주의점 |
| [08-component-migration.md](./08-component-migration.md) | **컴포넌트 마이그레이션** – Web→RN 태그/스타일/이벤트 매핑, 모달·리스트·주요 컴포넌트 체크리스트 |
| [09-expo-vs-cli.md](./09-expo-vs-cli.md) | **Expo vs CLI** – 문서는 Expo 기준, React Native CLI(bare)로 할 때 차이점 |
| [10-app-design-spec.md](./10-app-design-spec.md) | **앱 디자인 명세** – 웹과 동일한 디자인용 상세 스펙(색상·타이포·간격·버튼·카드·모달·헤더·상태) |

---

## 3. 사용 순서 제안

1. **00-references.md** – 도메인·API 문서(guide, API_REFERENCE 등) 링크 확인
2. **01-folder-structure.md** – RN 프로젝트 `src/` 디렉터리·파일 배치
3. **02-libraries-and-setup.md** – 패키지 설치, `api/client`, AuthContext, 키워드 알림
4. **04-environment-and-api.md** – 환경 변수·API Base URL 설정
5. **05-navigation-detail.md** – 스택/탭 구성, 화면 파라미터, RootNavigator 코드
6. **06-storage-auth-keyword-alert.md** – AsyncStorage·AuthContext·KeywordAlert Context 구현
7. **07-maps-calendar-chat.md** – 지도/캘린더/채팅 설정·권한·사용 패턴
8. **03-design-tokens-and-styles.md** – theme 생성 후 화면/컴포넌트 스타일 적용
9. **08-component-migration.md** – 실제 컴포넌트 옮길 때 태그·스타일·체크리스트 참고
10. **10-app-design-spec.md** – 앱 UI 구현 시 웹과 동일한 수치(색상·폰트·간격·버튼·카드·모달 등) 참고

이 문서들을 기준으로 개발하면 Web과 **같은 API·비즈니스 로직·디자인 톤**을 유지하면서 React Native 앱을 구현할 수 있습니다.
