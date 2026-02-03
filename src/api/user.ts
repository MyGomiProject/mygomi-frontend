import apiClient from './client';
import { ApiResponse } from './auth';
import { User, UserResponse } from '../types/user';

export const userApi = {
  // 현재 로그인한 사용자 정보 조회
  getMe: async (): Promise<User> => {
    const resp = await apiClient.get<ApiResponse<User>>('/users/me');
    return resp.data.data;
  },

  // 사용자 정보 수정
  updateMe: async (data: Partial<User>): Promise<User> => {
    const resp = await apiClient.put<ApiResponse<User>>('/users/me', data);
    return resp.data.data;
  },
};

