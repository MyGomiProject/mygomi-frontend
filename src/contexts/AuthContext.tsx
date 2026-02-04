import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, LoginRequest, SignupRequest, LoginResponse } from '../api/auth';
import { userApi } from '../api/user';
import { setAuthToken } from '../api/client';

interface User {
  id: number;
  email: string;
  nickname: string;
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

  // 토큰이 있으면 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const userInfo = await userApi.getMe();
          console.log('초기 사용자 정보 가져오기 성공:', userInfo);
          
          // userInfo가 유효한지 확인
          if (userInfo && userInfo.id) {
            setUser({
              id: userInfo.id,
              email: userInfo.email || '',
              nickname: userInfo.nickname || '',
            });
          } else {
            console.warn('사용자 정보가 유효하지 않음:', userInfo);
            // 토큰이 유효하지 않으면 제거
            setToken(null);
            setAuthToken(null);
            localStorage.removeItem('authToken');
          }
        } catch (error: any) {
          console.error('사용자 정보 가져오기 실패:', error);
          console.error('에러 상세:', {
            message: error?.message,
            response: error?.response,
            status: error?.response?.status,
            data: error?.response?.data,
          });
          // 토큰이 유효하지 않으면 제거
          setToken(null);
          setAuthToken(null);
          localStorage.removeItem('authToken');
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
      setToken(res.accessToken);
      setAuthToken(res.accessToken);
      
      // 로그인 성공 후 사용자 정보 가져오기
      try {
        const userInfo = await userApi.getMe();
        console.log('사용자 정보 가져오기 성공:', userInfo);
        
        // userInfo가 유효한지 확인
        if (userInfo && userInfo.id) {
          setUser({
            id: userInfo.id,
            email: userInfo.email || payload.email,
            nickname: userInfo.nickname || '',
          });
        } else {
          console.warn('사용자 정보가 유효하지 않음:', userInfo);
          // 사용자 정보가 유효하지 않으면 기본값 사용
          setUser({
            id: res.userId,
            email: payload.email,
            nickname: '',
          });
        }
      } catch (error: any) {
        console.error('사용자 정보 가져오기 실패:', error);
        console.error('에러 상세:', {
          message: error?.message,
          response: error?.response,
          status: error?.response?.status,
          data: error?.response?.data,
        });
        // 사용자 정보를 가져오지 못해도 로그인은 성공한 것으로 처리
        setUser({
          id: res.userId,
          email: payload.email,
          nickname: '',
        });
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
    setUser(null);
    setToken(null);
    setAuthToken(null);
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
