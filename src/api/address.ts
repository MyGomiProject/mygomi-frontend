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
    const resp = await apiClient.get<ApiResponse<AddressResponse[]>>('/api/user-addresses');
    console.log('주소 목록 조회 응답:', resp.data);
    return resp.data.data;
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

