import apiClient from './client';
import { SearchItem, SearchResponse } from '../types/items'; // 분리된 타입 가져오기

// 3. 핵심: API 호출 함수 추가!
export const itemsApi = {
  searchItems: async (q: string, ward: string): Promise<SearchItem[]> => {
    const response = await apiClient.get<SearchResponse>('/api/items/search', {
      params: { q, ward }, //
    });
    return response.data.data;
  },
};