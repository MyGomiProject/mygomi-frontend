import apiClient from './client';
import { ApiResponse } from './auth';
import {
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressResponse,
  UserAddress,
} from '../types/address';

export const addressApi = {
  // 주소 목록 조회
  getAddresses: async (): Promise<UserAddress[]> => {
    console.log('주소 목록 조회 API 호출');
    try {
      const resp = await apiClient.get<any>('/api/user-addresses');
      console.log('주소 목록 조회 전체 응답:', resp);
      console.log('주소 목록 조회 응답 데이터:', resp.data);
      console.log('주소 목록 조회 응답 데이터 타입:', typeof resp.data);
      console.log('주소 목록 조회 응답 데이터가 배열인가?', Array.isArray(resp.data));
      
      // 응답 구조 확인 및 처리
      let addressData: any[];
      
      // 경우 1: { data: AddressResponse[] } 형태
      if (resp.data && resp.data.data && Array.isArray(resp.data.data)) {
        addressData = resp.data.data;
        console.log('응답 구조: { data: AddressResponse[] }');
      }
      // 경우 2: 직접 AddressResponse[] 배열
      else if (Array.isArray(resp.data)) {
        addressData = resp.data;
        console.log('응답 구조: 직접 AddressResponse[] 배열');
      }
      // 경우 3: 단일 객체를 배열로 변환
      else if (resp.data && resp.data.id) {
        addressData = [resp.data];
        console.log('응답 구조: 단일 객체 (배열로 변환)');
      }
      // 경우 4: { data: AddressResponse } 형태 (단일 객체)
      else if (resp.data && resp.data.data && resp.data.data.id) {
        addressData = [resp.data.data];
        console.log('응답 구조: { data: AddressResponse } (단일 객체)');
      }
      else {
        console.warn('예상치 못한 응답 구조:', resp.data);
        addressData = [];
      }
      
      // AddressResponse를 UserAddress로 변환
      // API 응답은 AddressResponse 형태 (fullAddress만 있음)
      const addresses: UserAddress[] = addressData.map((addr: any) => {
        // 이미 UserAddress 형태인 경우 (개별 필드가 있음) - 백엔드가 개선되면 사용
        if (addr.prefecture && addr.ward) {
          return {
            id: addr.id,
            userId: addr.userId || 0,
            areaId: addr.areaId,
            prefecture: addr.prefecture,
            ward: addr.ward,
            town: addr.town,
            chome: addr.chome,
            banchiText: addr.banchiText || addr.banchi,
            isPrimary: addr.isPrimary,
            lat: addr.lat,
            lng: addr.lng,
            createdAt: addr.createdAt,
            updatedAt: addr.updatedAt,
          };
        }
        
        // AddressResponse 형태인 경우 (fullAddress만 있음)
        // fullAddress를 파싱 (예: "도쿄도 아다치구 신덴 3 12")
        const fullAddress = addr.fullAddress || '';
        const parts = fullAddress.split(' ').filter(Boolean);
        
        // 주소 파싱: "도쿄도 아다치구 신덴 3 12" -> [도쿄도, 아다치구, 신덴, 3, 12]
        let prefecture = '';
        let ward = '';
        let town = '';
        let chome = '';
        let banchiText = '';
        
        if (parts.length > 0) prefecture = parts[0];
        if (parts.length > 1) ward = parts[1];
        if (parts.length > 2) town = parts[2];
        if (parts.length > 3) chome = parts[3];
        if (parts.length > 4) banchiText = parts.slice(4).join(' ');
        
        return {
          id: addr.id,
          userId: addr.userId || 0,
          areaId: addr.areaId,
          prefecture,
          ward,
          town,
          chome,
          banchiText,
          isPrimary: addr.isPrimary || false,
          lat: addr.lat || 0,
          lng: addr.lng || 0,
          createdAt: addr.createdAt,
          updatedAt: addr.updatedAt,
          fullAddress: addr.fullAddress, // 원본 fullAddress도 보관
        };
      });
      
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

