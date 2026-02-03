import apiClient from './client';
import { ApiResponse } from './auth';
import {
  UserAddress,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressResponse,
  AddressListResponse,
} from '../types/address';

export const addressApi = {
  // 주소 목록 조회
  getAddresses: async (): Promise<UserAddress[]> => {
    const resp = await apiClient.get<ApiResponse<UserAddress[]>>('/users/me/addresses');
    return resp.data.data;
  },

  // 주소 등록
  createAddress: async (data: CreateAddressRequest): Promise<UserAddress> => {
    const resp = await apiClient.post<ApiResponse<UserAddress>>('/users/me/addresses', data);
    return resp.data.data;
  },

  // 주소 수정
  updateAddress: async (id: number, data: UpdateAddressRequest): Promise<UserAddress> => {
    const resp = await apiClient.put<ApiResponse<UserAddress>>(`/users/me/addresses/${id}`, data);
    return resp.data.data;
  },

  // 주소 삭제
  deleteAddress: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/me/addresses/${id}`);
  },

  // 대표 주소 설정
  setPrimaryAddress: async (id: number): Promise<UserAddress> => {
    const resp = await apiClient.patch<ApiResponse<UserAddress>>(`/users/me/addresses/${id}/primary`);
    return resp.data.data;
  },
};

