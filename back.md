# 마이고미(MAIGOMI) — 백엔드 개발 가이드 (주니어 팀용)

## 목표
- Spring Boot 기반 백엔드가 **어떤 순서로**, **무엇을**, **어떤 기술로** 개발해야 하는지 단계별로 정리합니다.
- "지금 당장 개발을 시작할 수 있는 수준"으로 **작업 단위**, **필수 API**, **검수 기준**, **구현 팁**까지 포함합니다.
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
- 데이터(오타구 등)는 "엑셀 → CSV → Seed" 방식으로 초기 적재 자동화
- **왜 이렇게 하나요?**: API 스펙을 먼저 정하면 프론트와 백엔드가 병렬로 작업할 수 있어 일정이 단축됩니다.

### 0.3 환경 통일(주니어 팀 생산성 핵심)
- Docker Compose로 로컬 DB/Redis(선택)/MinIO(선택) 통일
- `.env.example` 제공 후 개인별 `.env`로 운영
- **왜 이렇게 하나요?**: 환경이 다르면 "내 컴퓨터에서는 되는데요" 문제가 발생합니다. Docker로 통일하면 이런 문제를 방지할 수 있습니다.

---

## 1. 6주 타임라인 기반 개발 로드맵 (W1 ~ W6)

> **전체 타임라인**: Deadline 03.10 (6주)  
> 백엔드는 **프론트보다 먼저** API를 제공해야 합니다.  
> 각 주차마다: DB/Entity → Service → API 순서로 개발합니다.

| 주차 | 기간 | 백엔드 목표 | 핵심 산출물 |
|---|---|---|---|
| W1 | 01.27 ~ 02.01 | 기반 구축 | 로그인/주소 API + 데이터 Seed |
| W2 | 02.02 ~ 02.08 | 캘린더 완성 + 지도 뼈대 | 캘린더 API + nearby 조회 API(임시) |
| W3 | 02.09 ~ 02.15 | 검색 완성 | 품목 검색 API + 지도 nearby API 개선 |
| W4 | 02.16 ~ 02.22 | 게시판(나눔 데이터 생성원) | 게시판 CRUD API + 이미지 업로드 |
| W5 | 02.23 ~ 03.01 | 채팅 + 지도 고도화 | 채팅 API(WebSocket) + nearby API 고도화 |
| W6 | 03.02 ~ 03.10 | 폴리싱/발표 | 버그픽스 + API 안정화 |

---

## W1 — 환경 + 인증 + 주소 + Seed (01.27 ~ 02.01)

### 목표
- 프로젝트 골격 구축
- JWT 인증 구현
- 사용자 주소 CRUD API 제공
- Seed 데이터 파이프라인 구축

### 1.1 프로젝트 세팅

#### 필요 기술 스택
- **Spring Boot 3.x** (가능하면 최신 버전 사용)
- **Spring Security** (초기에는 미적용 가능, JWT만으로 시작해도 OK)
- **JPA(Hibernate)** - DB와의 연동
- **Flyway/Liquibase** (권장) - DB 마이그레이션 관리
- **Swagger(OpenAPI)** - API 문서 자동 생성
- **Lombok** (선택) - 보일러플레이트 코드 감소
- **Validation(javax/jakarta)** - 입력값 검증
- **JUnit5** - 테스트 작성

#### 패키지 구조 확정 (예시)
```
src/main/java/com/mygomi/
├── domain/          # Entity, Repository
│   ├── user/
│   ├── address/
│   └── area/
├── service/         # 비즈니스 로직
│   ├── AuthService.java
│   ├── UserService.java
│   └── AddressService.java
├── api/             # Controller, DTO
│   ├── controller/
│   └── dto/
├── security/        # JWT, 인증/인가
│   ├── JwtTokenProvider.java
│   └── SecurityConfig.java
└── config/          # 설정 클래스
    ├── SwaggerConfig.java
    └── DatabaseConfig.java
```

**왜 이렇게 구조를 나누나요?**
- `domain/`: DB 테이블과 직접 매핑되는 Entity와 데이터 접근 계층
- `service/`: 비즈니스 로직이 모이는 곳 (Entity를 조합해서 사용)
- `api/`: 외부와 통신하는 계층 (HTTP 요청/응답 처리)
- 이렇게 나누면 코드가 명확해지고 테스트하기 쉬워집니다.

#### 공통 응답 포맷 정의

**성공 응답**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-27T10:00:00Z"
  }
}
```

**실패 응답**
```json
{
  "errorCode": "AUTH_001",
  "message": "토큰이 만료되었습니다",
  "details": { ... }
}
```

**왜 공통 포맷을 정하나요?**
- 프론트엔드에서 일관된 방식으로 에러를 처리할 수 있습니다.
- 에러 코드로 구체적인 UX를 제공할 수 있습니다 (예: AUTH_001 → 로그인 페이지로 리다이렉트).

#### DB 마이그레이션 도구 설정 (Flyway 권장)

**Flyway란?**
- DB 스키마 변경 이력을 관리하는 도구입니다.
- `V1__create_users_table.sql` 같은 파일로 버전 관리합니다.
- 팀원들이 같은 DB 스키마를 유지할 수 있습니다.

**설정 방법 (build.gradle)**
```gradle
dependencies {
    implementation 'org.flywaydb:flyway-core'
    implementation 'org.flywaydb:flyway-database-postgresql'
}
```

**마이그레이션 파일 예시**
```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- updated_at 자동 업데이트를 위한 트리거 (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Swagger UI 설정

**설정 방법**
```java
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("마이고미 API")
                .version("1.0.0")
                .description("마이고미 백엔드 API 문서"));
    }
}
```

**접속 URL**: `http://localhost:8080/swagger-ui.html`

**왜 Swagger를 사용하나요?**
- API 스펙을 코드에서 자동으로 문서화합니다.
- 프론트엔드 개발자가 API를 테스트할 수 있습니다.
- API 변경 시 문서가 자동으로 업데이트됩니다.

### 1.2 JWT 인증 구현

#### JWT란?
- JSON Web Token의 약자로, 사용자 인증 정보를 담은 토큰입니다.
- 서버에 세션을 저장하지 않고, 토큰 자체에 정보를 담아서 사용합니다.
- **왜 JWT를 사용하나요?**: 서버를 여러 대로 확장할 때 세션 공유 문제가 없습니다.

#### 구현 단계

**1단계: JWT 토큰 생성/검증 클래스 작성**
```java
@Component
public class JwtTokenProvider {
    private String secretKey = "your-secret-key"; // 실제로는 환경변수로 관리
    
    // 토큰 생성
    public String generateToken(String email) {
        // JWT 라이브러리 사용 (jjwt 등)
    }
    
    // 토큰 검증
    public boolean validateToken(String token) {
        // 토큰이 유효한지 확인
    }
    
    // 토큰에서 이메일 추출
    public String getEmailFromToken(String token) {
        // 토큰 파싱
    }
}
```

**2단계: 로그인 API 구현**
```java
@PostMapping("/api/auth/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    // 1. 이메일/비밀번호 검증
    // 2. JWT 토큰 생성
    // 3. 토큰 반환
}
```

**3단계: 인증 필터 구현 (인증이 필요한 API 보호)**
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(...) {
        // 1. 요청 헤더에서 토큰 추출
        // 2. 토큰 검증
        // 3. SecurityContext에 사용자 정보 저장
    }
}
```

**왜 이렇게 하나요?**
- 필터에서 토큰을 검증하면, 모든 컨트롤러에서 인증된 사용자 정보를 사용할 수 있습니다.
- 각 API마다 인증 로직을 중복 작성할 필요가 없습니다.

### 1.3 사용자 주소 CRUD API

#### 필요한 Entity

**User Entity**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String nickname;
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserAddress> addresses = new ArrayList<>();
}
```

**UserAddress Entity**
```java
@Entity
@Table(name = "user_addresses")
public class UserAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    private String prefecture;  // 도/현
    private String ward;        // 구
    private String town;        // 동/町
    private String chome;        // 丁目
    private String banchiText;   // 번지 원문
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false;  // 대표 주소
    
    private Double lat;  // 위도
    private Double lng;  // 경도
}
```

**왜 `banchiText`를 문자열로 저장하나요?**
- 번지 범위가 "1-22, 25, 26"처럼 불규칙합니다.
- 초기에는 원문을 그대로 저장하고, 나중에 파싱 로직을 추가하는 것이 안전합니다.

#### 필수 API

**1. 주소 등록**
```
POST /api/users/me/addresses
Content-Type: application/json

{
  "prefecture": "東京都",
  "ward": "大田区",
  "town": "池上",
  "chome": "1",
  "banchiText": "전역",
  "isPrimary": true
}
```

**구현 포인트**
- 현재 로그인한 사용자 정보는 SecurityContext에서 가져옵니다.
- `isPrimary=true`로 설정하면, 기존 대표 주소는 `false`로 변경해야 합니다.

**2. 주소 목록 조회**
```
GET /api/users/me/addresses
```

**3. 주소 수정**
```
PUT /api/users/me/addresses/{id}
```

**4. 주소 삭제**
```
DELETE /api/users/me/addresses/{id}
```

**5. 대표 주소 설정**
```
PATCH /api/users/me/addresses/{id}/primary
```

**구현 포인트**
- 대표 주소는 1개만 유지되어야 합니다.
- 다른 주소의 `isPrimary`를 `false`로 변경하는 로직이 필요합니다.

### 1.4 Seed 데이터 파이프라인 구축

#### Seed란?
- 초기 데이터를 DB에 넣는 작업입니다.
- 개발/테스트를 위해 필요한 기본 데이터를 자동으로 넣을 수 있습니다.

#### 엑셀 → CSV → DB 파이프라인

**1단계: 엑셀을 CSV로 변환**
- 엑셀 파일을 CSV로 내보냅니다.
- 파일명: `areas_ota_ku.csv`, `collection_rules_ota_ku.csv`

**2단계: CSV 파싱 및 DB 적재 스크립트 작성**
```java
@Component
public class AreaSeedService {
    @Autowired
    private AreaRepository areaRepository;
    
    @PostConstruct  // 애플리케이션 시작 시 실행
    public void seedAreas() {
        // 1. CSV 파일 읽기
        // 2. 각 행을 Area Entity로 변환
        // 3. DB에 저장
    }
}
```

**3단계: 재실행 가능하게 만들기 (Idempotent)**
- 같은 데이터를 여러 번 실행해도 문제가 없도록 해야 합니다.
- 중복 체크 로직 추가:
```java
if (areaRepository.existsByPrefectureAndWardAndTown(...)) {
    // 이미 있으면 스킵
    continue;
}
```

**왜 이렇게 하나요?**
- DB를 초기화하고 다시 Seed를 넣을 때 안전합니다.
- 팀원들이 각자 로컬에서 같은 데이터를 사용할 수 있습니다.

### 1.5 완료 기준

**검수 기준**
- [ ] 로컬에서 `./gradlew test` 통과
- [ ] Swagger 접속 가능, 샘플 엔드포인트 1개 응답
- [ ] 회원가입 → 로그인 → JWT 토큰 발급 성공
- [ ] 주소 등록 → 목록 조회 → 대표 주소 설정 성공
- [ ] 오타구 일부 `areas/collection_rules` Seed 준비 완료 (또는 W2 초반 완료)

---

## W2 — 캘린더 "정확도" + 지도 "뼈대" (02.02 ~ 02.08)

### 목표
- 캘린더 규칙 해석 엔진 구현
- 캘린더 API 제공 (특정 기간의 실제 날짜 이벤트 반환)
- 지도 조회용 임시 API 제공 (더미 데이터 가능)

### 2.1 캘린더 규칙 해석 엔진

#### 왜 백엔드에서 처리하나요?
- 프론트에서 처리하면:
  - 사용자 디바이스/타임존/로케일 차이로 버그가 늘어남
  - 규칙이 복잡해질수록 프론트가 비대해짐
- 백엔드에서 처리하면:
  - 규칙 해석이 한 군데에 모여 유지보수 쉬움
  - 테스트로 신뢰도 확보 가능

#### 규칙 타입 이해하기

**1. WEEKDAY (요일 기반)**
- 예: "월, 목" → 매주 월요일과 목요일
- DB 저장: `rule_type=WEEKDAY`, `weekdays=MON,THU`

**2. NTH_WEEKDAY (주차 기반)**
- 예: "2,4주 금" → 매월 2주차와 4주차 금요일
- DB 저장: `rule_type=NTH_WEEKDAY`, `weekdays=FRI`, `nth_weeks=2,4`

**구현 예시**
```java
@Service
public class CalendarService {
    public List<CalendarEvent> generateEvents(
        CollectionRule rule, 
        LocalDate from, 
        LocalDate to
    ) {
        List<CalendarEvent> events = new ArrayList<>();
        
        if (rule.getRuleType() == RuleType.WEEKDAY) {
            // 요일 기반 처리
            String[] weekdays = rule.getWeekdays().split(",");
            LocalDate current = from;
            while (!current.isAfter(to)) {
                DayOfWeek dayOfWeek = current.getDayOfWeek();
                if (containsWeekday(weekdays, dayOfWeek)) {
                    events.add(new CalendarEvent(current, rule.getWasteType()));
                }
                current = current.plusDays(1);
            }
        } else if (rule.getRuleType() == RuleType.NTH_WEEKDAY) {
            // 주차 기반 처리
            String[] weekdays = rule.getWeekdays().split(",");
            String[] nthWeeks = rule.getNthWeeks().split(",");
            // ... 복잡한 로직
        }
        
        return events;
    }
    
    private int getWeekOfMonth(LocalDate date) {
        // 해당 날짜가 그 달의 몇 번째 주인지 계산
        // 예: 2026-01-10 → 2주차
    }
}
```

**테스트 작성 (중요!)**
```java
@Test
void testNthWeekdayRule() {
    // Given: "2,4주 금" 규칙
    CollectionRule rule = new CollectionRule();
    rule.setRuleType(RuleType.NTH_WEEKDAY);
    rule.setWeekdays("FRI");
    rule.setNthWeeks("2,4");
    
    // When: 2026년 1월 캘린더 생성
    LocalDate from = LocalDate.of(2026, 1, 1);
    LocalDate to = LocalDate.of(2026, 1, 31);
    List<CalendarEvent> events = calendarService.generateEvents(rule, from, to);
    
    // Then: 1월 10일(2주차 금), 1월 24일(4주차 금)만 포함되어야 함
    assertThat(events).hasSize(2);
    assertThat(events.get(0).getDate()).isEqualTo(LocalDate.of(2026, 1, 10));
    assertThat(events.get(1).getDate()).isEqualTo(LocalDate.of(2026, 1, 24));
}
```

**왜 테스트를 작성하나요?**
- 주차 계산 로직은 복잡하고 버그가 나기 쉽습니다.
- 테스트가 있으면 나중에 수정할 때 안전합니다.

### 2.2 캘린더 API 구현

#### 필수 API

**1. 수거 규칙 조회**
```
GET /api/collection/rules?addressId=1
```

**응답 예시**
```json
{
  "data": [
    {
      "wasteType": "BURNABLE",
      "ruleType": "WEEKDAY",
      "weekdays": "MON,THU"
    },
    {
      "wasteType": "NON_BURNABLE",
      "ruleType": "NTH_WEEKDAY",
      "weekdays": "FRI",
      "nthWeeks": "2,4"
    }
  ]
}
```

**2. 캘린더 이벤트 조회 (핵심!)**
```
GET /api/collection/calendar?addressId=1&from=2026-01-01&to=2026-01-31
```

**응답 예시 (FullCalendar 형식)**
```json
{
  "data": [
    {
      "id": "1",
      "title": "가연성 쓰레기",
      "start": "2026-01-06",
      "allDay": true,
      "extendedProps": {
        "wasteType": "BURNABLE"
      }
    },
    {
      "id": "2",
      "title": "불연성 쓰레기",
      "start": "2026-01-10",
      "allDay": true,
      "extendedProps": {
        "wasteType": "NON_BURNABLE"
      }
    }
  ]
}
```

**구현 단계**
1. 사용자 주소로 `area` 찾기
2. 해당 `area`의 `collection_rules` 조회
3. 각 규칙을 실제 날짜 이벤트로 변환
4. FullCalendar 형식으로 변환하여 반환

**DTO 설계**
```java
public class CalendarEventResponse {
    private String id;
    private String title;
    private LocalDate start;
    private boolean allDay = true;
    private ExtendedProps extendedProps;
    
    @Data
    public static class ExtendedProps {
        private String wasteType;
    }
}
```

**왜 FullCalendar 형식으로 반환하나요?**
- 프론트엔드에서 바로 사용할 수 있어 작업량이 줄어듭니다.
- API 스펙을 합의하면 프론트와 백엔드가 병렬로 작업할 수 있습니다.

### 2.3 지도 조회용 임시 API 제공

#### 목적
- W2~W3에서는 지도에 핀을 표시하기 위한 **조회-only** API만 제공합니다.
- 실제 게시판 데이터가 없어도 더미 데이터로라도 반환합니다.
- **왜 이렇게 하나요?**: 지도 UI를 먼저 완성하고, W4~W5에 실제 데이터로 교체합니다.

#### 필수 API

**주변 나눔 물품 조회 (임시)**
```
GET /api/share-posts/nearby?lat=35.6812&lng=139.7671&radiusKm=5
```

**응답 예시 (더미 데이터)**
```json
{
  "data": [
    {
      "id": 1,
      "title": "냉장고 나눔합니다",
      "lat": 35.6812,
      "lng": 139.7671,
      "thumbnailUrl": "https://example.com/image1.jpg",
      "ward": "大田区"
    },
    {
      "id": 2,
      "title": "책상 무료 나눔",
      "lat": 35.6850,
      "lng": 139.7700,
      "thumbnailUrl": "https://example.com/image2.jpg",
      "ward": "大田区"
    }
  ]
}
```

**임시 구현 방법**
```java
@GetMapping("/api/share-posts/nearby")
public ResponseEntity<List<SharePostResponse>> getNearbyPosts(
    @RequestParam Double lat,
    @RequestParam Double lng,
    @RequestParam(defaultValue = "5") Double radiusKm
) {
    // TODO: W4에서 실제 DB 조회로 교체
    // 현재는 더미 데이터 반환
    List<SharePostResponse> dummyData = createDummyData(lat, lng);
    return ResponseEntity.ok(dummyData);
}

private List<SharePostResponse> createDummyData(Double lat, Double lng) {
    // 중심 좌표 주변에 랜덤하게 더미 핀 생성
    List<SharePostResponse> list = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        SharePostResponse post = new SharePostResponse();
        post.setId((long) i);
        post.setTitle("더미 나눔 물품 " + i);
        // 중심 좌표에서 약간씩 떨어진 위치
        post.setLat(lat + (Math.random() - 0.5) * 0.1);
        post.setLng(lng + (Math.random() - 0.5) * 0.1);
        list.add(post);
    }
    return list;
}
```

**왜 더미 데이터를 사용하나요?**
- 프론트엔드가 지도 UI를 먼저 개발할 수 있습니다.
- 게시판 기능이 없어도 서비스 형태를 보여줄 수 있습니다.

### 2.4 완료 기준

**검수 기준**
- [ ] "2,4주 금" 규칙이 달력에서 정확한 날짜로 표시됨
- [ ] 주소를 바꾸면 캘린더 이벤트가 즉시 변경됨
- [ ] 지도 nearby API가 더미 데이터라도 반환됨
- [ ] 캘린더 규칙 해석 로직에 대한 테스트 작성 완료

---

## W3 — 검색 완성 (02.09 ~ 02.15)

### 목표
- 품목 검색 API 구현 (지역 기반 필터링 포함)
- 지도 nearby API를 "주소 기반"으로 연결 개선

### 3.1 품목 검색 API

#### 필수 API

**품목 검색**
```
GET /api/items/search?q=냉장고&ward=大田区
```

**파라미터 설명**
- `q`: 검색어 (품목명)
- `ward`: 구 정보 (사용자 위치의 '구' 정보를 파라미터로 받아 해당 지역의 특이사항이나 분류 우선순위 반영)

**응답 예시**
```json
{
  "data": [
    {
      "id": 1,
      "nameKo": "냉장고",
      "nameJa": "冷蔵庫",
      "wasteType": "SODAI",
      "description": "대형폐기물로 처리해야 합니다. 구청에 신고 후 스티커를 붙여야 합니다.",
      "ward": "大田区",
      "wardSpecificNote": "오타구는 전화 신고 후 스티커를 구청에서 구매해야 합니다."
    }
  ]
}
```

#### 구현 방법

**1. 기본 검색 (LIKE 검색)**
```java
@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    @Query("SELECT i FROM Item i WHERE " +
           "i.nameKo LIKE %:keyword% OR " +
           "i.nameJa LIKE %:keyword% OR " +
           "i.exampleKeywords LIKE %:keyword%")
    List<Item> searchByKeyword(@Param("keyword") String keyword);
}
```

**2. 지역 기반 필터링 추가**
```java
@Service
public class ItemService {
    public List<ItemResponse> searchItems(String keyword, String ward) {
        // 1. 기본 검색
        List<Item> items = itemRepository.searchByKeyword(keyword);
        
        // 2. 지역별 특이사항 추가 (ward가 있으면)
        if (ward != null) {
            items = items.stream()
                .map(item -> enrichWithWardInfo(item, ward))
                .collect(Collectors.toList());
        }
        
        return items.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    private Item enrichWithWardInfo(Item item, String ward) {
        // ward별 특이사항을 item에 추가
        // 예: 오타구는 대형폐기물 신고 방법이 다름
        return item;
    }
}
```

**3. 인덱스 추가 (성능 최적화)**
```sql
CREATE INDEX idx_items_name_ko ON items(name_ko);
CREATE INDEX idx_items_name_ja ON items(name_ja);
CREATE INDEX idx_items_example_keywords ON items(example_keywords);
```

**왜 인덱스를 추가하나요?**
- 검색 속도가 빨라집니다.
- 데이터가 많아져도 성능이 유지됩니다.

#### 품목 상세 조회 API

```
GET /api/items/{id}
```

**응답 예시**
```json
{
  "data": {
    "id": 1,
    "nameKo": "냉장고",
    "nameJa": "冷蔵庫",
    "wasteType": "SODAI",
    "description": "대형폐기물로 처리해야 합니다...",
    "disposalMethod": "1. 구청에 전화 신고\n2. 스티커 구매\n3. 지정된 날짜에 배출",
    "caution": "냉매가 포함되어 있으므로 전문 업체에 의뢰하는 것을 권장합니다."
  }
}
```

### 3.2 지도 nearby API 개선

#### 목적
- W2에서는 단순히 좌표만 받았지만, W3에서는 사용자 주소를 기반으로 좌표를 계산합니다.

#### 구현 방법

**1. 주소에서 좌표 추출**
```java
@Service
public class MapService {
    public List<SharePostResponse> getNearbyPosts(Long addressId, Double radiusKm) {
        // 1. 주소 조회
        UserAddress address = addressRepository.findById(addressId)
            .orElseThrow(() -> new NotFoundException("주소를 찾을 수 없습니다"));
        
        // 2. 좌표 확인
        Double lat = address.getLat();
        Double lng = address.getLng();
        
        // 3. 좌표가 없으면 ward 중심 좌표 사용 (임시)
        if (lat == null || lng == null) {
            WardCenter center = getWardCenter(address.getWard());
            lat = center.getLat();
            lng = center.getLng();
        }
        
        // 4. nearby API 호출 (W2에서 만든 것 재사용)
        return sharePostService.getNearbyPosts(lat, lng, radiusKm);
    }
    
    private WardCenter getWardCenter(String ward) {
        // ward별 중심 좌표 매핑 (임시 데이터)
        Map<String, WardCenter> centers = Map.of(
            "大田区", new WardCenter(35.5614, 139.7164)
        );
        return centers.getOrDefault(ward, new WardCenter(35.6812, 139.7671));
    }
}
```

**2. 사용자 위치 허용 시 실제 좌표 사용**
```java
// 프론트엔드에서 위치 허용 시 lat/lng를 받아서 주소에 저장
PUT /api/users/me/addresses/{id}
{
  "lat": 35.6812,
  "lng": 139.7671
}
```

**왜 이렇게 하나요?**
- 사용자가 위치를 허용하면 정확한 좌표를 사용할 수 있습니다.
- 위치를 허용하지 않아도 ward 중심 좌표로 대략적인 결과를 보여줄 수 있습니다.

### 3.3 완료 기준

**검수 기준**
- [ ] 품목 검색 API가 정상 작동 (한국어/일본어 모두 검색 가능)
- [ ] 응답에 `wasteType`, `description`, `주의사항` 포함
- [ ] 지도 nearby API가 주소 기반으로 동작 (ward 중심 좌표 사용)

---

## W4 — 게시판(나눔 데이터 생성원) (02.16 ~ 02.22)

### 목표
- 게시판 CRUD API 구현
- 이미지 업로드 기능 구현
- 지역/카테고리 필터 구현

### 4.1 게시판 CRUD API

#### 필요한 Entity

**SharePost Entity**
```java
@Entity
@Table(name = "share_posts")
public class SharePost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    private ShareCategory category;  // FURNITURE, ELECTRONICS, ETC
    
    @Enumerated(EnumType.STRING)
    private ShareStatus status = ShareStatus.OPEN;  // OPEN, RESERVED, COMPLETED, DELETED
    
    private String prefecture;
    private String ward;
    private String town;
    
    private Double lat;  // 지도 핀용
    private Double lng;
    
    private String thumbnailUrl;
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<SharePostImage> images = new ArrayList<>();
}
```

**SharePostImage Entity**
```java
@Entity
@Table(name = "share_post_images")
public class SharePostImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private SharePost post;
    
    private String imageUrl;
    private Integer sortOrder;
}
```

#### 필수 API

**1. 게시글 등록**
```
POST /api/share-posts
Content-Type: multipart/form-data

title: 냉장고 나눔합니다
content: 사용하지 않는 냉장고를 나눔합니다.
category: FURNITURE
lat: 35.6812
lng: 139.7671
images: [파일1, 파일2, ...]
```

**구현 포인트**
- 현재 로그인한 사용자 정보는 SecurityContext에서 가져옵니다.
- 이미지는 multipart/form-data로 받습니다.
- 이미지 업로드는 별도 서비스로 분리하는 것을 권장합니다.

**2. 게시글 목록 조회**
```
GET /api/share-posts?ward=大田区&status=OPEN&page=0&size=20
```

**파라미터 설명**
- `ward`: 구 필터 (사용자 대표 주소 기반 자동 필터)
- `status`: 상태 필터 (OPEN, RESERVED, COMPLETED)
- `page`, `size`: 페이지네이션

**응답 예시**
```json
{
  "data": [
    {
      "id": 1,
      "title": "냉장고 나눔합니다",
      "thumbnailUrl": "https://...",
      "ward": "大田区",
      "status": "OPEN",
      "createdAt": "2026-02-16T10:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 0,
    "size": 20
  }
}
```

**3. 게시글 상세 조회**
```
GET /api/share-posts/{id}
```

**4. 게시글 수정**
```
PUT /api/share-posts/{id}
```

**권한 체크**: 작성자만 수정 가능

**5. 게시글 삭제 (Soft Delete)**
```
DELETE /api/share-posts/{id}
```

**구현 포인트**
- 실제로 삭제하지 않고 `status=DELETED`로 변경합니다.
- **왜 Soft Delete를 사용하나요?**: 나중에 복구하거나 분쟁 대응이 가능합니다.

### 4.2 이미지 업로드 기능

#### 이미지 저장 방식 선택

**1안: S3 (AWS)**
- 장점: 확장성 좋음, CDN 연동 가능
- 단점: 비용 발생, AWS 계정 필요

**2안: Cloudinary**
- 장점: 이미지 최적화 자동, 무료 플랜 있음
- 단점: 외부 서비스 의존

**3안: 로컬/MinIO (개발용)**
- 장점: 비용 없음, 빠른 개발
- 단점: 프로덕션에는 부적합

**권장**: 개발 환경은 MinIO, 프로덕션은 S3 또는 Cloudinary

#### 구현 방법

**1. 이미지 업로드 서비스**
```java
@Service
public class ImageUploadService {
    public String uploadImage(MultipartFile file) {
        // 1. 파일 검증 (크기, 확장자)
        validateImage(file);
        
        // 2. 파일명 생성 (UUID 사용)
        String fileName = UUID.randomUUID().toString() + ".jpg";
        
        // 3. S3/MinIO에 업로드
        String url = s3Client.upload(file, fileName);
        
        return url;
    }
    
    private void validateImage(MultipartFile file) {
        if (file.getSize() > 5 * 1024 * 1024) {  // 5MB 제한
            throw new ValidationException("이미지 크기는 5MB 이하여야 합니다");
        }
        // 확장자 검증
    }
}
```

**2. 게시글 등록 시 이미지 처리**
```java
@PostMapping("/api/share-posts")
public ResponseEntity<SharePostResponse> createPost(
    @RequestPart("data") SharePostRequest request,
    @RequestPart("images") List<MultipartFile> images
) {
    // 1. 이미지 업로드
    List<String> imageUrls = images.stream()
        .map(imageUploadService::uploadImage)
        .collect(Collectors.toList());
    
    // 2. 게시글 저장
    SharePost post = sharePostService.create(request, imageUrls);
    
    return ResponseEntity.ok(toResponse(post));
}
```

### 4.3 완료 기준

**검수 기준**
- [ ] 게시글 등록/조회/수정/삭제 정상 작동
- [ ] 이미지 1~5장 업로드 가능, 썸네일 노출
- [ ] 게시글에 lat/lng 저장 (또는 게시글 작성 시 지도에서 위치 선택)
- [ ] 지역/카테고리 필터 정상 작동

---

## W5 — 채팅(텍스트) + 지도 고도화 (02.23 ~ 03.01)

### 목표
- 채팅 API 구현 (WebSocket, 텍스트만)
- nearby API를 게시판 데이터 기반으로 고도화

### 5.1 채팅 API 구현

#### WebSocket vs Firebase 선택

**WebSocket (Spring STOMP) - 권장**
- 장점: Spring만으로 구현 가능, 서버 제어 가능
- 단점: 확장 시 복잡 (여러 서버 간 메시지 공유 필요)

**Firebase**
- 장점: 확장 쉬움, 푸시 알림 내장
- 단점: 외부 서비스 의존, 비용 발생 가능

**권장**: 초기에는 WebSocket으로 시작, 나중에 필요하면 Firebase로 전환

#### WebSocket 구현 방법

**1. WebSocket 설정**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");  // 구독 경로
        config.setApplicationDestinationPrefixes("/app");  // 메시지 전송 경로
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();  // SockJS 지원 (폴백)
    }
}
```

**2. 채팅방 생성/조회 API**
```
POST /api/chat/rooms
{
  "postId": 1,
  "buyerId": 2
}
```

**3. 메시지 전송 (WebSocket)**
```java
@MessageMapping("/messages")
@SendTo("/topic/rooms/{roomId}")
public ChatMessage sendMessage(ChatMessage message) {
    // 1. 메시지 저장
    chatMessageRepository.save(message);
    
    // 2. 구독자에게 브로드캐스트
    return message;
}
```

**4. 메시지 조회 API (히스토리)**
```
GET /api/chat/rooms/{id}/messages?page=0&size=50
```

**구현 포인트**
- 새로고침 후에도 대화 기록을 조회할 수 있어야 합니다.
- 메시지는 DB에 저장합니다.

**5. 채팅방 목록 조회**
```
GET /api/chat/rooms
```

**응답 예시**
```json
{
  "data": [
    {
      "id": 1,
      "postId": 1,
      "postTitle": "냉장고 나눔합니다",
      "otherUser": {
        "id": 2,
        "nickname": "사용자2"
      },
      "lastMessage": "안녕하세요",
      "lastMessageAt": "2026-02-23T10:00:00Z",
      "unreadCount": 2
    }
  ]
}
```

### 5.2 지도 nearby API 고도화

#### 목적
- W2~W3의 더미 데이터를 실제 게시판 데이터로 교체합니다.
- 반경 검색/정렬/페이지네이션을 추가합니다.

#### 구현 방법

**1. 반경 검색 구현**
```java
@Repository
public interface SharePostRepository extends JpaRepository<SharePost, Long> {
    @Query(value = "SELECT * FROM share_posts WHERE " +
           "status = 'OPEN' AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(lat)) * " +
           "cos(radians(lng) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(lat)))) <= :radiusKm",
           nativeQuery = true)
    List<SharePost> findNearbyPosts(
        @Param("lat") Double lat,
        @Param("lng") Double lng,
        @Param("radiusKm") Double radiusKm
    );
}
```

**2. 정렬 및 페이지네이션 추가**
```java
@Service
public class SharePostService {
    public Page<SharePostResponse> getNearbyPosts(
        Double lat, Double lng, Double radiusKm,
        String sortBy, Pageable pageable
    ) {
        // 1. 반경 내 게시글 조회
        List<SharePost> posts = sharePostRepository.findNearbyPosts(lat, lng, radiusKm);
        
        // 2. 정렬 (거리순, 최신순 등)
        if ("distance".equals(sortBy)) {
            posts = sortByDistance(posts, lat, lng);
        } else if ("latest".equals(sortBy)) {
            posts = sortByLatest(posts);
        }
        
        // 3. 페이지네이션
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), posts.size());
        List<SharePost> pagedPosts = posts.subList(start, end);
        
        return new PageImpl<>(
            pagedPosts.stream().map(this::toResponse).collect(Collectors.toList()),
            pageable,
            posts.size()
        );
    }
}
```

**3. API 개선**
```
GET /api/share-posts/nearby?lat=35.6812&lng=139.7671&radiusKm=5&sortBy=distance&page=0&size=20
```

### 5.3 완료 기준

**검수 기준**
- [ ] 채팅 메시지가 실시간으로 전송/수신됨
- [ ] 새로고침 후에도 대화 기록 조회 가능
- [ ] nearby API가 실제 게시판 데이터를 반환
- [ ] 반경 검색/정렬/페이지네이션 정상 작동

---

## W6 — 폴리싱/발표 (03.02 ~ 03.10)

### 목표
- 개발 중단 (기능 추가 금지)
- 통합 테스트/버그 픽스
- API 안정화

### 6.1 통합 테스트

#### 테스트 작성 포인트
- 주요 API 엔드포인트 테스트
- 인증/인가 테스트
- 에러 케이스 테스트

**예시**
```java
@SpringBootTest
@AutoConfigureMockMvc
class SharePostApiTest {
    @Test
    void testCreatePost() throws Exception {
        // Given: 인증된 사용자
        String token = getAuthToken();
        
        // When: 게시글 등록
        mockMvc.perform(post("/api/share-posts")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .param("title", "테스트 게시글")
            // ...
        )
        // Then: 201 Created
        .andExpect(status().isCreated());
    }
}
```

### 6.2 버그 픽스

#### 체크리스트
- [ ] 메모리 누수 확인
- [ ] N+1 쿼리 문제 해결
- [ ] 트랜잭션 처리 확인
- [ ] 예외 처리 완성

### 6.3 API 안정화

#### 포인트
- 응답 시간 최적화
- 에러 메시지 명확화
- 로깅 추가

---

## 2. 프론트/백이 "같이" 맞춰야 하는 계약

### 2.1 WasteType 코드 표준(강제)

**백엔드 enum**
```java
public enum WasteType {
    BURNABLE,      // 가연성
    NON_BURNABLE,  // 불연성
    PLASTIC,       // 플라스틱
    CAN_BOTTLE,    // 병/캔
    PAPER          // 종이
}
```

**프론트엔드 매핑**
- 이 값을 기준으로 라벨(한/일/영), 아이콘, 색상을 매핑합니다.
- **왜 이렇게 하나요?**: 백엔드에서 변경하면 프론트도 자동으로 반영됩니다.

### 2.2 캘린더 이벤트 응답 포맷

**FullCalendar 형식**
```json
{
  "id": "1",
  "title": "가연성 쓰레기",
  "start": "2026-01-06",
  "allDay": true,
  "extendedProps": {
    "wasteType": "BURNABLE"
  }
}
```

**왜 이 형식을 사용하나요?**
- FullCalendar에 바로 사용할 수 있어 프론트 작업량이 줄어듭니다.
- API 스펙을 합의하면 프론트와 백엔드가 병렬로 작업할 수 있습니다.

### 2.3 에러 코드 규약

**에러 코드 예시**
- `AUTH_001`: 토큰 만료
- `AUTH_002`: 인증 실패
- `AREA_404`: 지역 매칭 실패
- `ITEM_404`: 품목을 찾을 수 없음

**프론트엔드 처리**
- 에러 코드에 따라 다른 UX를 제공할 수 있습니다.
- 예: `AUTH_001` → 로그인 페이지로 리다이렉트

---

## 3. 병렬 개발 전략

### 3.1 Swagger 스펙 먼저 정의

**절차**
1. 백엔드가 Swagger로 API 스펙 정의
2. 프론트는 MSW(Mock Service Worker)로 Mock API 구현
3. 백엔드 API 완성 후 MSW 제거

**왜 이렇게 하나요?**
- 프론트와 백엔드가 병렬로 작업할 수 있어 일정이 단축됩니다.

### 3.2 Seed 데이터 자동화

**원칙**
- 엑셀을 수동으로 DB에 넣으면 반드시 삐끗합니다.
- "CSV Export → Import 스크립트 → 재실행 가능"이 정답입니다.

**구현**
- `@PostConstruct` 또는 별도 CommandLineRunner로 구현
- 재실행 가능하게 만들기 (Idempotent)

---

## 4. 기능별 권장 담당 분배

- **Backend A**: Auth/User/Address + Security
- **Backend B**: Area/CollectionRule/Calendar API + Seed
- **공동**: Share Posts(게시판) CRUD, 이미지 업로드 파이프라인

---

## 5. "초기부터 넣으면 망가지는" 요소(후순위로 밀기)

- 완벽한 다국어(i18n) 전체 적용
- Refresh Token + 다중 디바이스 세션 관리
- 대형폐기물 수수료 계산기(REQ-05)
- 행정 링크(REQ-06)
- 제보/검수 프로세스(REQ-07)
- 수거일 알림(REQ-11)
- 키워드 알림(REQ-12)

> **우선순위**: 먼저 W3까지 "지역→캘린더", "검색→가이드", "지도 핀(조회-only)" 3개를 확실히 만들고,  
> W4~W5에 게시판/채팅을 붙여서 확장합니다.

---

## 부록: 각 주차별 백엔드 체크리스트

### W1 체크리스트
- [ ] 프로젝트 세팅, JWT 인증, `users` 테이블
- [ ] `user_addresses` CRUD API
- [ ] Seed 파이프라인(엑셀→CSV→DB) 구축
- [ ] Swagger로 API 계약 공개

### W2 체크리스트
- [ ] 캘린더 규칙 해석 엔진(WEEKDAY, NTH_WEEKDAY) + 테스트
- [ ] `/api/collection/calendar` 완성
- [ ] 지도 조회용 임시 API 제공(nearby READ-only, 더미 데이터 가능)

### W3 체크리스트
- [ ] `items` 검색 API (`q + ward`)
- [ ] 지도 nearby API를 "주소 기반"으로 연결 개선

### W4 체크리스트
- [ ] `share_posts`, `share_post_images` + CRUD
- [ ] 지역/카테고리 필터 + 상태값(OPEN/RESERVED/COMPLETED)
- [ ] 업로드 URL 저장 방식 확정(S3/Cloudinary)

### W5 체크리스트
- [ ] 채팅(WebSocket, TEXT only)
- [ ] nearby API를 게시판 데이터 기반으로 고도화

### W6 체크리스트
- [ ] 통합 테스트/버그 픽스
- [ ] API 안정화

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

