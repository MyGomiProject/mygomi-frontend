# 앱 디자인 명세 (웹과 동일한 디자인)

웹(mygomi-frontend)과 **동일한 look & feel**로 앱을 만들 때 사용하는 디자인 명세입니다. 값은 모두 웹 CSS에서 추출했으며, 앱(React Native)에서는 이 수치를 theme·StyleSheet에 그대로 적용하면 됩니다.

---

## 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [색상 시스템](#2-색상-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [간격·레이아웃](#4-간격레이아웃)
5. [둥글기·테두리·그림자](#5-둥글기테두리그림자)
6. [버튼 스펙](#6-버튼-스펙)
7. [입력 필드·폼](#7-입력-필드폼)
8. [카드·리스트](#8-카드리스트)
9. [모달](#9-모달)
10. [헤더·탭바](#10-헤더탭바)
11. [상태·피드백](#11-상태피드백)
12. [앱 전용 보정](#12-앱-전용-보정)

---

## 1. 디자인 원칙

- **메인 컬러**: 초록 `#66bb6a` (헤더, CTA, 링크, 강조). 웹과 동일한 “마이고미” 톤 유지.
- **보조 강조**: 주황 `#e6a23c` (키워드 알림 버튼 등). 알림·경고성 액션에만 사용.
- **배경**: 흰색·연한 회색 위주. 카드/모달은 흰색 `#ffffff`, 섹션 배경은 `rgba(255,255,255,0.96)` 수준.
- **텍스트 계층**: 제목 `#2c2c2c` / `#333`, 본문 `#555` / `#666`, 보조 `#999` / `#888`.
- **일관된 둥글기**: 버튼은 4px(작은 것) / 10px / 12px / 20px(필) / 50px(필), 카드·모달은 12px / 16px / 24px.
- **터치 피드백**: 웹의 hover/active를 앱에서는 **pressed** 상태로 대체 (opacity 또는 배경색 변경, 필요 시 약간의 scale).

---

## 2. 색상 시스템

### 2.1 메인·강조

| 이름 | HEX | 용도 |
|------|-----|------|
| primary | `#66bb6a` | 헤더 배경, 메인 버튼, 링크, 탭 활성, 섹션 타이틀 |
| primaryDark | `#4caf50` | 버튼 hover/pressed, 스크롤바 thumb hover |
| primaryLight | `#f1f8e9` | 전체 목록 버튼 hover 배경 |
| primaryLighter | `#e8f5e9` | 전체 목록 버튼 active 배경 |

### 2.2 보조(키워드 알림 등)

| 이름 | HEX | 용도 |
|------|-----|------|
| keywordAlert | `#e6a23c` | 키워드 알림 버튼 배경 |
| keywordAlertDark | `#d89220` | 키워드 알림 버튼 hover/pressed |

### 2.3 배경·표면

| 이름 | HEX / 값 | 용도 |
|------|----------|------|
| background | `#ffffff` | 기본 배경 |
| surface | `#ffffff` | 카드, 모달, 입력 필드 |
| surfaceOverlay | `rgba(255,255,255,0.96)` | 페이지 콘텐츠 래퍼 (웹) |
| surfaceBlur | `rgba(255,255,255,0.85)` | 로그인 카드 (유리 효과) |
| backgroundLight | `#f5f5f5` | 리스트 빈 영역, 이미지 placeholder, 모달 닫기 버튼 |
| backgroundLighter | `#fafafa` | 모달 메타 영역, 캘린더 비현재월 |
| borderLight | `#f1f1f1` | 스크롤바 트랙 |

### 2.4 텍스트

| 이름 | HEX | 용도 |
|------|-----|------|
| textPrimary | `#2c2c2c` | 페이지 제목, 모달 제목, 알림 드롭다운 제목 |
| textSecondary | `#333` | 카드 제목, 섹션 제목, 모달 본문 강조 |
| textBody | `#555` | 본문, 라벨, 부제목 |
| textMuted | `#666` | 설명, 보조 정보 |
| textCaption | `#999` / `#888` | 날짜, placeholder, 빈 상태 문구 |
| textPlaceholder | `#ccc` | input placeholder |

### 2.5 테두리·구분선

| 이름 | HEX | 용도 |
|------|-----|------|
| border | `#e0e0e0` | 카드 테두리, 캘린더 그리드 |
| borderLight | `#eee` / `#f0f0f0` | 모달 구분선, 리스트 아이템 구분, 메타 상단선 |
| inputBorder | `#f0f4f8` | 입력 필드 기본 테두리 (연한 회색) |
| inputBorderFocus | `#66bb6a` | 입력 필드 focus |

### 2.6 상태·알림·에러

| 이름 | HEX | 용도 |
|------|-----|------|
| statusOpen | `#66bb6a` | 나눔 대기 뱃지 텍스트/강조 |
| statusOpenBg | `rgba(102,187,106,0.1)` | 나눔 대기 뱃지 배경 |
| statusReserved | `#ff9800` | 예약됨 뱃지 |
| statusReservedBg | `rgba(255,152,0,0.1)` | 예약됨 뱃지 배경 |
| statusCompleted | `#999` | 나눔 완료 뱃지 |
| statusCompletedBg | `rgba(153,153,153,0.1)` | 나눔 완료 뱃지 배경 |
| statusDeleted | `#f44336` | 삭제됨 (참고용) |
| badge | `#e53935` | 알림 배지(벨) 배경 |
| error | `#ef5350` | 에러 메시지, 삭제 버튼 |
| errorDark | `#d32f2f` | 삭제 버튼 hover |

### 2.7 오버레이·캘린더

| 이름 | HEX / 값 | 용도 |
|------|----------|------|
| overlay | `rgba(0,0,0,0.4)` | 키워드 알림 모달 배경 |
| overlayDark | `rgba(0,0,0,0.5)` | 나눔 글 모달 배경 |
| todayBorder | `#ff7043` | 캘린더 오늘 날짜 테두리 |
| todayBg | `#fff9f7` | 캘린더 오늘 날짜 배경 |
| sunday | `#ff5252` | 캘린더 일요일 헤더 |
| saturday | `#448aff` | 캘린더 토요일 헤더 |

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

- **웹**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...`
- **앱**:  
  - iOS: System (San Francisco)  
  - Android: Roboto (또는 Noto Sans KR 적용 시 동일하게)

### 3.2 크기·굵기 매핑

| 용도 | fontSize (px) | fontWeight | lineHeight | 비고 |
|------|----------------|------------|------------|------|
| 로고/히어로 대제목 | 28~30 (2.5rem) | 700 (bold) | — | MYGOMI, 페이지 대제목 |
| 페이지 제목 | 24 (2rem) ~ 28 | 700 | — | 마이페이지, 나눔 페이지 제목 |
| 섹션 제목 | 20~21 (1.3rem) | 700 | 1.5 | 지도/나눔 섹션 타이틀 |
| 모달 제목 | 20 (1.25rem) ~ 29 (1.8rem) | 700 | 1.4 | 키워드 모달 1.25rem, 나눔 모달 1.8rem |
| 카드 제목 | 17~18 (1.1rem) | 700 | 1.4 | 나눔 글 카드 제목 |
| 본문 | 16 (1rem) | 400 | 1.4~1.8 | 모달 설명, 메타 값 |
| 보조 본문 | 14~15 (0.9rem) | 400 | 1.5 | 설명, 빈 상태 문구 |
| 캡션/메타 | 12~14 (0.8rem~0.85rem) | 500~600 | — | 날짜, 작성자, 라벨 |
| 뱃지/작은 라벨 | 11~12 (0.7rem) | 600 | — | 상태 뱃지, 알림 배지 숫자 |
| 알림 섹션 타이틀 | 12~13 (0.8rem) | 600 | — | 대문자 + letterSpacing |

### 3.3 앱에서 사용할 수치 (숫자만)

```ts
// theme/typography.ts
export const fontSizes = {
  badge: 11,
  caption: 12,
  small: 13,
  body: 14,
  bodyLarge: 16,
  cardTitle: 17,
  sectionTitle: 20,
  modalTitle: 22,
  pageTitle: 24,
  hero: 28,
};
export const fontWeights = { normal: '400', medium: '500', semibold: '600', bold: '700' };
export const lineHeights = { tight: 1.2, normal: 1.4, relaxed: 1.5, loose: 1.8 };
```

---

## 4. 간격·레이아웃

### 4.1 기본 단위

- 웹: `1rem` ≈ 16px 기준. `0.25rem`(4px) ~ `2rem`(32px) 사용.
- 앱: **4px 격자** 권장. 4, 8, 12, 16, 20, 24, 32, 40, 48.

### 4.2 스페이싱 토큰

| 이름 | 값 (px) | 용도 |
|------|---------|------|
| xs | 4 | 아이콘-텍스트 갭, 뱃지 padding |
| sm | 8 | 버튼 padding(세로), 리스트 갭 작음 |
| md | 12 | 카드 내부 padding 작음, input padding |
| lg | 16 | 카드 padding, 섹션 내부 |
| xl | 20 | 모달 헤더/푸터 padding |
| xxl | 24 | 페이지 콘텐츠 padding, 카드 간격 |
| section | 32 | 섹션 간격, 로고 아래 여백 |
| container | 24~32 | 좌우 컨테이너 padding (2rem) |

### 4.3 고정 높이 (웹 기준 → 앱)

| 요소 | 높이 (px) | 비고 |
|------|-----------|------|
| 헤더(웹) | 56~64 (padding 1rem 포함) | 앱: SafeArea + 56 정도 |
| 나눔 글 썸네일 | 90 | 정사각형 90×90 |
| 나눔 모달 이미지 영역 | 250~320 | 작은 화면 250, 큰 화면 320 |
| 알림 드롭다운 | max 420 | 320px 너비, max-height 420 |
| 키워드 모달 | max 85vh | 너비 90% max 420 |
| 탭바(앱) | 56~80 | 플랫폼 기본 + Safe Area |

### 4.4 콘텐츠 영역

- **웹**: `padding-top: 80px` (헤더 아래), `max-width: 1200px`, `margin: 0 auto`, 좌우 `2rem`.
- **앱**: 헤더 높이만큼 상단 padding 또는 SafeAreaInsets; 좌우 16~24px; max-width 없음(전체 너비 사용).

---

## 5. 둥글기·테두리·그림자

### 5.1 borderRadius (px)

| 이름 | 값 | 용도 |
|------|-----|------|
| radiusXs | 4 | 헤더 버튼, 알림 버튼 |
| radiusSm | 6 | 닫기 버튼 hover 영역, 벨 버튼 |
| radiusMd | 8 | 썸네일, 삭제(키워드) 버튼, 이미지 내 indicator |
| radiusLg | 10 | 상태 뱃지, 입력 필드(모달), 리스트 스크롤바 |
| radiusCard | 12 | 나눔 카드, 전체 목록 버튼, 모달 메타 박스, 액션 버튼 |
| radiusModal | 16 | 키워드/나눔 모달, 알림 드롭다운 |
| radiusSection | 24 | 페이지 콘텐츠 래퍼, 마이페이지 카드 |
| radiusPill | 50 (또는 9999) | 로그인 input, 검색창, 메인 CTA 버튼 |
| radiusPillButton | 20 | 글쓰기/키워드 알림 버튼, 모달 상태 뱃지 |

### 5.2 테두리

- **두께**: 1px (일반), 1.5px(전체 목록 버튼), 2px(입력 focus, 캘린더 오늘).
- **색상**: 위 [테두리·구분선](#25-테두리구분선) 참고.

### 5.3 그림자 (웹 → 앱 변환)

| 용도 | 웹 (box-shadow) | 앱 (iOS shadow + Android elevation) |
|------|------------------|--------------------------------------|
| 헤더 | 0 2px 8px rgba(0,0,0,0.1) | elevation: 2 / shadowOpacity: 0.1, radius: 8, offset: {0,2} |
| 카드 | 0 2px 8px rgba(0,0,0,0.08) | elevation: 2 / shadowOpacity: 0.08, radius: 8 |
| 카드 hover | 0 8px 20px rgba(0,0,0,0.15) | pressed 시 elevation: 4, radius: 20 |
| 버튼(메인) | 0 2px 8px rgba(102,187,106,0.3) | shadowColor: primary, shadowOpacity: 0.3 |
| 버튼 hover | 0 4px 12px rgba(102,187,106,0.4) | pressed 시 동일 색, opacity 0.4 |
| 키워드 버튼 | 0 2px 6px rgba(230,162,60,0.35) | shadowColor: keywordAlert |
| 모달 | 0 8px 32px rgba(0,0,0,0.15~0.2) | elevation: 8 / shadowRadius: 32 |
| 알림 드롭다운 | 0 4px 20px rgba(0,0,0,0.15) | elevation: 4, radius: 20 |
| 로그인 카드 | 0 15px 35px rgba(0,0,0,0.05) | elevation: 4, radius: 35 |
| 입력 focus | 0 4px 12px rgba(102,187,106,0.15) | shadowColor: primary (선택) |

---

## 6. 버튼 스펙

### 6.1 메인(primary) CTA

- **배경**: `#66bb6a`, **pressed**: `#4caf50`.
- **텍스트**: 흰색, 16px(0.9rem~1rem), fontWeight 600~700.
- **padding**: 세로 12~16px, 가로 20~24px (글쓰기: 0.6rem 1.2rem).
- **borderRadius**: 20px(필 형태) 또는 12px(직사각형).
- **그림자**: 위 표 참고. 앱에서는 pressed 시 살짝 줄이거나 유지.

### 6.2 보조(secondary) / 테두리만

- **배경**: transparent, **테두리**: 1px solid `#ffffff`(헤더) 또는 `#66bb6a`(전체 목록).
- **텍스트**: 흰색(헤더) 또는 `#66bb6a`(전체 목록).
- **padding**: 6~8px 세로, 12~16px 가로. borderRadius 4px(헤더) / 12px(전체 목록).
- **pressed**: 배경 `rgba(255,255,255,0.1)` (헤더) 또는 `#f1f8e9` (전체 목록).

### 6.3 키워드 알림 버튼

- **배경**: `#e6a23c`, **pressed**: `#d89220`.
- **텍스트**: 흰색, 14~16px, bold.
- **padding**: 10px 16px, borderRadius 20px.
- **그림자**: 0 2px 6px rgba(230,162,60,0.35); pressed 시 0 4px 12px rgba(230,162,60,0.45).

### 6.4 닫기/보조(회색)

- **배경**: `#f5f5f5`, **pressed**: `#eee`.
- **텍스트**: `#333`, 15~16px, fontWeight 600.
- **padding**: 12px, borderRadius 10px. 전체 너비 가능(모달 하단 “닫기”).

### 6.5 삭제(위험)

- **배경**: `#e53935`(키워드 삭제 버튼은 테두리만 + 이 색 텍스트), **채움**: `#f44336`, **pressed**: `#d32f2f`.
- **텍스트**: 흰색(채움) 또는 `#e53935`(테두리만).
- **borderRadius**: 8px(작은 삭제), 12px(모달 액션).

### 6.6 로그인/회원가입 제출

- **배경**: `#66bb6a`, **pressed**: `#4caf50`.
- **padding**: 16px, borderRadius 50px(필), 전체 너비.
- **폰트**: 1.1rem, bold. 그림자: 0 8px 15px rgba(102,187,106,0.2).

---

## 7. 입력 필드·폼

### 7.1 텍스트 입력(로그인/회원가입)

- **배경**: `rgba(255,255,255,0.9)`, **focus**: `#fff`.
- **테두리**: 2px solid `#f0f4f8`, **focus**: 2px solid `#66bb6a`.
- **padding**: 14px 20px, **borderRadius**: 50px.
- **fontSize**: 16px, **placeholder**: `#ccc`, 14px.
- **focus 그림자**: 0 4px 12px rgba(102,187,106,0.15). (앱에서는 선택적으로)

### 7.2 라벨

- **fontSize**: 14px, **color**: `#555`, **fontWeight**: 600.
- **위치**: 입력 위, margin-top 10~18px, margin-bottom 6px, 왼쪽 12px.

### 7.3 모달 내 입력(키워드)

- **테두리**: 1px solid `#ddd`, **focus**: `#66bb6a`.
- **padding**: 10px 16px, **borderRadius**: 10px, **fontSize**: 15px.

### 7.4 에러 메시지

- **color**: `#ef5350`, **fontSize**: 12px, **margin-top**: 8px, **padding-left**: 12px.

---

## 8. 카드·리스트

### 8.1 나눔 글 카드

- **배경**: `#ffffff`, **테두리**: 1px solid `#e0e0e0`.
- **borderRadius**: 12px, **padding**: 10~16px (웹 0.6rem, 모바일 1rem).
- **그림자**: 0 2px 8px rgba(0,0,0,0.08). **pressed**: 0 8px 20px rgba(0,0,0,0.15) + 살짝 위로(translateY -4px → 앱에서는 opacity 또는 scale 0.98).
- **썸네일**: 90×90px, borderRadius 8px, 배경 `#f5f5f5`, 그림자 0 1px 3px rgba(0,0,0,0.1).
- **제목**: 17px, 700, `#333`, lineHeight 1.4.
- **설명**: 14px, `#666`, 최대 2줄(line-clamp 2).
- **상태 뱃지**: padding 2px 10px, borderRadius 10px, 11px 600. 색상은 [상태·알림](#26-상태알림에러) 참고.
- **메타**: 상단 1px solid `#f0f0f0`, padding-top 6px, 13px, `#999`. 작성자만 600, `#555`.

### 8.2 리스트 컨테이너

- **갭**: 16px(카드 간). **padding**: 8px 8px 8px 0.
- **스크롤바**(웹): width 6px, track `#f1f1f1`, thumb `#66bb6a`, borderRadius 10px. (앱은 기본 스크롤 인디케이터 또는 커스텀)

---

## 9. 모달

### 9.1 공통

- **오버레이**: 배경 `rgba(0,0,0,0.4)` (키워드) / `rgba(0,0,0,0.5)` (나눔 글), 터치 시 닫기.
- **모달 박스**: 배경 `#fff`, borderRadius 16px, 그림자 0 8px 32px rgba(0,0,0,0.15~0.2).
- **애니메이션**: 웹 fadeIn 0.2s, slideUp 0.3s. 앱: `Modal`의 `animationType="fade"` 또는 `slide`.

### 9.2 키워드 알림 모달

- **크기**: 너비 90%, max 420px, max-height 85vh.
- **헤더**: padding 20px 24px, borderBottom 1px `#eee`. 제목 20px 700 `#2c2c2c`. 닫기: 24px, `#666`, padding 4px, borderRadius 6px, pressed `#f0f0f0`.
- **설명**: padding 16px 24px, 14px `#555`, lineHeight 1.5.
- **입력+추가**: gap 8px, padding 0 24px 16px. 추가 버튼: primary 스타일, 10px borderRadius.
- **리스트**: padding 0 24px, max-height 240px, 빈 상태 14px `#999`.
- **아이템**: padding 10px 0, borderBottom 1px `#f0f0f0`. 삭제 버튼: 테두리+텍스트 `#e53935`, borderRadius 8px, pressed 시 배경 채움.
- **푸터**: borderTop 1px `#eee`, padding 16px 24px. 닫기 버튼: 전체 너비, 배경 `#f5f5f5`, 15px 600 `#333`, borderRadius 10px.

### 9.3 나눔 글 상세 모달

- **크기**: max-width 800px, width 100%, max-height 90vh (앱 95vh).
- **닫기 버튼**: 절대 위치 top 16px right 16px, 36×36px, 원형, 배경 rgba(255,255,255,0.9), 그림자 0 2px 8px rgba(0,0,0,0.1).
- **이미지 영역**: 높이 250~320px, borderRadius 12px, 배경 `#f5f5f5`, 좌우 margin 24px. 네비 버튼: 40×40px 원형, 배경 rgba(255,255,255,0.9). 인디케이터: 상단 좌 16px, 배경 rgba(0,0,0,0.6), 흰색, padding 6px 12px, borderRadius 20px, 13px 600.
- **썸네일**: 60×60px, borderRadius 8px, active 테두리 `#66bb6a`, box-shadow 0 0 0 2px rgba(102,187,106,0.3).
- **정보 영역**: padding 0 24px 24px. 제목 29px 700 `#2c2c2c`. 상태 뱃지: padding 8px 16px, borderRadius 20px, 14px 600.
- **메타 박스**: padding 24px, 배경 `#fafafa`, borderRadius 12px, gap 16px. 라벨 13px `#999`, 값 16px 600 `#333`.
- **설명**: 제목 19px 700, 본문 16px `#666`, lineHeight 1.8.
- **액션 버튼**: padding 24px, borderTop 1px `#f0f0f0`, gap 16px. primary / secondary / detail(테두리 primary) / delete 스타일. 삭제 disabled: 배경 `#ccc`, `#999`.

---

## 10. 헤더·탭바

### 10.1 헤더(웹과 동일 톤)

- **배경**: `#66bb6a`, **그림자**: 0 2px 8px rgba(0,0,0,0.1).
- **높이**: padding 세로 16px 포함해 약 56~64px. 앱: SafeArea top + 이 높이.
- **로고/타이틀**: 흰색, 24px(1.5rem), bold.
- **네비 링크**: 흰색, 15px(0.95rem). **pressed**: opacity 0.8.
- **로그인/로그아웃 버튼**: 테두리 1px 흰색, padding 6px 12px, borderRadius 4px, 14px.
- **닉네임(로그인 후)**: 배경 흰색, 텍스트 `#66bb6a`, 15px 600, padding 6px 12px, borderRadius 4px.
- **알림 벨**: 22px(1.35rem) 흰색, padding 6px, borderRadius 6px, **pressed** 배경 rgba(255,255,255,0.2).
- **알림 배지**: minWidth 18px, height 18px, padding 0 5px, 배경 `#e53935`, 흰색 11px 700, borderRadius 9px, 위치: 아이콘 우상단.
- **알림 드롭다운**: 너비 320px, max-height 420px, 배경 `#fff`, borderRadius 12px, 그림자 0 4px 20px rgba(0,0,0,0.15). 제목 16px 700 `#2c2c2c`, 구분선 `#eee`. 섹션 타이틀 12px 600 `#66bb6a`(대문자). 빈 상태 14px `#999`. 아이템 padding 14px 20px, 제목 15px 600, author 13px `#666`, preview 13px `#999`. 푸터 링크 14px 600 `#66bb6a`.

### 10.2 앱 하단 탭바

- **활성 색**: `#66bb6a`, **비활성**: `#999`.
- **높이**: 플랫폼 기본(약 56px) + 하단 Safe Area.
- **라벨**: “홈” / “나눔” / “마이” 등.

---

## 11. 상태·피드백

### 11.1 버튼

- **default**: 위 [버튼 스펙](#6-버튼-스펙)대로.
- **pressed**: 배경 한 단계 어둡게 + 필요 시 opacity 0.9 또는 scale 0.98.
- **disabled**: 배경 `#ccc`, 텍스트 `#999`, opacity 0.6 (삭제 버튼 등).

### 11.2 입력

- **focus**: 테두리 `#66bb6a`, 배경 `#fff`, 선택적으로 그림자.

### 11.3 리스트/카드

- **pressed**: 카드는 그림자 강화 + 살짝 위로; 앱에서는 opacity 0.95 또는 배경 `#fafafa`로 대체 가능.

### 11.4 로딩·에러

- **로딩**: 스피너 색 `#66bb6a` 또는 회색.
- **에러**: 텍스트 `#ef5350`, 12px. 토스트/배너 사용 시 동일 색상.

---

## 12. 앱 전용 보정

- **Safe Area**: 상단(노치/상태바), 하단(홈 인디케이터) 반드시 반영. `react-native-safe-area-context` 사용.
- **터치 영역**: 최소 44×44pt(iOS HIG). 작은 닫기/아이콘 버튼은 hitSlop으로 확대.
- **키보드**: 입력 시 레이아웃이 가리지 않도록 `KeyboardAvoidingView` 사용. 키보드 올라올 때 버튼이 보이도록 padding 조정.
- **다크 모드**: 현재 명세는 라이트 전용. 추후 다크 테마 시 primary/배경/텍스트만 토큰으로 바꾸면 됨.
- **폰트 스케일**: 접근성(큰 글씨) 지원 시 fontSize를 비율로 두거나 allowFontScaling 조절.

---

이 명세를 **theme(colors, typography, spacing)** 과 **컴포넌트별 StyleSheet**에 적용하면 웹과 동일한 디자인으로 앱을 구현할 수 있습니다. 수치가 필요한 부분은 모두 위 표와 문단에 포함되어 있으므로, 개발 시 이 문서를 기준으로 하면 됩니다.
