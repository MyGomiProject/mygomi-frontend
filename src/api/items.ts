import apiClient from './client';
import { SearchItem, SearchResponse } from '../types/items'; // 분리된 타입 가져오기

// 3. 핵심: API 호출 함수 추가!
export const itemsApi = {
  searchItems: async (q: string, ward: string, isLoggedIn: boolean): Promise<SearchItem[]> => {
    const url = isLoggedIn ? '/api/items/search' : '/api/items/guest/search';
    const params = isLoggedIn ? { keyword: q } : { keyword: q, ward: ward };
    const response = await apiClient.get<SearchItem[]>(url, { params });
    return response.data || []; 
  },
};