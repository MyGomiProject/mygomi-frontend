# 네비게이션 상세 (React Native)

Web의 `react-router-dom` Route를 RN에서는 **React Navigation** 스택/탭으로 구현합니다. 여기서는 화면 구성·파라미터·예시 코드를 자세히 정리합니다.

---

## 1. 전체 구조 제안

```
App (QueryClientProvider + AuthProvider)
└── RootNavigator
    ├── (비로그인) AuthStack: Login, Signup
    └── (로그인) MainTab
            ├── HomeTab    → Stack(Home, IntegratedSearch)
            ├── SharingTab → Stack(Sharing, SharePostCreate, PostDetail?)
            └── MyPageTab  → Stack(MyPage, AddressInput, EditInfo, ...)
```

- **인증 여부**에 따라 `AuthStack` vs `MainTab`을 전환할 수 있음 (선택).
- 또는 **모든 화면을 한 스택**에 두고, 탭은 “홈 / 나눔 / 마이페이지”만 하단에 두는 방식도 가능.

---

## 2. 화면(Screen) ↔ Web Route 매핑

| Web Route | RN Screen 이름 | 파라미터 (필요 시) |
|-----------|----------------|---------------------|
| `/` | `Home` | 없음 |
| `/integrated-search` | `IntegratedSearch` | `q?: string` (검색어) |
| `/sharing` | `Sharing` | `ward?: string`, `status?: string` |
| `/sharing/create` | `SharePostCreate` | 없음 |
| (게시글 상세는 모달이면 파라미터 없음) | `SharingPostDetail` 또는 모달 | `postId: string` |
| `/address-input` | `AddressInput` | 없음 (또는 `from?: 'onboarding' \| 'mypage'`) |
| `/login` | `Login` | 없음 |
| `/signup` | `Signup` | 없음 |
| `/mypage` | `MyPage` | 없음 |
| `/test` | `Test` | 없음 |

---

## 3. 네비게이션 타입 정의

`src/navigation/types.ts`:

```ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root: 인증 없이 한 스택으로 갈 때
export type RootStackParamList = {
  Home: undefined;
  IntegratedSearch: { q?: string };
  Sharing: { ward?: string; status?: string } | undefined;
  SharePostCreate: undefined;
  SharingPostDetail: { postId: string };
  AddressInput: { from?: 'onboarding' | 'mypage' } | undefined;
  Login: undefined;
  Signup: undefined;
  MyPage: undefined;
  Test: undefined;
};

// 탭으로 나눌 때: 각 탭별 스택 파라미터
export type HomeStackParamList = {
  Home: undefined;
  IntegratedSearch: { q?: string };
};

export type SharingStackParamList = {
  Sharing: undefined;
  SharePostCreate: undefined;
  SharingPostDetail: { postId: string };
};

export type MyPageStackParamList = {
  MyPage: undefined;
  AddressInput: undefined;
  // EditInfo, ChangePassword 등은 모달로 처리 가능
};

export type MainTabParamList = {
  HomeTab: undefined;
  SharingTab: undefined;
  MyPageTab: undefined;
};

// Screen props 타입 (스택)
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// 사용 예: function SharingScreen({ navigation, route }: RootStackScreenProps<'Sharing'>) { ... }
```

---

## 4. RootNavigator 예시 (스택만 사용)

모든 화면을 **한 스택**에 두는 방식입니다.

`src/navigation/RootNavigator.tsx`:

```tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import SharingScreen from '../screens/SharingScreen';
import SharePostCreateScreen from '../screens/SharePostCreateScreen';
import AddressInputScreen from '../screens/AddressInputScreen';
import IntegratedSearchScreen from '../screens/IntegratedSearchScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MyPageScreen from '../screens/MyPageScreen';
import TestScreen from '../screens/TestScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // 커스텀 Header 컴포넌트 사용 시
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Sharing" component={SharingScreen} />
      <Stack.Screen name="SharePostCreate" component={SharePostCreateScreen} />
      <Stack.Screen name="AddressInput" component={AddressInputScreen} />
      <Stack.Screen name="IntegratedSearch" component={IntegratedSearchScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MyPage" component={MyPageScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
    </Stack.Navigator>
  );
}
```

---

## 5. 탭 + 탭별 스택 예시

하단 탭(홈 / 나눔 / 마이페이지)을 두고, 각 탭 안에서만 스택으로 쌓는 방식입니다.

`src/navigation/MainTabNavigator.tsx`:

```tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainTabParamList } from './types';
import type { HomeStackParamList, SharingStackParamList, MyPageStackParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import IntegratedSearchScreen from '../screens/IntegratedSearchScreen';
import SharingScreen from '../screens/SharingScreen';
import SharePostCreateScreen from '../screens/SharePostCreateScreen';
import MyPageScreen from '../screens/MyPageScreen';
import AddressInputScreen from '../screens/AddressInputScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SharingStack = createNativeStackNavigator<SharingStackParamList>();
const MyPageStack = createNativeStackNavigator<MyPageStackParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="IntegratedSearch" component={IntegratedSearchScreen} />
    </HomeStack.Navigator>
  );
}

function SharingStackScreen() {
  return (
    <SharingStack.Navigator screenOptions={{ headerShown: false }}>
      <SharingStack.Screen name="Sharing" component={SharingScreen} />
      <SharingStack.Screen name="SharePostCreate" component={SharePostCreateScreen} />
    </SharingStack.Navigator>
  );
}

function MyPageStackScreen() {
  return (
    <MyPageStack.Navigator screenOptions={{ headerShown: false }}>
      <MyPageStack.Screen name="MyPage" component={MyPageScreen} />
      <MyPageStack.Screen name="AddressInput" component={AddressInputScreen} />
    </MyPageStack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#66bb6a',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: '홈' }} />
      <Tab.Screen name="SharingTab" component={SharingStackScreen} options={{ title: '나눔' }} />
      <Tab.Screen name="MyPageTab" component={MyPageStackScreen} options={{ title: '마이' }} />
    </Tab.Navigator>
  );
}
```

그 다음 **RootNavigator**에서 로그인 전에는 `Login`/`Signup` 스택, 로그인 후에는 `MainTabNavigator`를 보여주도록 분기할 수 있습니다.

---

## 6. 화면에서 이동·파라미터 사용

- **다음 화면으로 이동 (파라미터 없음)**

```tsx
navigation.navigate('Sharing');
```

- **파라미터와 함께 이동**

```tsx
navigation.navigate('IntegratedSearch', { q: '플라스틱' });
navigation.navigate('SharingPostDetail', { postId: '123' });
```

- **현재 라우트 파라미터 읽기**

```tsx
const { ward, status } = route.params ?? {};
```

- **뒤로 가기**

```tsx
navigation.goBack();
```

- **Web의 `replace`에 해당 (스택에서 현재 화면 대체)**

```tsx
navigation.replace('Home');
```

---

## 7. 인증 분기로 스택 전환 (선택)

`App.tsx`에서 `token` 여부에 따라 다른 네비게이터를 렌더링하는 예시입니다.

```tsx
import { useAuth } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import AuthStack from './src/navigation/AuthStack';

export default function App() {
  const { token } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // AsyncStorage에서 토큰 로드 후 isReady = true
    loadStoredToken().then(() => setIsReady(true));
  }, []);

  if (!isReady) return <Loading />;

  return token ? <RootNavigator /> : <AuthStack />;
}
```

이렇게 하면 비로그인 시에는 `Login`/`Signup`만 있는 `AuthStack`만 보이고, 로그인 후에는 `MainTab`(또는 단일 스택)이 보이게 할 수 있습니다.

---

## 8. 요약

- **01-folder-structure.md**의 라우트 ↔ Screen 매핑을 그대로 쓰고, 위 타입·RootNavigator·탭 구조를 적용하면 Web과 동일한 화면 흐름을 RN에서 구현할 수 있습니다.
- 파라미터가 필요한 화면은 `navigation/types.ts`에 정의해 두고, 각 Screen에서 `route.params`로 사용하면 됩니다.
