# 지도·캘린더·채팅 상세 (React Native)

Web의 Leaflet, FullCalendar, STOMP/채팅을 RN에서 어떻게 맞추는지 설정·권한·주의점을 정리합니다.

---

## 1. 지도 (react-native-maps)

### 1.1 설치·권한

```bash
npx expo install react-native-maps
```

- **iOS**: `app.json` 또는 `app.config.js`에 별도 설정 없이도 기본 지도 사용 가능. Google Maps 쓰려면 URL scheme 등 설정 필요.
- **Android**: Google Maps 사용 시 `google-maps-api-key`가 필요할 수 있음. Expo에서는 `app.json`의 `android.config.maps.apiKey`에 넣습니다.

```json
// app.json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_MAPS_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_MAPS_KEY"
      }
    }
  }
}
```

- **위치 권한**: “근처 나눔” 기준 위치를 쓰려면 `expo-location`으로 권한 요청 후 위도/경도를 지도와 API에 넘깁니다.

```bash
npx expo install expo-location
```

### 1.2 기본 사용 (마커·영역)

Web의 `Map.tsx`(Leaflet)와 같은 개념으로, 영역 중심·줌·마커 리스트를 state로 두고 렌더링합니다.

```tsx
// src/components/map/MapView.tsx
import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface PostMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  category?: string;
}

export default function SharingMapView({
  posts,
  initialRegion,
  onMarkerPress,
}: {
  posts: PostMarker[];
  initialRegion: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  onMarkerPress?: (id: string) => void;
}) {
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation
      >
        {posts.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            title={p.title}
            onPress={() => onMarkerPress?.(p.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 300 },
});
```

- **카테고리별 아이콘**: `Marker`의 `pinColor`(Android) 또는 `customMarker`/이미지로 구분 가능.
- **클러스터링**: 마커가 많을 때는 `react-native-maps-super-cluster` 같은 패키지로 묶을 수 있음.

### 1.3 주의점

- iOS 시뮬레이터: 기본 Apple Maps 사용.
- Android 에뮬레이터: Google Play 서비스 필요. API 키 없으면 회색 지도만 나올 수 있음.
- 실제 기기: 권한(위치 등) 거부 시 폴백(기본 좌표 등) 처리 필요.

---

## 2. 캘린더 (수거일 표시)

Web은 FullCalendar로 “월별 수거일”을 표시합니다. RN에서는 **react-native-calendars**로 같은 느낌을 낼 수 있습니다.

### 2.1 설치

```bash
npm install react-native-calendars
```

### 2.2 수거일 데이터와 매핑

- API: `GET /api/collection/calendar?addressId=...&from=...&to=...` 등으로 월별 수거일을 받는다고 가정.
- 날짜별로 “가연성”, “플라스틱” 등 표시가 필요하면, 해당 날짜를 키로 하는 객체를 만들어 `markedDates`에 넘깁니다.

```tsx
import { Calendar } from 'react-native-calendars';

// 예: { '2026-03-02': { dots: [{ color: 'green' }] }, '2026-03-05': { dots: [{ color: 'blue' }] } }
const marked = useMemo(() => {
  const m: Record<string, { dots: { color: string }[] }> = {};
  collectionDates.forEach((d) => {
    m[d.date] = { dots: d.types.map((t) => ({ color: wasteTypeColor[t] })) };
  });
  return m;
}, [collectionDates]);

<Calendar
  markedDates={marked}
  theme={{
    todayTextColor: '#66bb6a',
    selectedDayBackgroundColor: '#66bb6a',
    arrowColor: '#66bb6a',
  }}
  onDayPress={(day) => { /* 상세 표시 등 */ }}
/>
```

- Web의 “2,4주 금요일” 같은 규칙은 백엔드에서 이미 날짜 리스트로 오므로, 그 응답을 그대로 `markedDates` 형태로 변환하면 됩니다.

---

## 3. 채팅 (WebSocket / STOMP)

Web은 `@stomp/stompjs` + `sockjs-client`로 `/ws`에 연결합니다. RN에서도 같은 프로토콜을 쓰려면 아래를 확인합니다.

### 3.1 패키지

- `@stomp/stompjs`: 그대로 사용 가능.
- `sockjs-client`: RN 환경에서 일부 환경(폴리필) 이슈가 있을 수 있음. 문제가 있으면 **네이티브 WebSocket**만 쓰고 STOMP 프로토콜만 유지하는 방식으로 전환합니다.

### 3.2 연결 URL

- Web: 상대 경로 `/ws` (같은 호스트).
- RN: `EXPO_PUBLIC_WS_URL` 등으로 **절대 URL** 지정 (예: `ws://192.168.0.10:8080/ws`).  
  HTTPS 배포 시에는 `wss://` 사용.

### 3.3 연결 생명주기

- 앱이 백그라운드로 가면 소켓을 끊고, 포그라운드 복귀 시 다시 연결하는 편이 안전합니다.
- `AppState`로 포그라운드/백그라운드 구분 후, 채팅 화면이 마운트된 동안만 연결하거나, 전역 리스너에서 재연결 로직을 넣을 수 있습니다.

### 3.4 인증

- Web과 동일하게 쿼리 또는 헤더에 토큰을 넣는 방식이면, RN에서도 동일한 값을 사용합니다. STOMP connect 시 헤더에 `Authorization: Bearer <token>`를 넣을 수 있는지 백엔드 명세를 확인합니다.

자세한 엔드포인트·메시지 형식은 [CHAT_FRONTEND_GUIDE.md](../CHAT_FRONTEND_GUIDE.md)를 참고하면 됩니다.

---

## 4. 요약

| 기능 | RN 패키지 | 설정·주의 |
|------|-----------|------------|
| 지도 | react-native-maps | Android Google Maps API 키, expo-location 권한, 마커/클러스터 |
| 캘린더 | react-native-calendars | API 응답 → markedDates 변환, theme 색상(03-design 토큰) |
| 채팅 | @stomp/stompjs + sockjs 또는 네이티브 WebSocket | 절대 WS URL, AppState로 재연결, 인증 방식 동일 |

이렇게 하면 Web과 동일한 지도·수거일·채팅 동작을 RN에서 맞출 수 있습니다.
