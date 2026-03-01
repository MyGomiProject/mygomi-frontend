import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { chatApi } from '../api/chat';
import { useChatNotificationSocket } from '../hooks/useChatNotificationSocket';
import type { ChatMessageResponse } from '../api/chat';
import { clearNotificationRoomSeen } from './ChatRoomModal';

/** 새 메시지 도착 시 헤더 벨 알림에 반영하기 위해 사용하는 이벤트 (detail: { roomId: number }) */
function dispatchChatNotificationReceived(roomId: number): void {
  window.dispatchEvent(new CustomEvent('chat-notification-received', { detail: { roomId } }));
}

/**
 * 로그인 사용자의 모든 채팅방을 WebSocket으로 구독하고,
 * 상대가 메시지를 보내면 헤더 벨 드롭다운에 알림이 조회되도록 함 (토스트 없음)
 */
const ChatNotificationListener: React.FC = () => {
  const { token, user } = useAuth();

  const { data: rooms } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms(),
    enabled: !!token,
  });

  const roomIds = rooms?.map((r) => r.roomId) ?? [];
  const myEmail = user?.email ?? '';

  const handleIncomingMessage = useCallback((roomId: number, _msg: ChatMessageResponse) => {
    clearNotificationRoomSeen(roomId);
    dispatchChatNotificationReceived(roomId);
  }, []);

  useChatNotificationSocket(token, roomIds, myEmail, handleIncomingMessage);

  return null;
};

export default ChatNotificationListener;
