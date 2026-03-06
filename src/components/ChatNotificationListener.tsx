import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { chatApi } from '../api/chat';
import { useChatNotificationSocket } from '../hooks/useChatNotificationSocket';
import type { ChatMessageResponse } from '../api/chat';
import {
  clearNotificationRoomSeen,
  loadRoomMessagesFromStorage,
  saveRoomMessagesToStorage,
  toDisplayMessage,
} from './ChatRoomModal';

/** 새 메시지 도착 시 헤더 벨 알림에 반영 (detail: { roomId: number }) */
function dispatchChatNotificationReceived(roomId: number): void {
  window.dispatchEvent(new CustomEvent('chat-notification-received', { detail: { roomId } }));
}

/** 채팅방 목록(lastMessage) 갱신 요청 (detail: { roomId: number }) */
function dispatchChatRoomListUpdate(roomId: number): void {
  window.dispatchEvent(new CustomEvent('chat-room-list-update', { detail: { roomId } }));
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

  const handleIncomingMessage = useCallback((roomId: number, msg: ChatMessageResponse) => {
    try {
      const list = loadRoomMessagesFromStorage(roomId);
      const newMsg = toDisplayMessage(msg, myEmail);
      const exists = list.some((m) => m.id === newMsg.id);
      if (!exists) {
        saveRoomMessagesToStorage(roomId, [...list, newMsg]);
        dispatchChatRoomListUpdate(roomId);
      }
    } catch {
      // 시크릿/프라이빗 모드 등에서 localStorage 불가 시 저장만 스킵. 알림·배지는 아래에서 처리.
      dispatchChatRoomListUpdate(roomId);
    }
    clearNotificationRoomSeen(roomId);
    dispatchChatNotificationReceived(roomId);
  }, [myEmail]);

  useChatNotificationSocket(token, roomIds, myEmail, handleIncomingMessage);

  return null;
};

export default ChatNotificationListener;
