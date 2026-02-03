import apiClient from './client';
import { ApiResponse } from './auth';
import { Area, AreaSearchParams, AreaSearchResponse } from '../types/area';

export const areaApi = {
  // 지역 검색 (주소 매칭)
  searchAreas: async (params: AreaSearchParams): Promise<Area[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('prefecture', params.prefecture);
    queryParams.append('ward', params.ward);
    if (params.town) queryParams.append('town', params.town);
    if (params.chome) queryParams.append('chome', params.chome);
    if (params.banchi) queryParams.append('banchi', params.banchi);

    const resp = await apiClient.get<ApiResponse<Area[]>>(`/areas/search?${queryParams.toString()}`);
    return resp.data.data;
  },
};

