/**
 * STOMP over SockJS 채팅 소켓 (CHAT_FRONTEND_GUIDE.md 기준)
 */
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import type { ChatMessageResponse } from '../api/chat';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws-stomp';

export function useChatSocket(
  roomId: number | null,
  token: string | null,
  onMessage: (msg: ChatMessageResponse) => void
) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (roomId == null || !token) {
      setConnected(false);
      return;
    }

    const socket = new SockJS(WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/sub/chat/room/${roomId}`, (message: IMessage) => {
          try {
            const data = JSON.parse(message.body) as ChatMessageResponse;
            onMessageRef.current(data);
          } catch (e) {
            console.warn('Chat message parse error', e);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [roomId, token]);

  const send = (text: string) => {
    if (roomId == null || !clientRef.current?.active) return;
    clientRef.current.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify({ roomId, message: text }),
    });
  };

  return { send, connected };
}
