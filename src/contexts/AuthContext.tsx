import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, LoginRequest, SignupRequest, LoginResponse } from '../api/auth';
import { setAuthToken } from '../api/client';

interface AuthContextValue {
  user: LoginResponse['user'] | null;
  token: string | null;
  login: (payload: LoginRequest) => Promise<LoginResponse>;
  signup: (payload: SignupRequest) => Promise<{ userId: number }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));

  useEffect(() => {
    if (token) {
      // 간단하게 사용자 정보를 로컬스토리지 토큰으로부터만 설정합니다.
      // 실제 앱에서는 /me API를 호출하여 사용자 정보를 받아오는 것이 안전합니다.
      setAuthToken(token);
    }
  }, [token]);

  const login = async (payload: LoginRequest) => {
    const res = await authApi.login(payload);
    setToken(res.token);
    setUser(res.user);
    setAuthToken(res.token);
    return res;
  };

  const signup = async (payload: SignupRequest) => {
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
