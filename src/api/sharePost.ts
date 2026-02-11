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
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'OPEN' | 'RESERVED' | 'COMPLETED';
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
}

export const sharePostApi = {
  createPost: async (data: SharePostRequest, images: File[]): Promise<SharePostResponse> => {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('category', data.category);
    formData.append('lat', data.lat.toString());
    formData.append('lng', data.lng.toString());
    
    if (data.prefecture) {
      formData.append('prefecture', data.prefecture);
    }
    if (data.ward) {
      formData.append('ward', data.ward);
    }
    if (data.town) {
      formData.append('town', data.town);
    }
    
    // 이미지 파일 추가 (최대 5장)
    images.forEach((image, index) => {
      formData.append('images', image);
    });
    
    const response = await apiClient.post<SharePostResponse>('/api/share-posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  getPost: async (id: string): Promise<SharePostResponse> => {
    const response = await apiClient.get<SharePostResponse>(`/api/share-posts/${id}`);
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


