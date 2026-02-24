import apiClient from './client';

/**
 * 나눔 예약 동의 상태 (명세: md/나눔_예약_동의_백엔드_명세.md)
 */
export interface ReservationStatusResponse {
  postId: number;
  postStatus: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
  myAgreed: boolean;
  otherAgreed: boolean;
  bothAgreed: boolean;
}

export const reservationApi = {
  /**
   * 예약 상태 조회 (채팅방 진입 시 호출)
   * GET /api/share-posts/{postId}/reservation/status
   */
  getStatus: async (postId: string): Promise<ReservationStatusResponse> => {
    const response = await apiClient.get<{ data: ReservationStatusResponse }>(
      `/api/share-posts/${postId}/reservation/status`
    );
    return response.data.data;
  },

  /**
   * 예약 동의 (예약하기 버튼 클릭 시)
   * POST /api/share-posts/{postId}/reservation/agree
   * 두 명 모두 동의한 경우 서버에서 게시글 상태를 RESERVED로 변경
   */
  agree: async (postId: string): Promise<ReservationStatusResponse> => {
    const response = await apiClient.post<{ data: ReservationStatusResponse }>(
      `/api/share-posts/${postId}/reservation/agree`
    );
    return response.data.data;
  },
};
