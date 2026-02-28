import apiClient from './client';

/**
 * 나눔 예약 동의 API
 * - 명세: md/나눔_예약_동의_백엔드_명세.md
 * - 백엔드 수정 요청(연동 이슈): md/나눔_예약_API_수정요청_백엔드.md
 */
export interface ReservationStatusResponse {
  postId: number;
  postStatus: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
  myAgreed: boolean;
  otherAgreed: boolean;
  bothAgreed: boolean;
}

/** 응답이 { data: T } 래핑이거나 T 직접인 경우 모두 처리 */
function unwrapData<T>(response: { data: T | { data: T } }): T {
  const body = response.data as T & { data?: T };
  return body && typeof body.data !== 'undefined' ? body.data : (response.data as T);
}

export const reservationApi = {
  /**
   * 예약 상태 조회 (채팅방 진입 시 호출)
   * GET /api/share-posts/{postId}/reservation/status?roomId={roomId}
   * @param roomId - 채팅방 ID (필수)
   */
  getStatus: async (postId: string, roomId: number): Promise<ReservationStatusResponse> => {
    const response = await apiClient.get<ReservationStatusResponse | { data: ReservationStatusResponse }>(
      `/api/share-posts/${encodeURIComponent(postId)}/reservation/status`,
      { params: { roomId } }
    );
    return unwrapData(response) as ReservationStatusResponse;
  },

  /**
   * 예약 동의 (예약하기 버튼 클릭 시)
   * POST /api/share-posts/{postId}/reservation/agree?roomId={roomId}
   * 두 명 모두 동의한 경우 서버에서 게시글 상태를 RESERVED로 변경
   * @param roomId - 채팅방 ID (필수)
   */
  agree: async (postId: string, roomId: number): Promise<ReservationStatusResponse> => {
    const response = await apiClient.post<ReservationStatusResponse | { data: ReservationStatusResponse }>(
      `/api/share-posts/${encodeURIComponent(postId)}/reservation/agree`,
      {},
      { params: { roomId } }
    );
    return unwrapData(response) as ReservationStatusResponse;
  },
};
