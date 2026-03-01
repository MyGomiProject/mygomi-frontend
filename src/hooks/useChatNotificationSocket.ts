/**
 * 실시간 채팅 알림용 WebSocket: 내 모든 채팅방을 구독하고,
 * 상대가 보낸 메시지가 오면 onIncomingMessage(roomId, msg) 콜백 호출
 */
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import type { ChatMessageResponse } from '../api/chat';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws-stomp';

export function useChatNotificationSocket(
  token: string | null,
  roomIds: number[],
  myEmail: string,
  onIncomingMessage: (roomId: number, msg: ChatMessageResponse) => void
) {
  const onIncomingRef = useRef(onIncomingMessage);
  onIncomingRef.current = onIncomingMessage;
  const myEmailRef = useRef(myEmail);
  myEmailRef.current = myEmail;

  useEffect(() => {
    const email = myEmail?.trim();
    if (!token || roomIds.length === 0 || !email) return;

    const socket = new SockJS(WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        roomIds.forEach((roomId) => {
          client.subscribe(`/sub/chat/room/${roomId}`, (message: IMessage) => {
            try {
              const data = JSON.parse(message.body) as ChatMessageResponse;
              const my = myEmailRef.current?.trim().toLowerCase();
              const sender = (
                data.senderEmail ??
                (data as unknown as { sender_email?: string }).sender_email ??
                ''
              )
                .trim()
                .toLowerCase();
              if (!sender || (my && sender === my)) return;
              onIncomingRef.current(roomId, data);
            } catch (e) {
              console.warn('Chat notification parse error', e);
            }
          });
        });
      },
      onStompError: (frame) => {
        console.error('STOMP notification error', frame);
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [token, myEmail, roomIds.join(',')]);
}
