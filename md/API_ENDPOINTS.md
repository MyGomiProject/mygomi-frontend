# API 엔드포인트 요약 (React Native 연동용)

앱에서 백엔드와 연동할 때 **엔드포인트·헤더·Request Body**만 빠르게 참고하는 문서입니다.  
Base URL은 환경 변수로 두고 (예: `EXPO_PUBLIC_API_URL`), 인증이 필요한 API는 **모두 `Authorization: Bearer {accessToken}`** 를 붙입니다.

---

## 공통

| 항목 | 값 |
|------|-----|
| **Base URL** | `http://localhost:8080` (개발) / 앱에서는 env로 설정 |
| **인증** | `Authorization: Bearer {accessToken}` |
| **JSON 요청** | `Content-Type: application/json` (기본) |

---

## 1. 인증 (auth)

### POST `/api/auth/signup`
- **인증**: 불필요
- **Body (JSON)**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "사용자닉네임"
}
```
- **필수 필드**: `email`, `password`, `nickname`

### POST `/api/auth/login`
- **인증**: 불필요
- **Body (JSON)**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **응답**: `data.accessToken`, `data.userId` 사용. 토큰 저장 후 이후 요청에 Bearer로 넣기.

---

## 2. 사용자 (user)

### GET `/api/users/me`
- **인증**: 필요 (Bearer)
- **Body**: 없음
- **응답**: `id`, `email`, `nickname`, `addresses[]` 등 (또는 `data` 래핑)

### PUT `/api/users/me`
- **인증**: 필요
- **Body (JSON)**: `Partial<User>` (예: `nickname`, `role` 등 수정 필드만)

### PATCH `/api/users/me/nickname`
- **인증**: 필요
- **Body (JSON)**:
```json
{ "nickname": "새닉네임" }
```

### PATCH `/api/users/me/password`
- **인증**: 필요
- **Body (JSON)**:
```json
{
  "currentPassword": "현재비밀번호",
  "newPassword": "새비밀번호"
}
```

---

## 3. 주소 (address)

### GET `/api/user-addresses`
- **인증**: 필요
- **Body**: 없음
- **응답**: 배열 (또는 `data` 래핑). 항목: `id`, `fullAddress`, `isPrimary`, `areaId`, `lat`, `lng` 등

### POST `/api/user-addresses`
- **인증**: 필요
- **Body (JSON)**:
```json
{
  "prefecture": "도쿄도",
  "ward": "아라카와",
  "town": "히가시닛포리",
  "chome": "6",
  "banchi": "22-24",
  "lat": 35.7325,
  "lng": 139.7733,
  "isPrimary": true
}
```
- **필수**: `prefecture`, `ward` (나머지는 선택)

### PUT `/api/user-addresses/{id}`
- **인증**: 필요
- **Path**: `id` = 주소 ID
- **Body (JSON)**: 수정할 필드만 (위와 동일 키)

### DELETE `/api/user-addresses/{id}`
- **인증**: 필요
- **Body**: 없음

### PATCH `/api/user-addresses/{id}/primary`
- **인증**: 필요
- **Body**: 없음 (해당 주소를 대표로 설정)

---

## 4. 수거 일정 (calendar / schedules)

### GET `/api/schedules`
- **인증**: 필요 (주소는 토큰 기반으로 처리된다고 가정)
- **Query**: `year` (숫자), `month` (숫자)
- **예**: `GET /api/schedules?year=2026&month=3`
- **Body**: 없음
- **응답**: `data` 배열. 항목: `id`, `title`, `start` (YYYY-MM-DD), `allDay`, `extendedProps.wasteType` 등

---

## 5. 품목 검색 (items)

### GET `/api/items/search` (로그인 사용자)
- **인증**: 필요
- **Query**: `keyword` (검색어)
- **예**: `GET /api/items/search?keyword=플라스틱`

### GET `/api/items/guest/search` (비로그인)
- **인증**: 불필요
- **Query**: `keyword`, `ward`
- **예**: `GET /api/items/guest/search?keyword=플라스틱&ward=미나토구`

---

## 6. 지역 검색 (areas)

### GET `/api/areas/search`
- **인증**: 필요할 수 있음 (프로젝트에 따라)
- **Query**: `prefecture`, `ward`, (선택) `town`, `chome`, `banchi`
- **예**: `GET /api/areas/search?prefecture=도쿄도&ward=오타구&town=이케가미`

---

## 7. 나눔 게시글 (share-posts)

### GET `/api/share-posts`
- **인증**: 필요할 수 있음
- **Query**: `ward`, `status` (OPEN|RESERVED|COMPLETED|DELETED), `page`, `size`
- **예**: `GET /api/share-posts?ward=미나토구&status=OPEN&page=0&size=20`
- **Body**: 없음

### GET `/api/share-posts/{id}`
- **인증**: 불필요(읽기)
- **Path**: `id` = 게시글 ID
- **Body**: 없음

### POST `/api/share-posts`
- **인증**: 필요
- **Content-Type**: `multipart/form-data`
- **Body (FormData)**:
  - `request`: JSON 문자열 (Blob). 내용:
    ```json
    {
      "title": "제목",
      "description": "내용",
      "category": "FURNITURE",
      "lat": 35.65,
      "lng": 139.75,
      "prefecture": "도쿄도",
      "ward": "미나토구",
      "town": "롯폰기"
    }
    ```
  - `images`: 파일 1개 이상 (필드명 `images`로 동일하게 여러 개 추가)
- **category**: `FURNITURE` | `ELECTRONICS` | `CLOTHING` | `BOOKS` | `TOYS` | `KITCHEN` | `ETC`

### PUT `/api/share-posts/{id}`
- **인증**: 필요
- **Content-Type**: `multipart/form-data`
- **Body**: `title`, `content`, `category`, `lat`, `lng`, `prefecture`, `ward`, `town`, `images` (선택) 등을 FormData 필드로 전송

### PATCH `/api/share-posts/{id}/status?status={status}`
- **인증**: 필요
- **Query**: `status` = `OPEN` | `RESERVED` | `COMPLETED` | `DELETED`
- **Body**: 없음

### DELETE `/api/share-posts/{id}`
- **인증**: 필요
- **Body**: 없음

### GET `/api/share-posts/me`
- **인증**: 필요
- **Query**: `page`, `size`
- **Body**: 없음 (내가 쓴 글 목록)

### GET `/api/share-posts/nearby/me`
- **인증**: 필요 (대표 주소 기반 근처 글)
- **Query**: `page`, `size`, (선택) `status`
- **Body**: 없음
- **응답**: `data.content` 배열 + `data.totalElements`, `data.size`, `data.number` 등 (Spring Page 형태일 수 있음)

---

## 8. 채팅 (chat)

### POST `/api/chat/room?sharePostId={postId}`
- **인증**: 필요
- **Query**: `sharePostId` = 나눔 게시글 ID
- **Body**: 없음
- **응답**: `roomId` (숫자)

### GET `/api/chat/rooms`
- **인증**: 필요
- **Body**: 없음
- **응답**: 배열. 항목: `roomId`, `postTitle`, `opponentNickname`, `sharePostId` 등

### GET `/api/chat/room/{roomId}/messages`
- **인증**: 필요
- **Path**: `roomId` = 채팅방 ID
- **Body**: 없음
- **응답**: 메시지 배열 (`messageId`, `senderEmail`, `message`, `sendTime` 등)

---

## 9. 나눔 예약 (reservation)

### GET `/api/share-posts/{postId}/reservation/status?roomId={roomId}`
- **인증**: 필요
- **Path**: `postId` = 게시글 ID
- **Query**: `roomId` = 채팅방 ID (필수)
- **Body**: 없음

### POST `/api/share-posts/{postId}/reservation/agree?roomId={roomId}`
- **인증**: 필요
- **Path**: `postId`
- **Query**: `roomId` (필수)
- **Body**: 빈 객체 `{}` 또는 없음

---

## 10. 신고/제보 (reports)

### GET `/api/reports/reasons`
- **인증**: 필요할 수 있음
- **Body**: 없음 (게시글 신고 사유 목록)

### POST `/api/reports/share-posts/{postId}`
- **인증**: 필요
- **Path**: `postId` = 신고 대상 게시글 ID
- **Body (JSON)**:
```json
{
  "reason": "FAKE_POST",
  "title": "신고 제목",
  "content": "상세 사유",
  "emailReply": false,
  "reporterEmail": "reply@example.com"
}
```
- **reason**: `FAKE_POST` | `SPAM` | `INAPPROPRIATE` | `OFFENSIVE` | `COPYRIGHT` | `PRIVACY` | `OTHER` 등
- **emailReply** true일 때 `reporterEmail` 권장

### POST `/api/reports/info`
- **인증**: 필요할 수 있음
- **Content-Type**: `multipart/form-data`
- **Body (FormData)**:
  - `data`: JSON 문자열(Blob). 예:
    ```json
    {
      "reason": "WRONG_INFO",
      "title": "[정보오류] 품목명 배출 정보 수정 요청",
      "content": "상세 내용",
      "emailReply": false,
      "reporterEmail": ""
    }
    ```
  - `file`: (선택) 첨부 파일 1개, 최대 10MB

---

## 앱 연동 체크리스트

1. **Base URL**: `EXPO_PUBLIC_API_URL` 등으로 설정. 실기기 테스트 시 `http://PC_IP:8080` 사용.
2. **모든 인증 API**: 요청 전에 `Authorization: Bearer {저장한 accessToken}` 설정.
3. **로그인 응답**: `accessToken`을 AsyncStorage 등에 저장하고, 이후 요청 헤더에 동일하게 넣기.
4. **나눔 글 작성**: `multipart/form-data` + `request`(JSON Blob) + `images`(파일들).
5. **정보 제보**: `multipart/form-data` + `data`(JSON Blob) + `file`(선택).
6. **캘린더**: 로그인된 사용자 주소 기준이면 토큰만 보내고, `year`, `month` 쿼리만 넣기.

이 문서만 보고 앱에서 동일한 URL·헤더·Body로 요청하면 됩니다.
