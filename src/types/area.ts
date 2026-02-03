// 지역 관련 타입 정의

export interface Area {
  id: number;
  prefecture: string;
  ward: string;
  town: string;
  chome?: string;
  banchiRange?: string;
  lat?: number;
  lng?: number;
}

export interface AreaSearchParams {
  prefecture: string;
  ward: string;
  town?: string;
  chome?: string;
  banchi?: string;
}

export interface AreaSearchResponse {
  data: Area[];
}

