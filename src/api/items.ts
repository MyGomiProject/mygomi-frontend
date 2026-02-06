/* [src/api/items.ts] */
import axios from 'axios';

// 1. 공통 설정 (백엔드 가이드 기준)
const api = axios.create({
  baseURL: '/api',
});

// 2. 민지님이 작성한 타입들 그대로 유지
export type WasteType = 'BURNABLE' | 'NON_BURNABLE' | 'PLASTIC' | 'CAN_BOTTLE' | 'PAPER' | 'SODAI';

export const WASTE_TYPE_LABELS: Record<WasteType, { ko: string; ja: string; emoji: string; class: string }> = {
  BURNABLE: { ko: '가연성', ja: '可燃', emoji: '🔥', class: 'burnable' },
  NON_BURNABLE: { ko: '불연성', ja: '不燃', emoji: '🚫', class: 'non-burnable' },
  PLASTIC: { ko: '플라스틱', ja: 'プラスチック', emoji: '♻️', class: 'plastic' },
  CAN_BOTTLE: { ko: '병/캔', ja: 'びん・缶', emoji: '🥤', class: 'can-bottle' },
  PAPER: { ko: '종이', ja: '紙', emoji: '📄', class: 'paper' },
  SODAI: { ko: '대형 폐기물', ja: '粗大ごみ', emoji: '📦', class: 'sodai' },
};

export interface SearchItem {
  id: number;
  nameKo: string;
  nameJa: string;
  wasteType: WasteType;
  description: string;
  ward: string;
  wardSpecificNote?: string;
}

export interface SearchResponse {
  data: SearchItem[];
}

// 3. 핵심: API 호출 함수 추가!
export const itemsApi = {
  searchItems: async (q: string, ward: string): Promise<SearchItem[]> => {
    const response = await api.get<SearchResponse>('/items/search', {
      params: { q, ward }, //
    });
    return response.data.data;
  },
};