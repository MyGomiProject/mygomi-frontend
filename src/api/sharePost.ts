import apiClient from './client';

export interface SharePostRequest {
  title: string;
  content: string;
  category: 'FURNITURE' | 'ELECTRONICS' | 'CLOTHING' | 'BOOKS' | 'TOYS' | 'KITCHEN' | 'ETC';
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
  status: 'OPEN' | 'RESERVED' | 'COMPLETED';
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
    const response = await apiClient.get<SharePostResponse>(`/api/share-posts/${id}`);
    return response.data;
  },
  
  getPosts: async (params?: {
    ward?: string;
    status?: 'OPEN' | 'RESERVED' | 'COMPLETED';
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
    
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.category) formData.append('category', data.category);
    if (data.lat !== undefined) formData.append('lat', data.lat.toString());
    if (data.lng !== undefined) formData.append('lng', data.lng.toString());
    
    if (data.prefecture) formData.append('prefecture', data.prefecture);
    if (data.ward) formData.append('ward', data.ward);
    if (data.town) formData.append('town', data.town);
    
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    const response = await apiClient.put<SharePostResponse>(`/api/share-posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/share-posts/${id}`);
  },
};


