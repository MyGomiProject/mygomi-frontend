import apiClient from './client';

// --- Types ---
export interface ReportResponse {
  id: number;
  type: 'SHARE_POST' | 'INFO';
  typeName: string;
  reporterId: number;
  reporterEmail: string;
  emailReply: boolean;
  targetPostId: number;
  reason: string;
  reasonName: string;
  title: string;
  content: string;
  attachmentUrl: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  statusName: string;
  adminNote: string;
  createdAt: string;
}

export interface PostReportRequest {
  reason: string;
  title: string;
  content: string;
  emailReply: boolean;
  reporterEmail?: string;
}

// Spring Pageable 응답 형식
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 토큰 인터셉터가 설정되어 있다고 가정합니다.

export const reportsApi = {
  // 1. 신고 사유 목록 조회
  getReasons: async () => {
    const response = await apiClient.get('/api/reports/reasons');
    return response.data;
  },

  // 2. 게시글 신고
  createPostReport: async (postId: number, data: PostReportRequest) => {
    const response = await apiClient.post(`/api/reports/share-posts/${postId}`, data);
    return response.data;
  },

  // 3. 잘못된 정보 신고 (multipart/form-data)
  createInfoReport: async (dataObject: any, file?: File) => {
    const formData = new FormData();
    // 백엔드 스펙에 따라 data 객체를 문자열로 변환하여 첨부
    formData.append('data', new Blob([JSON.stringify(dataObject)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    
    const response = await apiClient.post('/api/reports/info', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 4. [관리자] 신고 목록 조회
  getAdminReports: async (params: { type?: string; status?: string; page?: number; size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<ReportResponse>>('/api/reports/admin', { params });
    return response.data;
  },

  // 5. [관리자] 신고 상세 조회
  getAdminReportDetail: async (reportId: number) => {
    const response = await apiClient.get<ReportResponse>(`/api/reports/admin/${reportId}`);
    return response.data;
  },

  // 6. [관리자] 처리 상태 변경 (쿼리 파라미터 사용)
  updateAdminReportStatus: async (reportId: number, status: string, adminNote?: string) => {
    const response = await apiClient.patch(`/api/reports/admin/${reportId}/status`, null, {
      params: { status, adminNote },
    });
    return response.data;
  },
};