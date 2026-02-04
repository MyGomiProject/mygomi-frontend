import apiClient from './client';
import { ApiResponse } from './auth';
import { Area, AreaSearchParams, AreaSearchResponse } from '../types/area';

export const areaApi = {
  // 지역 검색 (주소 매칭)
  searchAreas: async (params: AreaSearchParams): Promise<Area[]> => {
    console.log('지역 검색 API 호출:', params);
    const queryParams = new URLSearchParams();
    queryParams.append('prefecture', params.prefecture);
    queryParams.append('ward', params.ward);
    if (params.town) queryParams.append('town', params.town);
    if (params.chome) queryParams.append('chome', params.chome);
    if (params.banchi) queryParams.append('banchi', params.banchi);

    try {
      const resp = await apiClient.get<ApiResponse<Area[]>>(`/api/areas/search?${queryParams.toString()}`);
      console.log('지역 검색 API 응답:', resp.data);
      return resp.data.data;
    } catch (error: any) {
      console.error('지역 검색 API 에러:', error);
      // 지역 검색 실패해도 빈 배열 반환 (주소 등록은 계속 진행)
      return [];
    }
  },
};

