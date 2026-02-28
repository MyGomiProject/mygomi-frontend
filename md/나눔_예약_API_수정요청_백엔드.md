# 나눔 예약 API 수정 요청 (프론트엔드 연동 기준)

## 1. 개요

채팅방 내 "예약하기" 기능 연동 중 아래 세 가지가 확인되었습니다.  
동일한 채팅방(roomId)의 **두 참여자 모두** 예약 상태 조회·동의가 가능하고, 두 명이 모두 동의하면 게시글 상태가 RESERVED로 바뀌어야 합니다.

---

## 2. 수정 요청 사항

### 2-0. 같은 게시글이면 같은 roomId (채팅방 생성/조회)

**현상**
- 같은 게시글(postId 19)에 대해 **먼저 채팅·요청 보낸 사람**은 `roomId=10` 으로 조회
- **나중에 채팅방 들어간 사람**(게시글 주인)은 `roomId=11` 로 조회
- Network 상으로 **같은 대화인데 roomId가 10 / 11 로 다름**

**필요한 동작**
- **같은 postId(게시글) + 같은 두 참여자**면 **항상 같은 roomId**를 써야 합니다.
- `POST /api/chat/room?sharePostId={postId}` 호출 시:
  - 이 게시글에 대해 **이미 이 두 사용자끼리의 방이 있으면** → **그 방의 roomId를 그대로 반환**
  - 없을 때만 새 방 생성 후 해당 roomId 반환  
- 그래야 두 사용자 모두 **동일한 roomId**로 예약 상태를 조회·동의할 수 있고, 2-2(방 단위 동일 응답)도 의미가 있습니다.  
- 지금처럼 참여자마다 서로 다른 roomId가 나오면, 예약 동의/상태가 방마다 따로 쌓여서 한쪽만 예약 확정으로 보이는 문제가 납니다.

---

### 2-1. 예약 API 403 권한 (채팅 상대 아님)

**현상**
- 먼저 예약을 요청한 사람이 같은 채팅방으로 다시 들어왔을 때  
  `GET /api/share-posts/{postId}/reservation/status?roomId=7` 호출 시 **403 Forbidden** 발생
- 응답 메시지: `"해당 게시글의 채팅 상대가 아니어서 예약 동의 권한이 없습니다."`
- 프론트에서는 요청 시 **roomId=7**을 쿼리 파라미터로 정상 전달하고 있음.

**요청**
- **roomId로 조회한 "해당 채팅방 참여자 두 명"** 모두에게 예약 API 접근을 허용해 주세요.
  - 글 작성자(나눔하는 사람)
  - 나눔 신청자(채팅을 건 사람)
- 즉, **현재 요청 사용자가 해당 roomId의 참여자이면**  
  `GET .../reservation/status?roomId=...` ,  
  `POST .../reservation/agree?roomId=...`  
  모두 **403을 내지 않고** 처리해 주시면 됩니다.

---

### 2-2. 예약 상태 조회 시 "방 단위" 동일 응답

**현상**
- **게시글 주인**: 예약 확정이 정상 표시됨 (`bothAgreed: true` 수신)
- **나눔 신청자**(먼저 채팅방을 연 사람, 먼저 예약 요청한 사람):  
  상대(게시글 주인)가 이미 수락했는데도 **"상대방의 요청을 기다린다"**로만 표시됨  
  → 동일 roomId인데 `otherAgreed: false`, `bothAgreed: false` 로만 내려옴
- 같은 채팅방인데 **누가 조회하느냐에 따라 다른 값**이 반환됨.

**요청**
- **같은 roomId에 대해** 두 참여자(게시글 주인 / 나눔 신청자)가 각각 호출할 때 **동일한 예약 상태**를 반환해 주세요.
  - 두 명 모두 동의한 이후에는  
    **게시글 주인도, 나눔 신청자도**  
    `otherAgreed: true`, `bothAgreed: true`  
    를 받아야 합니다.
  - "방(roomId) 단위로 합의 상태를 하나로 두고", **나눔 신청자가 GET status 호출해도** 글 작성자와 같은 값이 나오도록 수정이 필요합니다.

---

### 2-3. 두 명 동의 시 게시글 상태 RESERVED 반영

**현상**
- 두 명이 모두 예약 동의한 뒤에도  
  `GET .../reservation/status` 응답의 **postStatus**가 `"OPEN"`으로만 내려옴.
- 게시글 목록/상세에서도 해당 글의 나눔 상태가 "예약됨(RESERVED)"으로 바뀌지 않음.

**요청**
- **두 명 모두 동의한 시점**에 아래를 적용해 주세요.
  1. 해당 **share post의 status를 RESERVED로 업데이트**
  2. **예약 상태/동의 API 응답**에서 해당 post에 대해  
     `postStatus: "RESERVED"` 로 반환
  3. **게시글 목록·상세 API**에서도 해당 글의 **status**가 **RESERVED**로 내려가도록 유지

이렇게 하면 프론트에서 목록/채팅 화면 모두에서 "예약됨" 상태를 일관되게 표시할 수 있습니다.

---

## 3. 정리 (체크리스트)

| 구분 | 내용 | 확인 |
|------|------|------|
| **같은 방** | 같은 postId·같은 두 참여자면 createRoom 시 동일 roomId 반환 (2-0) | □ |
| 권한 | roomId 기준 채팅방 참여자 두 명 모두 status/agree 호출 허용 (403 제거) | □ |
| 상태 조회 | 같은 roomId면 두 참여자 모두 동일한 otherAgreed, bothAgreed 반환 | □ |
| 게시글 상태 | 두 명 동의 시 해당 post status를 RESERVED로 변경하고, API 응답에도 반영 | □ |

---

## 4. 참고 (프론트엔드 호출 방식)

- **채팅방 생성/참여**: `POST /api/chat/room?sharePostId={postId}`  
  - 채팅 열 때 호출 → **동일 게시글·동일 두 사람이면 같은 roomId가 반환되어야 함 (2-0)**
- **예약 상태 조회**: `GET /api/share-posts/{postId}/reservation/status?roomId={roomId}`  
  - 채팅방 진입 시 및 3초 간격 폴링 시 호출
- **예약 동의**: `POST /api/share-posts/{postId}/reservation/agree?roomId={roomId}`  
  - "예약하기" 버튼 클릭 시 호출
- postId, roomId는 채팅방 화면에서 사용 중인 값을 그대로 전달함.

---

이 문서를 백엔드 팀에 전달하시면, 위 세 가지를 기준으로 수정 요청하시면 됩니다.

---

## 5. 백엔드 구현 가이드 (2-2: 방 단위 동일 응답)

**지금 화면에서의 증상**
- **게시글 주인**: 채팅에서 "예약 확정됨" 잘 보임 ✅  
- **나눔 신청자**(먼저 채팅방을 연 사람): "상대방의 요청을 기다린다"만 보이고, 예약 확정이 안 보임 ❌  

→ 같은 roomId인데 **나눔 신청자가 GET status 할 때만** `otherAgreed: false`, `bothAgreed: false` 가 오는 상태로 보임.

**현재 응답 예 (나눔 신청자가 조회 시)**  
→ `{ myAgreed: true, otherAgreed: false, bothAgreed: false, postStatus: "OPEN" }`  
→ 상대(게시글 주인)가 이미 수락했는데도 `otherAgreed: false` 로 오고 있음.

**목표**  
같은 `roomId`로 조회하면 **요청자(먼저 예약한 사람 / 나중에 수락한 사람)와 관계없이**  
두 명 모두 동의한 상태라면 **같은 값**을 내려줘야 함.

### 5.1 GET status 처리 시 로직 제안

1. **roomId로 해당 채팅방 참여자 두 명 조회**  
   - 예: 채팅방(room) 테이블에서 roomId로 참여자 A, B 확인.

2. **이 방(postId + roomId)에 대한 “예약 동의” 건수 조회**  
   - 예: `share_post_reservation_agreement`(또는 동의 저장 테이블)에서  
     `room_id = roomId`(또는 postId + room 기준) 조건으로 **동의한 사용자 수**를 센다.  
   - 또는 “참여자 A가 동의했는지”, “참여자 B가 동의했는지” 각각 조회.

3. **방 단위로 합의 여부 결정**  
   - 참여자 **두 명 모두** 동의 레코드가 있으면 → **방 전체가 “둘 다 동의”** 상태.
   - 이때 **요청자가 A이든 B이든** 응답은 아래처럼 동일하게.

4. **응답 필드 계산**  
   - **myAgreed**  
     - 현재 로그인 사용자(요청자)가 이 방에 대해 동의했는지 여부.  
     - 위에서 조회한 “동의 테이블”에 요청자 userId가 있으면 `true`.  
   - **otherAgreed**  
     - “상대방이 동의했는지”가 아니라 **“이 방에서 나 말고 다른 한 명이 동의했는지”**로 계산.  
     - 즉, **방 참여자 중 한 명이라도 동의했고, 그 사람이 요청자가 아니면** `true`.  
     - 더 단순하게: **방 기준으로 동의한 사람이 2명이면** → `otherAgreed = true`, **1명이면** → `otherAgreed = false`.  
   - **bothAgreed**  
     - **방 참여자 2명 모두 동의했으면** `true`, 아니면 `false`.  
     - 위에서 센 “동의 건수 = 2” 또는 “A 동의 AND B 동의”이면 `true`.

5. **postStatus (2-3)**  
   - `bothAgreed === true` 이면 해당 share post의 status를 **RESERVED**로 업데이트한 뒤,  
     응답의 **postStatus**도 `"RESERVED"` 로 내려주기.

### 5.2 정리 (체크)

- `otherAgreed` / `bothAgreed` 는 **“현재 사용자 기준”**이 아니라 **“이 roomId(방) 기준”**으로 계산.
- 같은 roomId에 대해  
  - 동의한 사람이 2명이면 → 모든 요청자에게 `otherAgreed: true`, `bothAgreed: true`, `postStatus: "RESERVED"`.  
  - 1명이면 → `bothAgreed: false`, `otherAgreed: false`, `myAgreed`만 요청자에 따라 true/false.

이렇게 구현하면 먼저 예약한 사람이 조회해도 상대가 이미 수락한 경우 `otherAgreed: true`, `bothAgreed: true`가 내려갑니다.

### 5.3 확인 요청: 먼저 요청한 사람(나눔 신청자)이 조회할 때

**아직도 아래처럼 오는 경우가 있습니다.**

- **호출**: `GET /api/share-posts/19/reservation/status?roomId=...`  
  (나눔 신청자 = 먼저 예약 버튼 누른 사람이 호출)
- **현재 응답**:  
  `{ postId: 19, postStatus: "OPEN", myAgreed: true, otherAgreed: false, bothAgreed: false }`
- **상황**: 게시글 올린 사람은 이미 “예약하기”로 수락한 상태. 즉 **방 기준으로는 두 명 모두 동의 완료**.

**필요한 응답**  
위와 같은 roomId로 **나눔 신청자(먼저 요청한 사람)**가 조회해도,  
방에 동의한 사람이 2명이면 **글 작성자가 조회할 때와 동일하게**:

- `otherAgreed: true`
- `bothAgreed: true`
- `postStatus: "RESERVED"` (2-3 반영 시)

를 내려주셔야 합니다. **요청자가 글 작성자이든 나눔 신청자이든**, 같은 roomId면 **같은 로직(방 단위 동의 수)으로** otherAgreed / bothAgreed 를 계산해 주시면 됩니다.

---

**2-2, 2-3 백엔드 반영 후** 프론트는 동일 명세대로 연동됨(상태 조회·폴링·예약 확정 시 폴링 중단·목록 갱신).
