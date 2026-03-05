import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, LoginRequest, SignupRequest } from '../api/auth';
import { userApi } from '../api/user';
import { setAuthToken } from '../api/client';

// 1. 유저 인터페이스 정의 (가이드 문서의 주소 설계를 반영함)
interface User {
  id: number;
  email: string;
  nickname: string;
  role?: 'USER' | 'ADMIN';
  address?: {
    id: number;
    ward: string;
    isPrimary: boolean;
  };
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  signup: (payload: SignupRequest) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));

  // 공통 로직: 백엔드에서 받은 addresses 배열 중 대표 주소를 추출
 const mapUserWithAddress = (userInfo: any, defaultEmail?: string): User => {
    const addresses = userInfo.addresses ?? (userInfo.address ? [userInfo.address] : []);
const primaryAddress =
  addresses.find((addr: any) => addr?.isPrimary) ?? addresses[0];

    // 💡 추가된 로직: fullAddress가 "도쿄도 오타구 이케가미" 라면 띄어쓰기로 분리해서 '구'로 끝나는 단어만 추출!
    let extractedWard = '';
    const full = primaryAddress?.fullAddress ?? '';
    if (full) {
      extractedWard = full.split(/\s+/).find((p: string) => p.endsWith('구') || p.endsWith('区')) || '';
    }
    if (primaryAddress && primaryAddress.fullAddress) {
      const parts = primaryAddress.fullAddress.split(' ');
      extractedWard = parts.find((p: string) => p.endsWith('구')) || '';
    }

    const emailToUse = userInfo.email || defaultEmail || '';
    const isAdmin = emailToUse === 'admin@example.com';

    return {
      id: userInfo.id,
      email: userInfo.email || defaultEmail || '',
      nickname: userInfo.nickname || '',
      role: isAdmin ? 'ADMIN' : 'USER',
      address: primaryAddress ? {
        id: primaryAddress.id,
        ward: extractedWard,
        isPrimary: primaryAddress.isPrimary
      } : undefined
    };
  };

  // 토큰 만료 등 치명적 에러 시 세션 초기화
  const clearSession = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
  };

  // 토큰이 있으면 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const userInfo = await userApi.getMe();
          console.log('초기 사용자 정보 가져오기 성공:', userInfo);
          
          if (userInfo && userInfo.id) {
              setUser(mapUserWithAddress(userInfo));
          } else {
            console.warn('사용자 정보가 유효하지 않음:', userInfo);
            clearSession(); // 초기 로드 실패 시에는 안전을 위해 세션 초기화
          }
        } catch (error) {
          clearSession(); // 초기 로드 실패 시에는 안전을 위해 세션 초기화
        }
      }
    };
    fetchUserInfo();
  }, [token]);

  const login = async (payload: LoginRequest): Promise<void> => {
    try {
      console.log('AuthContext login 호출:', payload);
      const res = await authApi.login(payload);
      console.log('AuthContext login 응답:', res);
      const accessToken = res.accessToken;

      localStorage.setItem('authToken', accessToken);
      setToken(res.accessToken);
      setAuthToken(res.accessToken);

      // 로그인 성공 후 사용자 정보 가져오기
      try {
        const userInfo = await userApi.getMe();
        if (userInfo && userInfo.id) {
          // 여기서도 매핑 함수를 사용하여 주소 정보를 포함시킵니다.
          setUser(mapUserWithAddress(userInfo, payload.email));
        } else {
          setUser({ id: res.userId, email: payload.email, nickname: '', role: payload.email === 'admin@example.com' ? 'ADMIN' : 'USER' });
        }
      } catch (error: any) {
        console.error('사용자 정보 가져오기 실패:', error);
        // 상세 정보 조회 실패 시에도 로그인은 유지 (Fallback)
        setUser({ id: res.userId, email: payload.email, nickname: '', role: payload.email === 'admin@example.com' ? 'ADMIN' : 'USER' });
      }
    } catch (error) {
      console.error('AuthContext login 에러:', error);
      throw error;
    }
  };

  const signup = async (payload: SignupRequest): Promise<string> => {
    const res = await authApi.signup(payload);
    return res;
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
