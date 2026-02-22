# 마이고미(MAIGOMI) — 초기 개발 가이드 (Backend 중심: Entity/DB 설계 + 협업 운영)

작성 목적
- "지금부터 개발을 시작한다"는 전제로, **필수 도메인(Entity)와 DB 스키마**, **API/권한 구조**, **협업 규칙**까지 한 번에 정리합니다.
- 주니어 팀 기준으로 "왜 이렇게 나누는지 / 무엇을 먼저 만들지"를 단계적으로 설명합니다.
- **6주 타임라인(Deadline 03.10)**을 기준으로 우선순위를 명확히 제시합니다.

---

## 0. 제품 요약

- 한 줄 소개: **복잡한 일본 분리수거 규칙을 한눈에, 처치 곤란한 물건은 이웃과 함께.**
- 핵심 축 3가지
    1) **지역 기반 수거 캘린더** (구/동/町 + 번지 범위 단위)
    2) **품목별 분류/검색** (가연/불연/플라/자원 등)
    3) **무료 나눔 커뮤니티 + 채팅 + 알림**

---

## 1. 기술 스택 제안 (React + Spring Boot 기준)

### 1.1 Backend
- Spring Boot 3.x (가능하면) / Spring Security
- JPA(Hibernate)
- DB: **MySQL** (PostgreSQL에서 변경)
- 실시간 채팅: 1안) WebSocket(STOMP) 2안) Firebase
- 알림: Quartz/Spring Scheduler + Web Push(웹) 또는 FCM(모바일/웹)

### 1.2 Frontend
- **React + TypeScript** 시도 후 어려울 경우 React + JS로 빠르게 변경
- 캘린더: FullCalendar
- 지도: Google Maps 또는 OpenStreetMap(Leaflet)

### 1.3 인프라/운영(초기)
- **Docker** (1~2일 투자 시도)
- CI: GitHub Actions(빌드/테스트/린트)

---

## 2. 개발 순서(6주 타임라인 기준) — "메인 페이지 우선 완성" 전략

> **핵심 전략**: 지도 기능을 "한 번에 끝내려 하지 않는다."  
> W2~W3에서는 지도 조회(READ) + 핀 렌더링(초기형)만 만들고,  
> W4~W5에 게시판/채팅과 결합하여 "진짜 커뮤니티 지도"로 확장한다.

### 재정의된 MVP (W3 종료 시점에 반드시 데모 가능)
아래 3가지는 **W3 종료 시점(02.15)에 반드시 데모 가능**해야 합니다:
1. **지역 설정 → 캘린더 표시** (REQ-02)
2. **품목 검색 → 배출 방법 안내** (REQ-03, 04)
3. **지도에 "주변 나눔 물품" 핀 표시** (REQ-10, 단 **조회-only**)

> 게시판 글쓰기/업로드/채팅은 W4~W5에 본격 구현

---

### W1 (01.27 ~ 02.01): 기반 구축
**목표**: 로그인/주소 + 데이터 Seed
- 사용자/권한/로그인(REQ-01)
- 지역 데이터 모델링 + Seed 파이프라인 구축
- 주소 설정 온보딩

**완료 기준**:
- 가입→로그인→주소 저장→대표 주소 지정까지 OK
- 오타구 일부 `areas/collection_rules` Seed 준비 완료

---

### W2 (02.02 ~ 02.08): 캘린더 완성 + 지도 뼈대
**목표**: 캘린더 정확 + 지도 컴포넌트 + nearby 조회 API(임시)
- 지역 기반 수거 캘린더 조회(REQ-02) 완성
- **지도 조회용 임시 API 제공(nearby READ-only)**
  - 초기에는 DB가 없어도 됨: 더미/seed 기반으로라도 반환
  - `GET /api/share-posts/nearby?lat=&lng=&radiusKm=` (임시 구현 가능)
- 메인 페이지 레이아웃 초안 생성
  - 상단 검색 박스(연동 X)
  - 좌하단 캘린더(연동 O)
  - 우하단 지도 컴포넌트(연동은 더미라도 O)
- 지도 SDK 연동(Leaflet 또는 Google Maps) + **핀 렌더링(초기형)**

**완료 기준**:
- "2,4주 금"이 달력에서 정확하게 보임
- 메인 페이지에 "지도 박스"가 떠 있고 핀이 최소 1개 이상 표시됨(더미 가능)

---

### W3 (02.09 ~ 02.15): 검색 완성 + 메인 페이지 1차 완성(데모 가능)
**목표**: 메인 화면(검색+캘린더+지도 핀) 데모 가능
- 품목 분류/검색(REQ-03, 04) 완성
- 지도 nearby API를 "주소 기반"으로 연결 개선
- 메인 페이지 통합
  - 검색 결과 → 상세 안내
  - 캘린더는 유지
  - 지도 핀 클릭 → "미리보기 카드"(제목/사진 1장/구 정도)

**완료 기준(중요)**:
- 발표 데모로 "메인 페이지에서 검색 + 캘린더 + 지도 핀" 흐름이 된다.
- 아직 게시판 글쓰기 없어도 OK (지도 핀은 더미/seed 기반이어도 OK)

---

### W4 (02.16 ~ 02.22): 게시판(나눔 데이터 생성원)
**목표**: 게시판 CRUD + 이미지
- 나눔 게시판 + 이미지(REQ-08)
- 게시판이 '지도 데이터의 진짜 원천'이 되게 만들기

**완료 기준**:
- 게시글 작성 → 목록 노출 OK
- 게시글에 lat/lng 저장(또는 게시글 작성 시 지도에서 위치 선택)

---

### W5 (02.23 ~ 03.01): 채팅 + 지도 고도화
**목표**: 채팅(텍스트) + 지도 핀 "진짜 데이터" 연결
- 1:1 채팅(REQ-09, 텍스트만)
- 지도 기반 나눔(REQ-10) 고도화
  - nearby API를 게시판 데이터 기반으로 고도화
  - 반경 검색/정렬/페이지네이션(가능하면)
  - 지도 핀 커스텀 렌더링 고도화 (아이콘/카테고리별 마커)

**완료 기준**:
- 지도에서 실제 게시글이 핀으로 보이고, 상세로 들어가 채팅까지 이어짐

---

### W6 (03.02 ~ 03.10): 폴리싱/발표
**목표**: 버그픽스 + 시연 시나리오 + 배포 안정화
- 개발 중단(기능 추가 금지)
- 통합 테스트/버그 픽스
- 시연 시나리오 고정(최소 3개)
  1) 내 주소 설정 → 캘린더 확인
  2) 품목 검색 → 배출 안내 확인
  3) 지도에서 물품 찾기 → 상세 → 채팅(또는 게시글 보기)

---

### 후순위 기능 (MVP 이후)
- 대형폐기물 수수료 계산기(REQ-05)
- 행정 링크(REQ-06)
- 제보/검수 프로세스(REQ-07)
- 수거일 알림(REQ-11)
- 키워드 알림(REQ-12)

---

## 3. 도메인 설계(업무 개념) — “테이블을 바로 만들지 말고 개념부터”

### 3.1 핵심 개념(Glossary)
- **Area(지역)**: 도/현 → 구 → 동/町(쵸) → 번지 범위(전역 또는 1-22, 25, 26 같은 표현)
- **CollectionRule(수거 규칙)**: 가연/불연/플라/자원(병캔, 종이 등)별 요일/주차 규칙
- **Item(품목)**: “이 품목은 가연/불연/자원/플라 중 무엇인가?” + 배출 방법 설명
- **SodaiItem(대형폐기물 품목)**: 지자체별 수수료(스티커) 기준
- **SharePost(나눔 게시글)**: **무료나눔**/거래 상태/위치/사진/채팅 연동
- **Report(제보)**: 사용자 제보 → 관리자 검수 → 승인/반려
- **Notification(알림)**: 예약 알림(수거일) + 이벤트 알림(키워드 매칭)

---

## 4. DB 설계 (ERD 수준으로 “필요 테이블” 제안)

### 4.1 사용자/권한

#### 4.1.1 `users`
- 목적: 회원/로그인/프로필/기본 지역설정
- 주요 컬럼
    - `id` (PK)
    - `email` (UNIQUE)
    - `password` (기존 password_hash 삭제)
    - `nickname`
    - `role` (USER, ADMIN)
    - `status` (ACTIVE, SUSPENDED, DELETED)
    - `created_at`, `updated_at`

#### 4.1.2 `user_addresses`
- 목적: "내 거주지(구/동/町/번지)"를 1개 이상 저장 가능하게
- 주요 컬럼
    - `id` (PK)
    - `user_id` (FK -> users)
    - `area_id` (FK -> areas, NULLABLE) ※ **수거 규칙 조회를 위한 매핑**
    - `prefecture` (도/현) ※ 주소 입력 원문 보존용
    - `ward` (구) ※ 주소 입력 원문 보존용
    - `town` (동/町) ※ 주소 입력 원문 보존용
    - `chome` (丁目) ※ 주소 입력 원문 보존용
    - `banchi_text` (번지 표현 원문) ※ 주소 입력 원문 보존용
    - `is_primary`: 대표 주소 설정 (사용자가 여러 개의 주소를 등록했을 때, 그중 '기본'으로 사용할 주소가 무엇인지를 구분하기 위한 설정)
    - `lat`, `lng`
    - `created_at`, `updated_at`
- 인덱스: `(area_id)`, `(user_id, is_primary)`

> **설계 원칙**:
> - `area_id` FK로 `areas` 테이블과 연결하여 **수거 규칙 조회 성능 최적화**
> - 주소 입력 시 서비스 레이어에서 `prefecture/ward/town/chome/banchi_text`를 기반으로 매칭되는 `area`를 찾아 `area_id` 저장
> - `prefecture/ward/town/chome/banchi_text`는 원문 보존용으로 유지 (사용자가 입력한 주소 표시용)
> - 번지 범위가 "1-22, 25, 26"처럼 불규칙하므로 매칭 로직은 서비스 레이어에서 처리

---


---

### 4.2 지역별 수거 규칙(가장 중요)

#### 4.2.1 `areas`
- 목적: 행정 구역을 정규화(검색/필터 안정화)
- 주요 컬럼
    - `id` (PK)
    - `region` (지방: 関東 등)
    - `prefecture` (도/현)
    - `ward` (구)
    - `town` (町)
    - `chome` (丁目)
    - `banchi_text` (번지 원문: 전역/범위)
    - 인덱스: `(prefecture, ward, town, chome)`

> `areas`에는 “규칙이 동일하게 적용되는 최소 단위”를 저장합니다.  
> 예: 오타구 이케가미 1 전역 / 오타구 이케가미 3 1-22,25,26 … 

#### 4.2.2 `collection_rules`
- 목적: `areas` 단위로 수거 타입별 규칙 저장
- 주요 컬럼
    - `id` (PK)
    - `area_id` (FK -> areas)
    - `waste_type` (BURNABLE, NON_BURNABLE, PLASTIC, CAN_BOTTLE, PAPER 등)
    - `rule_type` (WEEKDAY, NTH_WEEKDAY, CUSTOM)
    - `weekdays` (예: `MON,THU` / `WED` / `SAT`)
    - `nth_weeks` (예: `2,4` 혹은 `1,3`)  ※ `rule_type=NTH_WEEKDAY`일 때 사용
    - `note` (예외/특이사항)
    - `created_at`, `updated_at`
- 인덱스
    - `(area_id, waste_type)`
    - `(waste_type)`

> 예시 매핑
> - “월, 목” → `rule_type=WEEKDAY`, `weekdays=MON,THU`
> - “2,4주 금” → `rule_type=NTH_WEEKDAY`, `weekdays=FRI`, `nth_weeks=2,4`

#### 4.2.3 `waste_types` (선택: 코드 테이블)
- 목적: 다국어/아이콘/표시명 관리
- 주요 컬럼
    - `code` (PK) 예: BURNABLE
    - `label_ko`, `label_ja`, `label_en`
    - `icon_key` (프론트 아이콘 매핑)

---

### 4.3 품목 분류/검색

#### 4.3.1 `items`
- 목적: 키워드 검색으로 “이 물건은 어디에 버려요?” 제공
- 주요 컬럼
    - `id` (PK)
    - **`name_ko`** (기본 검색 기준)
    - `name_ja` (선택)
    - `name_en` (선택)
    - `waste_type` (기본 분류)
    - `description` (배출 방법/주의사항)
    - **`example_keywords`**: 콤마로 구분된 태그 (예: 포카리, 스웨트)
    - `created_at`, `updated_at`
- 인덱스: 
  - `(name_ko)`
  - Full-Text(가능하면): `name_ja`, `example_keywords`

> **수정 사항**: 기본 검색 기준이 한국어(`ko`)로 변경됨에 따라 기존 4.3.2. `item_aliases(표기 흔들림에 따른 대응 테이블)` 테이블은 삭제합니다.

---

### 4.4 대형 폐기물(수수료 계산기 + 행정 링크)

#### 4.4.1 `municipal_services`
- 목적: 구별 행정 링크 유지보수 (신고 링크 1개, 안내 링크 1개)
- 주요 컬럼: 
  - `id` (PK)
  - `prefecture`
  - `ward`
  - `sodai_apply_url` (신고할 수 있는 연결 페이지)
  - `info_url` (안내 페이지)
  - `note`
  - 인덱스: `(prefecture, ward)`

#### 4.4.2 `sodai_items`
- 목적: 지자체별 품목/수수료(스티커) 기준
- 주요 컬럼
    - `id` (PK)
    - `prefecture`, `ward`
    - `name` (품목명)
    - `fee_yen` (정수)
    - `rule_note` (치수 조건 등)
    - 인덱스: `(prefecture, ward, name)`

> **수정 사항**: `sodai_calc_history` 테이블 삭제

---

### 4.5 사용자 제보/검수(운영)

#### 4.5.1 `reports`
- 목적: 데이터 누락/변경 제보 → 승인 후 반영
- 주요 컬럼
    - `id` (PK)
    - `user_id` (FK)
    - `report_type` (COLLECTION_RULE, ITEM, SERVICE_URL 등)
    - `target_ref` (어떤 데이터인지 식별: area_id/item_id/ward 등)
    - `content` (제보 내용)
    - `status` (PENDING, APPROVED, REJECTED)
    - `admin_comment` (반려 사유 등)
    - `created_at`, `updated_at`
- 인덱스: `(status, report_type)`

#### 4.5.2 `report_audits` (선택)
- 목적: 누가 언제 승인/반려 했는지 이력 관리
- 주요 컬럼
    - `id` (PK)
    - `report_id` (FK)
    - `admin_id` (FK -> users)
    - `action` (APPROVE/REJECT)
    - `comment`
    - `created_at`

---

### 4.6 나눔 커뮤니티(게시판 + 이미지 + 지도)

#### 4.6.1 `share_posts`
- 목적: 나눔 글(무료)
- 주요 컬럼
    - `id` (PK)
    - `user_id` (FK)
    - `title`
    - `content`
    - `category` (FURNITURE, ELECTRONICS, ETC)
    - `status` (OPEN, RESERVED, COMPLETED, DELETED)
    - `prefecture`, `ward` (지역 필터)
    - `town` (선택)
    - `lat`, `lng` (지도 핀)
    - `thumbnail_url` (선택)
    - `created_at`, `updated_at`
- 인덱스
    - `(ward, status, created_at)`
    - `(user_id, created_at)`

#### 4.6.2 `share_post_images`
- 목적: 사진 다중 업로드
- 주요 컬럼
    - `id` (PK)
    - `post_id` (FK -> share_posts)
    - `image_url`
    - `sort_order`

#### 4.6.3 `share_post_tags` (선택)
- 목적: 키워드 알림 매칭용 태그
- 주요 컬럼
    - `id` (PK)
    - `post_id` (FK)
    - `tag` (예: 냉장고, 책상)
- 인덱스: `(tag)`

---

### 4.7 1:1 채팅

> 채팅은 구현 선택지가 많습니다. DB는 “대화방/메시지”만 정리해도 충분합니다.

#### 4.7.1 `chat_rooms`
- 목적: 게시글 기반 1:1 대화방
- 주요 컬럼
    - `id` (PK)
    - `post_id` (FK -> share_posts)
    - `buyer_id` (FK -> users)  ※ “받는 사람”
    - `seller_id` (FK -> users) ※ “올린 사람”
    - `status` (ACTIVE, CLOSED)
    - `created_at`, `updated_at`
- 제약
    - `(post_id, buyer_id, seller_id)` UNIQUE (중복 방 방지)

#### 4.7.2 `chat_messages`
- 목적: 메시지 저장
- 주요 컬럼
    - `id` (PK)
    - `room_id` (FK -> chat_rooms)
    - `sender_id` (FK -> users)
    - `message_type` (TEXT, IMAGE, SYSTEM)
    - `content`
    - `created_at`
- 인덱스: `(room_id, created_at)`

---

### 4.8 알림(수거일 + 키워드)

#### 4.8.1 `notification_settings`
- 목적: 사용자 알림 설정
- 주요 컬럼
    - `id` (PK)
    - `user_id` (FK)
    - `collection_alert_enabled` (bool)
    - `collection_alert_time` (예: 20:00 / 08:00)
    - `keyword_alert_enabled` (bool)
    - `created_at`, `updated_at`

#### 4.8.2 `keyword_subscriptions`
- 목적: 관심 키워드 목록
- 주요 컬럼
    - `id` (PK)
    - `user_id` (FK)
    - `keyword` (인덱스)
    - `created_at`
- 인덱스: `(keyword)`, `(user_id)`

#### 4.8.3 `notifications`
- 목적: 발송 로그/읽음 처리
- 주요 컬럼
    - `id` (PK)
    - `user_id` (FK)
    - `type` (COLLECTION, KEYWORD, CHAT 등)
    - `title`
    - `body`
    - `link_url` (앱 내 이동)
    - `sent_at`
    - `read_at` (NULL이면 미읽음)
- 인덱스: `(user_id, sent_at)`

#### 4.8.4 `push_tokens` (웹/앱)
- 목적: Web Push/FCM 토큰 저장
- 주요 컬럼
    - `id` (PK)
    - `user_id` (FK)
    - `platform` (WEB, ANDROID, IOS)
    - `token`
    - `created_at`, `updated_at`
- 제약: `(platform, token)` UNIQUE

---

## 5. Entity 설계 팁 (주니어가 자주 실수하는 지점)

### 5.1 “문자열 원문 보존” 원칙
- 번지/주차 규칙처럼 복잡한 공공 데이터는 파싱 실수 위험이 큽니다.
- 따라서:
    - 1) **원문 컬럼 보존(`banchi_text`, `note`)**
    - 2) 서비스에서 해석(파싱) 결과를 계산해 사용
    - 3) 오류 발견 시 원문 기준으로 되돌리기 쉬움

### 5.2 Status/Soft Delete
- 게시글/유저는 삭제보다 **상태값 관리**가 안전합니다.
- 나중에 분쟁/운영 대응이 쉬워집니다.

### 5.3 인덱스는 “조회 패턴” 기준
- 캘린더: `(prefecture, ward, town, chome)`로 `areas` 탐색이 많음
- 게시판: `(ward, status, created_at)`로 리스트 조회가 많음
- 채팅: `(room_id, created_at)`로 최신 메시지 페이징

---



## 6. API 설계 (주요 수정)


### 6.1 인증/유저

#### 회원가입 플로우 (2단계)
1. **1단계: 기본 정보 입력**
   - `POST /api/auth/signup` 
     - Request: `{ email, password, nickname }`
     - Response: `{ userId, token }`
     - `users` 테이블에 저장

2. **2단계: 주소 설정 (온보딩)**
   - `POST /api/users/me/addresses`
     - Request: `{ prefecture, ward, town, chome, banchi_text, lat, lng, is_primary }`
     - **서비스 레이어 처리**:
       1. 입력받은 주소 정보로 `areas` 테이블에서 매칭되는 `area` 찾기
       2. 번지 범위 파싱 로직 적용 (예: "1-22, 25, 26" 처리)
       3. 매칭된 `area_id`와 원문 주소 정보를 함께 `user_addresses`에 저장
     - Response: `{ addressId, areaId, ... }`

#### 기타 API
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/me/addresses/{id}` (주소 수정 시 area 재매칭)
- `DELETE /api/users/me/addresses/{id}` (soft delete or remove)

### 6.2 수거 정보
- `GET /api/areas/search?prefecture=東京都&ward=大田区&town=池上&chome=1&banchi=...` (주소 입력 시 매칭되는 area 찾기)
- `GET /api/collection/calendar?addressId=...&from=2026-01-01&to=2026-01-31` (user_addresses의 area_id로 자동 조회)
- `GET /api/collection/rules?areaId=...` (또는 addressId로 조회 가능)

### 6.3 품목 검색
- `GET /api/items/search?q=...&ward=...` (자기 위치에 해당하는 구 안에서 물품 검색 기능 추가)
- `GET /api/items/{id}`

### 6.4 대형폐기물
- `GET /api/municipal-services?prefecture=...&ward=...` (신고 링크 및 안내 링크 제공)

### 6.5 제보
- `POST /api/reports`
- `GET /api/reports/mine`
- (ADMIN) `GET /api/admin/reports?status=PENDING`
- (ADMIN) `POST /api/admin/reports/{id}/approve`
- (ADMIN) `POST /api/admin/reports/{id}/reject`

### 6.6 나눔 게시판
- `POST /api/share-posts`
- `GET /api/share-posts?ward=大田区&status=OPEN&page=...`
- `GET /api/share-posts/{id}`
- `PUT /api/share-posts/{id}`
- `DELETE /api/share-posts/{id}`

### 6.7 지도 기반 나눔 (W2~W3는 조회-only, W4 이후 게시판 데이터 연결)
- `GET /api/share-posts/nearby?lat=&lng=&radiusKm=` (W2: 임시/더미 데이터, W5: 실제 게시판 데이터)


### 6.8 채팅
- [cite_start]**채팅 내 사진 전송 기능은 우선 삭제**하고 텍스트 기반 웹소켓 통신에 집중합니다.
- `POST /api/chat/rooms` (postId + 상대 정보로 방 생성/조회)
- `GET /api/chat/rooms`
- `GET /api/chat/rooms/{id}/messages?page=...`
- WebSocket: `/ws` + `/topic/rooms/{id}` + `/app/messages`

### 6.9 알림
- `POST /api/push/tokens`
- `PUT /api/notification-settings`
- `POST /api/keywords` (키워드 등록)
- `DELETE /api/keywords/{id}`
- `GET /api/notifications`

---

## 7. 요구사항(REQ) ↔ 테이블 매핑(검증에 도움이 됨)

- REQ-01 회원가입/로그인
    - `users`
- REQ-02 지역 기반 캘린더
    - `user_addresses`, `areas`, `collection_rules`, `waste_types`
- REQ-03 품목별 분류 안내
    - `items` (+ `item_aliases`)
- REQ-04 쓰레기 유형 검색
    - `items`, `item_aliases` (검색 인덱스)
- REQ-05 수수료 계산기
    - `sodai_items` (+ `sodai_calc_history`)
- REQ-06 행정 서비스 연계
    - `municipal_services`
- REQ-07 제보/검수
    - `reports`, `report_audits`
- REQ-08 나눔 게시판
    - `share_posts`, `share_post_images`, `share_post_tags`
- REQ-09 채팅
    - `chat_rooms`, `chat_messages`
- REQ-10 나눔 지도
    - `share_posts(lat,lng)`
- REQ-11 수거일 알림
    - `notification_settings`, `notifications`, `push_tokens`
- REQ-12 키워드 알림
    - `keyword_subscriptions`, `notifications`
- REQ-13 반응형 UI
    - 프론트 기준(백엔드는 이미지/응답 페이징 최적화)

---

## 8. 협업을 위한 운영 규칙(주니어 팀 필수)

### 8.1 Git 브랜치 전략(가볍게)
- `main`: 배포 가능한 안정 브랜치
- `develop`: 통합 테스트 브랜치(선택)
- `feature/REQ-xx-짧은설명`: 기능 브랜치
- 커밋 메시지 규칙 예시
    - `feat: REQ-02 add collection calendar api`
    - `fix: handle banchi parsing edge case`

### 8.2 이슈/PR 템플릿(강추)
- Issue: REQ-ID 연결, 화면/기능 정의, 완료 조건(AC)
- PR: 무엇을 했는지 + 테스트 방법 + 스크린샷(프론트) + API 샘플(백)

### 8.3 API 문서화
- Swagger/OpenAPI를 “필수”로 두기
- 엔드포인트가 늘수록 말로 공유하면 무조건 깨집니다.

### 8.4 데이터 관리 (Seed Data)
- **통합 관리**: docs에 더미데이터를 넣었던 것처럼, 초기 데이터를 한 파일로 관리하여 DB가 망가져도 즉시 복구 가능하도록(`npm run` 등 활용) 구성합니다.
- 원칙
    - (1) 엑셀 원본은 `data/raw/`에 버전 관리(혹은 공유드라이브)
    - (2) DB Seed 스크립트는 `data/seed/`에 관리
    - (3) 파싱 로직은 항상 **재실행 가능(idempotent)** 하게
- 권장 형태
    - CSV로 내보내기 → Spring Batch/간단 Import 스크립트로 적재
    - 적재 실패 행은 별도 로그 파일로 남기기

### 8.5 역할 분담 예시(REQ 기준)
- Backend
    - 인증/권한, 지역조회/캘린더 API, 게시판/채팅/알림 API
- Frontend
    - 캘린더/지도 UI, 게시판/채팅 UI, 알림 설정 UI
- Data
    - 지역 데이터 정제/적재 자동화, 품목 사전 구축

---

## 9. 초기에 반드시 정해야 하는 “정규화 규칙”(데이터 품질)

### 9.1 요일 표준
- DB에는 `MON,TUE,WED,THU,FRI,SAT,SUN`만 저장
- 화면 표시만 한국어/일본어로 변환

### 9.2 주차 표준
- `1,2,3,4,5` 형태로 저장
- “제2,4주” 같은 원문은 `note`에 보관 가능

### 9.3 지역명 및 언어 표준
- **표준**: 모든 데이터와 가이드는 **한국어 기준**으로 다시 작성합니다.
- 일본어 표기 흔들림 대응 로직을 포함합니다.

---

## 10. 다음 액션(바로 개발 들어가기 체크리스트)

### W1 체크리스트
- [ ] `users`, `user_addresses` 테이블 생성
- [ ] JWT 인증 구현
- [ ] 주소 CRUD API 완성
- [ ] `areas` + `collection_rules` 테이블 생성
- [ ] 오타구(大田区) 데이터 일부를 DB에 Seed (또는 W2 초반 완료)

### W2 체크리스트
- [ ] "내 주소 설정 → 해당 area 찾기 → 규칙 조회" API 완성
- [ ] 캘린더 규칙 해석 엔진(WEEKDAY, NTH_WEEKDAY) + 테스트
- [ ] `/api/collection/calendar` 완성
- [ ] FullCalendar에 월간 표시까지 연결
- [ ] 지도 조회용 임시 API 제공(nearby READ-only, 더미 데이터 가능)
- [ ] 메인 페이지 레이아웃 초안 생성 (검색 박스 + 캘린더 + 지도)
- [ ] 지도 SDK 연동 + 핀 렌더링(초기형)

### W3 체크리스트
- [ ] `items` 검색 API (`q + ward`) 완성
- [ ] 검색 UI + debounce + 상세 안내
- [ ] 지도 nearby API를 "주소 기반"으로 연결 개선
- [ ] 메인 페이지 통합 (검색 + 캘린더 + 지도 핀 클릭 → 미리보기 카드)

### W4 이후 체크리스트
- [ ] 게시판 CRUD부터(이미지는 S3/Cloudinary 등 외부 저장소로 URL만 저장)
- [ ] 게시글에 lat/lng 저장
- [ ] 채팅(텍스트만)
- [ ] 지도 핀 "진짜 데이터" 연결

---

## 11. UI/UX 및 기타 세부 요구사항 (신규)

- [cite_start]**캘린더**: 특정 날짜 클릭 시 노출되던 '오늘 버릴 것' 표시 기능을 삭제합니다.
- [cite_start]**지도 핀**: 커스텀 렌더링을 통해 아이콘 등을 저장해서 가져오는 형식으로 디자인을 확실히 차별화합니다.
- [cite_start]**검색 편의**: 동일 의미 검색어(별칭) 대응을 강화하되, 최근 검색어 저장 기능은 삭제합니다.


---

## 부록 A. Entity 클래스 설계(추천 규칙)

- JPA 연관관계는 “필요한 곳만” 양방향 사용
    - 예: `User` → `Address`는 OneToMany 가능
    - `SharePost` → `Images`는 OneToMany
- `@Enumerated(EnumType.STRING)`로 enum 저장(가독성/안전성)
- BaseEntity에 `createdAt/updatedAt` 공통 처리

---

## 부록 B. 테스트 전략(최소)
- Repository 테스트: `areas` 탐색, `collection_rules` 조회
- Service 테스트: 번지/주차 규칙 해석 로직(엣지 케이스)
- API 테스트: 주소 설정 후 캘린더 응답이 기대 규칙과 동일한지

---

원하면, 다음 단계로
1) 위 스키마를 기준으로 **ERD(텍스트/mermaid)** 형태로 정리하거나
2) Spring Boot 기준으로 **Entity 클래스 골격 + DDL**까지 한 번에 만들어 줄 수 있습니다.

