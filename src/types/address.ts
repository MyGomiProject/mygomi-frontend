// 주소 관련 타입 정의

export interface UserAddress {
  id: number;
  userId: number;
  areaId?: number;
  prefecture: string;
  ward: string;
  town?: string;
  chome?: string;
  banchiText?: string;
  isPrimary: boolean;
  lat?: number;
  lng?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressRequest {
  prefecture: string;
  ward: string;
  town?: string;
  chome?: string;
  banchi?: string;  // banchiText 대신 banchi 사용
  lat?: number;
  lng?: number;
  isPrimary?: boolean;
}

export interface UpdateAddressRequest {
  prefecture?: string;
  ward?: string;
  town?: string;
  chome?: string;
  banchi?: string;  // banchiText 대신 banchi 사용
  lat?: number;
  lng?: number;
  isPrimary?: boolean;
}

export interface AddressResponse {
  id: number;
  fullAddress: string;
  isPrimary: boolean;
  areaId: number | null;
}

export interface AddressListResponse {
  data: AddressResponse[];
}

