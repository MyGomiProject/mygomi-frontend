
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
  accessToken: string;  // JWT 토큰
  userId: number;       // 사용자 ID
}

export const authApi = {
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    console.log('API 호출:', '/auth/login', req);
    console.log('Base URL:', apiClient.defaults.baseURL);
    try {
      const resp = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', req);
      console.log('API 응답:', resp.data);
      return resp.data.data;
    } catch (error: any) {
      console.error('API 에러 상세:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  signup: async (req: SignupRequest): Promise<string> => {
    console.log('회원가입 API 호출:', '/auth/signup', req);
    console.log('Base URL:', apiClient.defaults.baseURL);
    try {
      const resp = await apiClient.post<ApiResponse<string>>('/auth/signup', req);
      console.log('회원가입 API 응답:', resp.data);
      return resp.data.data;
    } catch (error: any) {
      console.error('회원가입 API 에러 상세:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};