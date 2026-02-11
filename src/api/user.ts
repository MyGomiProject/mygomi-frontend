import apiClient from './client';
import { ApiResponse } from './auth';
import { User, UserResponse } from '../types/user';

export const userApi = {
  // 현재 로그인한 사용자 정보 조회
  getMe: async (): Promise<User> => {
    console.log('userApi.getMe 호출');
    try {
      const resp = await apiClient.get<any>('/api/users/me');
      console.log('userApi.getMe 전체 응답:', resp);
      console.log('userApi.getMe 응답 데이터:', resp.data);
      console.log('userApi.getMe 응답 데이터 타입:', typeof resp.data);
      console.log('userApi.getMe 응답 데이터 키:', Object.keys(resp.data || {}));
      
      // 응답 구조 확인 및 처리
      let userData: User;
      
      // 경우 1: { data: User } 형태
      if (resp.data && resp.data.data && typeof resp.data.data === 'object') {
        userData = resp.data.data;
        console.log('응답 구조: { data: User }');
      }
      // 경우 2: 직접 User 객체
      else if (resp.data && resp.data.id) {
        userData = resp.data;
        console.log('응답 구조: 직접 User 객체');
      }
      // 경우 3: axios 응답에서 data가 바로 User인 경우
      else {
        console.error('예상치 못한 응답 구조:', resp.data);
        throw new Error('사용자 정보 응답 구조를 파싱할 수 없습니다.');
      }
      
      // 필수 필드 확인
      if (!userData.id) {
        throw new Error('사용자 정보에 id가 없습니다.');
      }
      
      console.log('파싱된 사용자 정보:', userData);
      return userData;
    } catch (error: any) {
      console.error('userApi.getMe 에러:', error);
      console.error('에러 상세:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  },

  // 사용자 정보 수정
  updateMe: async (data: Partial<User>): Promise<User> => {
    const resp = await apiClient.put<ApiResponse<User>>('/api/users/me', data);
    return resp.data.data;
  },

  // 닉네임 수정
  updateNickname: async (nickname: string): Promise<User> => {
    const resp = await apiClient.patch<User>('/api/users/me/nickname', { nickname });
    return resp.data;
  },

  // 비밀번호 변경
  updatePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
    const resp = await apiClient.patch<string>('/api/users/me/password', {
      currentPassword,
      newPassword,
    });
    return resp.data;
  },
};

