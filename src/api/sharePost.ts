import apiClient from './client';

export interface SharePostRequest {
  title: string;
  content: string;
  category: 'FURNITURE' | 'ELECTRONICS' | 'CLOTHING' | 'BOOKS' | 'KITCHENWARE' | 'SPORTS' | 'ETC';
  lat: number;
  lng: number;
  prefecture?: string;
  ward?: string;
  town?: string;
}

export interface SharePostResponse {
  id: string | number;
  userId?: number;
  title: string;
  content?: string; // 일부 API에서는 content 사용
  description?: string; // 일부 API에서는 description 사용
  viewCount?: number;
  category: string;
  categoryName?: string;
  status: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
  statusName?: string;
  prefecture?: string;
  ward?: string;
  town?: string;
  lat: number;
  lng: number;
  thumbnailUrl?: string;
  imageUrls?: string[];
  author?: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
  distance?: number | null;
}

export const sharePostApi = {
  createPost: async (data: SharePostRequest, images: File[]): Promise<SharePostResponse> => {
    const formData = new FormData();
    
    // 필수 필드 검증
    if (!data.title || !data.title.trim()) {
      throw new Error('제목은 필수입니다.');
    }
    if (!data.content || !data.content.trim()) {
      throw new Error('내용은 필수입니다.');
    }
    if (!data.category) {
      throw new Error('카테고리는 필수입니다.');
    }
    if (images.length === 0) {
      throw new Error('최소 1장의 이미지가 필요합니다.');
    }
    
    // 백엔드가 'request' part를 요구하므로 JSON 객체로 전송
    // 백엔드는 'description' 필드를 기대하므로 content를 description으로 매핑
    const requestData = {
      title: data.title.trim(),
      description: data.content.trim(), // 백엔드는 description 필드를 사용
      category: data.category,
      lat: data.lat,
      lng: data.lng,
      ...(data.prefecture && { prefecture: data.prefecture }),
      ...(data.ward && { ward: data.ward }),
      ...(data.town && { town: data.town }),
    };
    
    // 'request' part에 JSON 데이터 추가
    formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
    
    // 이미지 파일 추가 (최대 5장)
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    // 디버깅: FormData 내용 확인
    console.log('FormData 필드:');
    console.log('request:', JSON.stringify(requestData));
    const entries = Array.from(formData.entries());
    entries.forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`${key}:`, value.name, `(${value.size} bytes)`);
      } else if (value && typeof value === 'object' && 'size' in value && 'type' in value) {
        // Blob 타입 체크 (FormDataEntryValue 타입 이슈 회피)
        console.log(`${key}:`, 'Blob', `(${(value as Blob).size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    });
    
    try {
      const response = await apiClient.post<SharePostResponse>('/api/share-posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('API 요청 실패 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
  
  getPost: async (id: string): Promise<SharePostResponse> => {
    const response = await apiClient.get<SharePostResponse | { data: SharePostResponse }>(`/api/share-posts/${id}`);
    const body = response.data as SharePostResponse & { data?: SharePostResponse };
    return body && typeof body.data !== 'undefined' ? body.data : (response.data as SharePostResponse);
  },
  
  getPosts: async (params?: {
    ward?: string;
    status?: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
    page?: number;
    size?: number;
  }): Promise<{ data: SharePostResponse[]; meta: { total: number; page: number; size: number } }> => {
    const queryParams = new URLSearchParams();
    if (params?.ward) queryParams.append('ward', params.ward);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    const queryString = queryParams.toString();
    const url = `/api/share-posts${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ data: SharePostResponse[]; meta: { total: number; page: number; size: number } }>(url);
    return response.data;
  },
  
  getMyPosts: async (params?: {
    page?: number;
    size?: number;
  }): Promise<{ data: SharePostResponse[]; meta: { total: number; page: number; size: number } }> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    const queryString = queryParams.toString();
    const url = `/api/share-posts/me${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ data: SharePostResponse[]; meta: { total: number; page: number; size: number } }>(url);
    return response.data;
  },
  
  updatePost: async (id: string, data: Partial<SharePostRequest>, images?: File[]): Promise<SharePostResponse> => {
    const formData = new FormData();
    
    // createPost와 동일하게 'request' JSON part 사용 (부분 수정만 포함)
    const requestData: Record<string, unknown> = {};
    if (typeof data.title === 'string' && data.title.trim()) {
      requestData.title = data.title.trim();
    }
    if (typeof data.content === 'string' && data.content.trim()) {
      // 백엔드는 description 필드를 사용
      requestData.description = data.content.trim();
    }
    if (data.category) {
      requestData.category = data.category;
    }
    if (typeof data.lat === 'number') {
      requestData.lat = data.lat;
    }
    if (typeof data.lng === 'number') {
      requestData.lng = data.lng;
    }
    if (data.prefecture) {
      requestData.prefecture = data.prefecture;
    }
    if (data.ward) {
      requestData.ward = data.ward;
    }
    if (data.town) {
      requestData.town = data.town;
    }

    // 변경 필드가 하나라도 있으면 request part 추가
    if (Object.keys(requestData).length > 0) {
      formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
    }

    // 새로 업로드한 이미지가 있으면 images part로 전송
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    // 백엔드가 PATCH /api/share-posts/{id} (multipart/form-data, request + images)를 사용
    const response = await apiClient.patch<SharePostResponse>(`/api/share-posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/share-posts/${id}`);
  },
  
  updateStatus: async (id: string, status: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED'): Promise<SharePostResponse> => {
    // 쿼리 파라미터 형식으로 PATCH 요청 (405 에러로 인해 PUT에서 PATCH로 변경)
    console.log('상태 변경 요청:', { id, status, url: `/api/share-posts/${id}/status?status=${status}` });
    const response = await apiClient.patch<SharePostResponse>(`/api/share-posts/${id}/status?status=${status}`);
    return response.data;
  },
  
  getNearbyPosts: async (params?: {
    page?: number;
    size?: number;
    status?: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
  }): Promise<{ data: SharePostResponse[]; meta: { total: number; page: number; size: number } }> => {
    // 대표 주소 기반으로 자동으로 5km 이내 게시글 조회
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    // 상태 필터링: OPEN과 RESERVED만 조회 (백엔드가 지원하는 경우)
    // 백엔드가 상태 파라미터를 지원하지 않으면 프론트엔드에서 필터링
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    
    const queryString = queryParams.toString();
    const url = `/api/share-posts/nearby/me${queryString ? `?${queryString}` : ''}`;
    
    console.log('getNearbyPosts API 호출:', url);
    
    const response = await apiClient.get<{ 
      data: {
        content: SharePostResponse[];
        totalPages: number;
        totalElements: number;
        number: number;
        size: number;
      };
      meta: { timestamp: string };
    }>(url);
    
    console.log('getNearbyPosts API 응답:', {
      전체개수: response.data.data.totalElements,
      상태별분류: (response.data.data.content || []).reduce((acc, post) => {
        acc[post.status || 'UNKNOWN'] = (acc[post.status || 'UNKNOWN'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    });
    
    // 응답 구조 변환: data.content를 data로, 페이지네이션 정보 변환
    return {
      data: response.data.data.content || [],
      meta: {
        total: response.data.data.totalElements || 0,
        page: response.data.data.number || 0,
        size: response.data.data.size || 0,
      },
    };
  },
};


