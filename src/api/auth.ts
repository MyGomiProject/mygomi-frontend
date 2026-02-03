
import apiClient from './client';

// 공통 응답 형태
export interface ApiResponse<T> {
  data: T;
  meta?: any;
  errorCode?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

export const authApi = {
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    const resp = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', req);
    return resp.data.data;
  },

  signup: async (req: SignupRequest): Promise<{ userId: number }> => {
    const resp = await apiClient.post<ApiResponse<{ userId: number }>>('/auth/signup', req);
    return resp.data.data;
  },
};