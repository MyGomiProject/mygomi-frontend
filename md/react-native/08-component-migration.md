# 컴포넌트 마이그레이션 가이드 (Web → React Native)

Web의 JSX·CSS를 RN 컴포넌트·스타일로 옮길 때 **어떤 것을 어떻게 바꾸면 되는지** 패턴과 체크리스트를 정리한 문서입니다.

---

## 1. 태그·컴포넌트 매핑

| Web (HTML/React DOM) | React Native | 비고 |
|----------------------|--------------|------|
| `<div>`, `<span>`, `<section>`, `<main>` | `<View>` | 레이아웃용 |
| `<p>`, `<h1>`, `<label>`, `<span>` (텍스트) | `<Text>` | 텍스트는 반드시 `Text` 안에 |
| `<img>` | `<Image>` 또는 `expo-image`의 `<Image>` | `source={{ uri: '...' }}` |
| `<button>`, `<a>` (클릭) | `<Pressable>` 또는 `<TouchableOpacity>` | `onPress` |
| `<input type="text">` | `<TextInput>` | `value`, `onChangeText` |
| `<input type="password">` | `<TextInput secureTextEntry>` | |
| `<ScrollView>` (웹은 overflow) | `<ScrollView>` 또는 `<FlatList>` | 리스트는 FlatList 권장 |
| `<ul>`, `<li>` | `<ScrollView>` 안에 `View`+`Text` 또는 `<FlatList>` | |

- **텍스트**: RN에서는 문자열이 반드시 `<Text>` 자식이어야 합니다. `<View>` 안에 직접 "hello"를 넣으면 에러가 납니다.

---

## 2. 스타일 변환

| Web (CSS) | React Native | 비고 |
|-----------|--------------|------|
| `className="..."` | `style={styles.xxx}` 또는 `style={[styles.a, styles.b]}` | |
| `display: flex` | 기본이 flex. `flexDirection: 'column'`이 기본값 | |
| `flex: 1` | `flex: 1` | 동일 |
| `gap: 8` | `gap: 8` (신버전) 또는 margin으로 대체 | |
| `padding: 16` | `padding: 16` | 숫자만 (단위 없음) |
| `margin: 0 auto` | `alignSelf: 'center'` 또는 부모에서 `alignItems: 'center'` | |
| `color`, `backgroundColor` | 동일 | |
| `fontSize: 14` | `fontSize: 14` (숫자) | |
| `fontWeight: 'bold'` | `fontWeight: '700'` 또는 `'bold'` | |
| `borderRadius` | 동일 | |
| `borderWidth`, `borderColor` | `borderWidth: 1`, `borderColor: '#eee'` | border 한 번에 쓰려면 |
| `box-shadow` | Android: `elevation: 2` / iOS: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` | |
| `position: fixed` | `position: 'absolute'` + SafeAreaView 등 | |
| `overflow: hidden/scroll` | `ScrollView` 또는 `overflow: 'hidden'` | |

---

## 3. 이벤트

| Web | React Native |
|-----|--------------|
| `onClick` | `onPress` |
| `onChange` (input) | `onChangeText={(text) => ...}` |
| `onSubmit` (form) | `onPress` 또는 `onSubmitEditing` (키보드 완료) |
| `onKeyDown` | `onKeyPress` (제한적) |

---

## 4. 모달

- Web: `<div className="overlay">` + 조건부 렌더.
- RN: `Modal` 컴포넌트 사용.

```tsx
import { Modal, View, Text, Pressable } from 'react-native';

<Modal visible={isOpen} transparent animationType="fade">
  <Pressable style={styles.overlay} onPress={onClose}>
    <Pressable style={styles.box} onPress={(e) => e.stopPropagation()}>
      <Text>모달 내용</Text>
      <Pressable onPress={onClose}><Text>닫기</Text></Pressable>
    </Pressable>
  </Pressable>
</Modal>
```

- `transparent` + 배경 Pressable로 Web의 overlay 클릭 닫기와 동일하게 구현 가능.

---

## 5. 이미지

- Web: `<img src={url} alt="..." />`
- RN: `<Image source={{ uri: url }} style={...} />` 또는 `expo-image`의 `Image` (캐시 등 유리).

```tsx
import { Image } from 'expo-image';

<Image source={{ uri: post.thumbnailUrl }} style={{ width: 90, height: 90, borderRadius: 8 }} />
```

---

## 6. 리스트 (나눔 글 목록 등)

- Web: `posts.map(...)` 으로 div 리스트.
- RN: 긴 리스트는 **FlatList**로 스크롤·성능 확보.

```tsx
<FlatList
  data={posts}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => <SharingPostCard post={item} onPress={() => onPostClick(item)} />}
  contentContainerStyle={{ paddingVertical: 8 }}
/>
```

---

## 7. 컴포넌트별 체크리스트

아래는 Web 컴포넌트를 RN으로 옮길 때 확인하면 좋은 항목입니다.

### Header

- [ ] 상단 고정: SafeAreaView + View로 상단 바 구성.
- [ ] 로고/타이틀: `Text`.
- [ ] 네비 링크: `Pressable` + `navigation.navigate('...')`.
- [ ] 알림 벨: `Pressable` + 배지(숫자)는 `View`+`Text`.
- [ ] 드롭다운: 절대 위치 `position: 'absolute'` 또는 Modal로 표시.

### SharingPostList / SharingPostCard

- [ ] 카드: `View` + theme 색·borderRadius·shadow (03-design 참고).
- [ ] 썸네일: `Image` 또는 `expo-image`, 고정 크기(예: 90x90).
- [ ] 제목·설명·카테고리·날짜: 모두 `Text`.
- [ ] 상태 뱃지: `View` + `Text` (색상은 statusOpen 등).
- [ ] 리스트: `FlatList`로 렌더.

### SharingPostModal

- [ ] 배경: `Modal` + `Pressable`(overlay).
- [ ] 내부 박스: `ScrollView` 또는 `KeyboardAvoidingView`(입력 시).
- [ ] 이미지 갤러리: `ScrollView` horizontal 또는 이미지 스와이프 컴포넌트.
- [ ] 닫기: `Pressable` + `onClose`.

### KeywordAlertModal

- [ ] 키워드 입력: `TextInput` + `Pressable`(추가).
- [ ] 키워드 목록: `FlatList` 또는 `ScrollView` + map.
- [ ] 삭제: 각 항목에 `Pressable` + `markSeen`/삭제 로직.

### 로그인/회원가입 폼

- [ ] 입력: `TextInput` (email, password는 `secureTextEntry`).
- [ ] react-hook-form: `Controller`로 `control`, `name` 연결.
- [ ] 제출: `Pressable` + `handleSubmit(onSubmit)`.
- [ ] 링크(회원가입/로그인): `Pressable` + `navigation.navigate('Signup')` 등.

### Map

- [ ] 지도: `react-native-maps`의 `MapView` (07-maps-calendar-chat 참고).
- [ ] 마커: `Marker`, 클릭 시 상세로 이동 또는 모달.

---

## 8. 공통 주의사항

- **키보드**: 입력 필드가 가리지 않도록 `KeyboardAvoidingView` 사용 (플랫폼별 동작 확인).
- **스크롤 중첩**: `ScrollView` 안에 `FlatList`는 피하고, 필요한 구간만 `ScrollView`로 묶거나 리스트를 하나의 섹션으로 두기.
- **Safe Area**: 상단(노치)·하단(홈 인디케이터)은 `SafeAreaView` 또는 `useSafeAreaInsets()`로 여백 확보.

이 패턴과 체크리스트를 따라가면 Web UI를 RN에서 빠르게 옮기면서도 03-design 토큰과 동작을 맞출 수 있습니다.
