import apiClient from './client';
import { ApiResponse } from './auth';
import {
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressResponse,
} from '../types/address';

export const addressApi = {
  // 주소 목록 조회
  getAddresses: async (): Promise<AddressResponse[]> => {
    console.log('주소 목록 조회 API 호출');
    try {
      const resp = await apiClient.get<any>('/api/user-addresses');
      console.log('주소 목록 조회 전체 응답:', resp);
      console.log('주소 목록 조회 응답 데이터:', resp.data);
      console.log('주소 목록 조회 응답 데이터 타입:', typeof resp.data);
      console.log('주소 목록 조회 응답 데이터가 배열인가?', Array.isArray(resp.data));
      
      // 응답 구조 확인 및 처리
      let addresses: AddressResponse[];
      
      // 경우 1: { data: AddressResponse[] } 형태
      if (resp.data && resp.data.data && Array.isArray(resp.data.data)) {
        addresses = resp.data.data;
        console.log('응답 구조: { data: AddressResponse[] }');
      }
      // 경우 2: 직접 AddressResponse[] 배열
      else if (Array.isArray(resp.data)) {
        addresses = resp.data;
        console.log('응답 구조: 직접 AddressResponse[] 배열');
      }
      // 경우 3: 단일 객체를 배열로 변환
      else if (resp.data && resp.data.id) {
        addresses = [resp.data];
        console.log('응답 구조: 단일 객체 (배열로 변환)');
      }
      // 경우 4: { data: AddressResponse } 형태 (단일 객체)
      else if (resp.data && resp.data.data && resp.data.data.id) {
        addresses = [resp.data.data];
        console.log('응답 구조: { data: AddressResponse } (단일 객체)');
      }
      else {
        console.warn('예상치 못한 응답 구조:', resp.data);
        addresses = [];
      }
      
      console.log('파싱된 주소 목록:', addresses);
      return addresses;
    } catch (error: any) {
      console.error('주소 목록 조회 API 에러:', error);
      console.error('에러 상세:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  },

  // 주소 등록
  createAddress: async (data: CreateAddressRequest): Promise<AddressResponse> => {
    console.log('주소 등록 API 호출:', '/api/user-addresses', data);
    console.log('Base URL:', apiClient.defaults.baseURL);
    try {
      const resp = await apiClient.post<ApiResponse<AddressResponse>>('/api/user-addresses', data);
      console.log('주소 등록 API 응답:', resp.data);
      return resp.data.data;
    } catch (error: any) {
      console.error('주소 등록 API 에러 상세:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // 주소 수정
  updateAddress: async (id: number, data: UpdateAddressRequest): Promise<AddressResponse> => {
    const resp = await apiClient.put<ApiResponse<AddressResponse>>(`/api/user-addresses/${id}`, data);
    return resp.data.data;
  },

  // 주소 삭제
  deleteAddress: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/user-addresses/${id}`);
  },

  // 대표 주소 설정
  setPrimaryAddress: async (id: number): Promise<AddressResponse> => {
    const resp = await apiClient.patch<ApiResponse<AddressResponse>>(`/api/user-addresses/${id}/primary`);
    return resp.data.data;
  },
};

