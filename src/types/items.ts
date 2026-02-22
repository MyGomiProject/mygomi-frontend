/* [src/types/items.ts] */

// 1. 쓰레기 타입 정의(yj이 작성한 타입들 그대로 유지)
export type WasteType = 'BURNABLE' | 'NON_BURNABLE' | 'PLASTIC' | 'CAN_BOTTLE' | 'PAPER' | 'SODAI';

// 2. 검색 결과 아이템 인터페이스
export interface SearchItem {
  id: number;
  nameKo: string;
  nameJa: string;
  wasteType: WasteType;
  description: string;
  ward: string;
  wardSpecificNote?: string;
}

// 3. API 응답 껍데기
export interface SearchResponse {
  data: SearchItem[];
}