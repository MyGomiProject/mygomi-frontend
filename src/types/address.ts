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
  banchiText?: string;
  lat?: number;
  lng?: number;
  isPrimary?: boolean;
}

export interface UpdateAddressRequest {
  prefecture?: string;
  ward?: string;
  town?: string;
  chome?: string;
  banchiText?: string;
  lat?: number;
  lng?: number;
  isPrimary?: boolean;
}

export interface AddressResponse {
  data: UserAddress;
}

export interface AddressListResponse {
  data: UserAddress[];
}

