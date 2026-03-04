# 참조 문서 — RN 개발 시 함께 보면 좋은 문서들

React Native 앱을 만들 때 **이 레포의 다른 문서**를 함께 참고하면 도메인·API·기존 Web 구현을 그대로 맞출 수 있습니다.

---

## 1. 도메인·일정·협업 (필수 참고)

| 문서 | 경로 | 용도 |
|------|------|------|
| **초기 개발 가이드** | [md/guide.md](../guide.md) | 도메인 설계(Entity/DB), API 구조, 6주 타임라인, REQ–테이블 매핑, 협업 규칙. RN에서도 **같은 API·같은 비즈니스 규칙**을 쓰므로 한 번씩 훑어두면 좋음. |

---

## 2. API 명세 (연동 시 참고)

| 문서 | 경로 | 용도 |
|------|------|------|
| **API 참조** | [md/API_REFERENCE.md](../API_REFERENCE.md) | 인증/사용자/주소/수거일정 등 백엔드 API 전체 목록, 요청/응답 예시, Base URL·인증 방식. RN의 `api/client` baseURL·헤더 설정 시 참고. |
| **프론트 API 문서** | [md/FRONTEND_API_DOCS.md](../FRONTEND_API_DOCS.md) | 프론트에서 실제로 쓰는 API 정리. |
| **API 상세 비교표** | [md/API_상세_비교표.md](../API_상세_비교표.md) | 엔드포인트별 상세 비교가 필요할 때. |

---

## 3. 기능별 가이드 (해당 기능 구현 시)

| 문서 | 경로 | 용도 |
|------|------|------|
| **채팅 프론트 가이드** | [md/CHAT_FRONTEND_GUIDE.md](../CHAT_FRONTEND_GUIDE.md) | WebSocket/STOMP 채팅 플로우, 메시지 형식. RN에서 채팅 구현할 때 동일 프로토콜·API 맞추기. |
| **나눔 예약 API** | [md/나눔_예약_API_수정요청_백엔드.md](../나눔_예약_API_수정요청_백엔드.md), [나눔_예약_동의_백엔드_명세.md](../나눔_예약_동의_백엔드_명세.md) | 나눔·예약 관련 API/플로우. |

---

## 4. Web 프론트 참고 (RN 대응 시)

| 문서 | 경로 | 용도 |
|------|------|------|
| **프론트엔드 라이브러리** | [md/frontend_libraries.md](../frontend_libraries.md) | Web에서 쓰는 라이브러리 상세(React Router, FullCalendar, Leaflet, STOMP 등). RN에서는 [02-libraries-and-setup.md](./02-libraries-and-setup.md)에서 대응 패키지로 매핑해 두었음. |

---

## 5. RN 전용 문서만 보는 경우

- **폴더·파일 배치** → [01-folder-structure.md](./01-folder-structure.md)
- **패키지·API 클라이언트·Auth·저장소** → [02-libraries-and-setup.md](./02-libraries-and-setup.md)
- **디자인·테마·스타일** → [03-design-tokens-and-styles.md](./03-design-tokens-and-styles.md)
- **환경 변수·API 연동** → [04-environment-and-api.md](./04-environment-and-api.md)

도메인·API 규칙을 맞추려면 **guide.md**와 **API_REFERENCE.md**를, 채팅을 구현할 때는 **CHAT_FRONTEND_GUIDE.md**를 함께 보는 것을 권장합니다.
