/**
 * 채팅 HTTP API (CHAT_FRONTEND_GUIDE.md 기준)
 * Base: http://localhost:8080 (프록시 사용 시 /api)
 */
import apiClient from './client';

const CHAT_BASE = '/api/chat';

/** GET /api/chat/rooms 응답 항목 */
export interface ChatRoomItem {
  roomId: number;
  postTitle: string;
  opponentNickname: string;
  /** 해당 채팅방이 연결된 나눔 글 ID (목록에서 예약 API 연동용) */
  sharePostId?: number;
}

/** GET /api/chat/room/{roomId}/messages 응답 & 실시간 수신 메시지 */
export interface ChatMessageResponse {
  messageId: number;
  senderEmail: string;
  senderNickname: string;
  message: string;
  sendTime: string;
}

/** POST /api/chat/room?sharePostId= 응답: roomId (Long) */
export const chatApi = {
  /**
   * 채팅방 생성 또는 기존 방 참여
   * POST /api/chat/room?sharePostId={나눔게시글ID}
   * @returns roomId (number)
   */
  createRoom: async (sharePostId: string): Promise<number> => {
    const response = await apiClient.post<number>(
      `${CHAT_BASE}/room?sharePostId=${encodeURIComponent(sharePostId)}`
    );
    return typeof response.data === 'number' ? response.data : Number(response.data);
  },

  /**
   * 내 채팅방 목록
   * GET /api/chat/rooms
   */
  getRooms: async (): Promise<ChatRoomItem[]> => {
    const response = await apiClient.get<ChatRoomItem[]>(`${CHAT_BASE}/rooms`);
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * 특정 채팅방 과거 메시지
   * GET /api/chat/room/{roomId}/messages
   */
  getMessages: async (roomId: number): Promise<ChatMessageResponse[]> => {
    const response = await apiClient.get<ChatMessageResponse[]>(
      `${CHAT_BASE}/room/${roomId}/messages`
    );
    return Array.isArray(response.data) ? response.data : [];
  },
};
