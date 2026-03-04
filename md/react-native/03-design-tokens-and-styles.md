# React Native 디자인 토큰 및 스타일 가이드

Web 프로젝트(mygomi-frontend)의 CSS에서 추출한 **색상·폰트·간격·컴포넌트별 스타일**을 정리했습니다. React Native에서 **웬만하면 비슷한 디자인**을 쓰기 위해 theme 파일과 StyleSheet 예시로 맞춰 두었습니다.

**더 자세한 앱 전용 디자인 명세**(색상/타이포/간격/버튼/카드/모달/헤더/상태별 수치 전체)는 **[10-app-design-spec.md](./10-app-design-spec.md)**를 참고하세요.

---

## 1. 디자인 토큰 요약 (Web CSS 기준)

### 1.1 색상

| 용도 | Web 값 | RN 변수명 (권장) |
|------|--------|-------------------|
| 메인(헤더·버튼·링크) | `#66bb6a` | `primary` |
| 메인 호버/강조 | `#4caf50` | `primaryDark` |
| 배경 흰색 | `#ffffff` | `background` |
| 카드/모달 배경 | `#ffffff` | `surface` |
| 제목/본문 진한색 | `#2c2c2c`, `#333` | `textPrimary` |
| 부가 텍스트 | `#555`, `#666` | `textSecondary` |
| 보조/플레이스홀더 | `#999`, `#888` | `textMuted` |
| 구분선/비활성 | `#eee`, `#f0f0f0`, `#e0e0e0` | `border`, `borderLight` |
| 배경 연한 회색 | `#f5f5f5`, `#f1f8e9`, `#e8f5e9` | `backgroundLight`, `backgroundGreenTint` |
| 알림 배지 | `#e53935` | `badge` |
| 키워드 알림 버튼 | `#e6a23c`, 호버 `#d89220` | `keywordAlert`, `keywordAlertDark` |
| 상태: 나눔 대기 | `#66bb6a` | `statusOpen` |
| 상태: 예약됨 | `#ff9800` | `statusReserved` |
| 상태: 완료 | `#999` | `statusCompleted` |
| 상태: 삭제 | `#f44336` | `statusDeleted` |
| 에러 | `#ef5350` | `error` |

### 1.2 폰트

| 용도 | Web | RN (대략) |
|------|-----|-----------|
| 시스템 폰트 | -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto… | `Platform.select({ ios: 'System', android: 'Roboto' })` 또는 Noto Sans KR |
| 로고/큰 제목 | 2.5rem, bold | fontSize: 24~28, fontWeight: '700' |
| 페이지 제목 | 2rem ~ 2.5rem, bold | 20~24 |
| 섹션 제목 | 1.3rem, 700 | 18~20, fontWeight: '700' |
| 카드 제목 | 1.1rem, 700 | 16~17, fontWeight: '700' |
| 본문 | 0.9rem ~ 1rem | 14~16 |
| 보조/캡션 | 0.8rem ~ 0.9rem | 12~14 |
| 작은 라벨/배지 | 0.7rem, 600 | 11~12, fontWeight: '600' |

### 1.3 간격·둥글기

| 용도 | Web | RN |
|------|-----|-----|
| 카드/모달 둥글기 | 12px, 16px, 24px, 32px | borderRadius: 12, 16, 24, 32 |
| 버튼 둥글기 | 4px, 10px, 20px(필), 50px(필) | 4, 10, 20, 50 |
| 패딩 작음 | 0.5rem ~ 1rem | 8, 12, 16 |
| 패딩 보통 | 1rem ~ 1.5rem | 16, 20, 24 |
| 패딩 큼 | 2rem, 2.5rem | 24, 32 |
| 그림자(카드) | 0 2px 8px rgba(0,0,0,0.08) | elevation: 2 (Android), shadow* (iOS) |

---

## 2. RN용 theme 파일 예시

`src/theme/colors.ts`:

```ts
export const colors = {
  primary: '#66bb6a',
  primaryDark: '#4caf50',
  background: '#ffffff',
  surface: '#ffffff',
  textPrimary: '#2c2c2c',
  textSecondary: '#555',
  textMuted: '#999',
  border: '#eee',
  borderLight: '#f0f0f0',
  backgroundLight: '#f5f5f5',
  backgroundGreenTint: '#f1f8e9',
  badge: '#e53935',
  keywordAlert: '#e6a23c',
  keywordAlertDark: '#d89220',
  statusOpen: '#66bb6a',
  statusReserved: '#ff9800',
  statusCompleted: '#999',
  statusDeleted: '#f44336',
  error: '#ef5350',
  overlay: 'rgba(0,0,0,0.4)',
};
```

`src/theme/typography.ts`:

```ts
import { Platform } from 'react-native';

export const fontSizes = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 28,
};

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
```

`src/theme/spacing.ts`:

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
};
```

`src/theme/index.ts`:

```ts
export { colors } from './colors';
export { fontSizes, fontWeights } from './typography';
export { spacing } from './spacing';
```

---

## 3. 컴포넌트별 스타일 매핑 (Web → RN)

### 3.1 헤더

- 배경: `#66bb6a`
- 로고/네비 텍스트: 흰색, 1.5rem / 0.95rem, bold
- 로그인/로그아웃 버튼: 흰색 테두리, 패딩 0.4rem 0.8rem, borderRadius 4
- 알림 배지: `#e53935`, 흰색 글자, minWidth 18, height 18, borderRadius 9
- 드롭다운: 배경 #fff, borderRadius 12, box-shadow → RN에서는 elevation + shadowColor/shadowOffset

### 3.2 나눔 페이지 (SharingPage)

- 제목: fontSize 2.5rem(또는 2rem), color `#2c2c2c`
- 부제: 1.2rem, `#555`
- 콘텐츠 래퍼: 배경 rgba(255,255,255,0.96), borderRadius 24, padding 2rem
- 키워드 알림 버튼: 배경 `#e6a23c`, 흰색 글자, padding 0.6rem 1rem, borderRadius 20, fontWeight bold
- 글쓰기 버튼: 배경 `#66bb6a`, padding 0.6rem 1.2rem, borderRadius 20
- 전체 목록 버튼: 흰 배경, 테두리·글자 `#66bb6a`, borderRadius 12

### 3.3 나눔 글 카드 (SharingPostList)

- 카드: background #fff, borderRadius 12, padding 0.6rem, border 1px #e0e0e0, shadow 0 2px 8px rgba(0,0,0,0.08)
- 썸네일: 90x90, borderRadius 8, background #f5f5f5
- 제목: fontSize 1.1rem, fontWeight 700, color #333
- 상태 뱃지: OPEN → 초록 배경/글자, RESERVED → 주황, COMPLETED → 회색, padding 0.2rem 0.6rem, borderRadius 10, fontSize 0.7rem
- 설명: 0.9rem, #666, line-clamp 2
- 메타(작성자·날짜): 상단 border #f0f0f0, fontSize 0.85rem, #999

### 3.4 키워드 알림 모달

- 오버레이: rgba(0,0,0,0.4)
- 모달: #fff, borderRadius 16, width 90% / max 420
- 헤더: padding 1.25rem 1.5rem, borderBottom #eee, 제목 1.25rem 700 #2c2c2c
- 입력+추가: border #ddd, focus 시 border #66bb6a, 추가 버튼 배경 #66bb6a
- 리스트 빈 상태: #999, 0.9rem
- 삭제 버튼: 테두리·글자 #e53935, borderRadius 8
- 닫기 버튼: 배경 #f5f5f5, #333, borderRadius 10

### 3.5 로그인/회원가입 (Auth)

- 카드: 배경 rgba(255,255,255,0.85), borderRadius 32, padding 25px 40px
- 로고 "MYGOMI": 2.5rem, 900, #66bb6a
- input: border 2px #f0f4f8, borderRadius 50, focus 시 border #66bb6a
- btn-primary: 배경 #66bb6a, borderRadius 50, padding 16px
- muted 링크: #66bb6a, fontWeight 700

---

## 4. RN StyleSheet 예시 (헤더·카드)

```tsx
import { StyleSheet } from 'react-native';
import { colors, fontSizes, fontWeights, spacing } from '../theme';

export const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  navLink: {
    color: '#fff',
    fontSize: fontSizes.md,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
  },
  badge: {
    backgroundColor: colors.badge,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    // Android
    elevation: 2,
    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  statusOpen: {
    backgroundColor: 'rgba(102, 187, 106, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusOpenText: {
    color: colors.statusOpen,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
});
```

---

## 5. 요약

- **색상·폰트·간격**은 `theme/`에 두고 Web CSS 값과 위 매핑표를 맞추면, RN에서도 **웬만하면 비슷한 디자인**을 유지할 수 있습니다.
- 컴포넌트별로는 **섹션 3**을 참고해 View/Text에 동일한 색·크기·간격을 적용하면 됩니다.
- RN에서는 `elevation`(Android)과 `shadow*`(iOS)로 Web의 box-shadow를 흉내 내면 됩니다.

이 문서와 `01-folder-structure.md`, `02-libraries-and-setup.md`를 함께 사용하면 React Native 앱을 Web과 동일한 라이브러리·구조·디자인 방향으로 개발할 수 있습니다.
