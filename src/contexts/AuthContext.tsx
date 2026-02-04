import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, LoginRequest, SignupRequest, LoginResponse } from '../api/auth';
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

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      // TODO: /api/users/me API를 호출하여 사용자 정보를 받아오기
      // 현재는 userId만 있으므로, 필요시 사용자 정보 API를 호출해야 합니다.
    }
  }, [token]);

  const login = async (payload: LoginRequest): Promise<void> => {
    try {
      console.log('AuthContext login 호출:', payload);
      const res = await authApi.login(payload);
      console.log('AuthContext login 응답:', res);
      setToken(res.accessToken);
      setAuthToken(res.accessToken);
      // TODO: res.userId를 사용하여 사용자 정보 API 호출
      // 임시로 userId만 저장
      setUser({
        id: res.userId,
        email: payload.email, // 임시로 이메일만 저장
        nickname: '', // 사용자 정보 API에서 가져와야 함
      });
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
