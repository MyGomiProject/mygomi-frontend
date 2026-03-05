import apiClient from './client';
import { SearchItem } from '../types/items'; 

export const itemsApi = {
  searchItems: async (q: string, ward: string, isLoggedIn: boolean): Promise<SearchItem[]> => {
    const url = isLoggedIn ? '/api/items/search' : '/api/items/guest/search';
    const params = { keyword: q, ward: ward };
    const response = await apiClient.get<SearchItem[]>(url, { params });
    return response.data || [];
  },
};