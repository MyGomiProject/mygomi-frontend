import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { chatApi, ChatMessageResponse } from '../api/chat';
import { useChatSocket } from '../hooks/useChatSocket';
import { reservationApi, ReservationStatusResponse } from '../api/reservation';
import './ChatRoomModal.css';

export interface ChatPostInfo {
  id: string;
  title: string;
  author?: string;
  userId?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  content: string;
  createdAt: string;
  /** 상대 메시지일 때 보낸 사람 닉네임 (표시용) */
  senderNickname?: string;
}

export const CHAT_STORAGE_KEY_PREFIX = 'chat_post_';
const CHAT_META_KEY_PREFIX = 'chat_meta_';
/** 소켓 채팅방별 메시지 캐시 (API에 내 메시지가 안 올 때 보완) */
const CHAT_ROOM_MESSAGES_PREFIX = 'chat_room_messages_';
/** 채팅방 roomId → 게시글 정보 (목록에서 열기용) */
export const CHAT_ROOM_META_PREFIX = 'chat_room_meta_';
/** 삭제한 채팅방 roomId 목록 (로컬에서만 숨김) */
const CHAT_DELETED_ROOM_IDS_KEY = 'chat_deleted_room_ids';
/** 헤더 알림에서 '확인함'으로 표시한 roomId 목록 (배지/목록에서 제외) */
export const CHAT_SEEN_NOTIFICATION_ROOM_IDS_KEY = 'chat_seen_notification_room_ids';

function loadRoomMessagesFromStorage(roomId: number): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_ROOM_MESSAGES_PREFIX + roomId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRoomMessagesToStorage(roomId: number, messages: ChatMessage[]) {
  try {
    localStorage.setItem(CHAT_ROOM_MESSAGES_PREFIX + roomId, JSON.stringify(messages));
  } catch (e) {
    console.warn('Failed to save room messages', e);
  }
}

export function loadMessages(postId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY_PREFIX + postId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(postId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY_PREFIX + postId, JSON.stringify(messages));
  } catch (e) {
    console.warn('Failed to save chat messages', e);
  }
}

function saveChatMeta(postId: string, meta: { title: string; author?: string }) {
  try {
    localStorage.setItem(CHAT_META_KEY_PREFIX + postId, JSON.stringify(meta));
  } catch (e) {
    console.warn('Failed to save chat meta', e);
  }
}

export interface ChatRoomListItem {
  roomId: number;
  postId: string;
  title: string;
  author?: string;
  lastMessage: string;
  lastMessageAt: string;
}

function getDeletedRoomIds(): number[] {
  try {
    const raw = localStorage.getItem(CHAT_DELETED_ROOM_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function deleteChatRoomFromList(roomId: number, onListUpdated?: () => void): void {
  try {
    const ids = getDeletedRoomIds();
    if (ids.includes(roomId)) return;
    localStorage.setItem(CHAT_DELETED_ROOM_IDS_KEY, JSON.stringify([...ids, roomId]));
    onListUpdated?.();
  } catch (e) {
    console.warn('deleteChatRoomFromList failed', e);
  }
}

export function getSeenNotificationRoomIds(): number[] {
  try {
    const raw = localStorage.getItem(CHAT_SEEN_NOTIFICATION_ROOM_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markNotificationRoomSeen(roomId: number, onUpdated?: () => void): void {
  try {
    const ids = getSeenNotificationRoomIds();
    if (ids.includes(roomId)) return;
    localStorage.setItem(CHAT_SEEN_NOTIFICATION_ROOM_IDS_KEY, JSON.stringify([...ids, roomId]));
    onUpdated?.();
  } catch (e) {
    console.warn('markNotificationRoomSeen failed', e);
  }
}

/** 새 메시지 도착 시 해당 방을 '확인 안 함'으로 돌려 헤더 벨 알림에 다시 표시 */
export function clearNotificationRoomSeen(roomId: number, onUpdated?: () => void): void {
  try {
    const ids = getSeenNotificationRoomIds().filter((id) => id !== roomId);
    localStorage.setItem(CHAT_SEEN_NOTIFICATION_ROOM_IDS_KEY, JSON.stringify(ids));
    onUpdated?.();
  } catch (e) {
    console.warn('clearNotificationRoomSeen failed', e);
  }
}

/** post 기반 로컬 채팅만 삭제 (목록에서 제거) */
export function removePostChatFromList(postId: string, onListUpdated?: () => void): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY_PREFIX + postId);
    localStorage.removeItem(CHAT_META_KEY_PREFIX + postId);
    onListUpdated?.();
  } catch (e) {
    console.warn('removePostChatFromList failed', e);
  }
}

/** API getRooms() 결과 + 로컬 메타/메시지로 목록 아이템 생성 (삭제한 방 제외) */
export function buildChatRoomListFromApi(
  rooms: { roomId: number; postTitle: string; opponentNickname: string; sharePostId?: number }[]
): ChatRoomListItem[] {
  const deletedSet = new Set(getDeletedRoomIds());
  const list: ChatRoomListItem[] = [];
  try {
    for (const room of rooms) {
      if (deletedSet.has(room.roomId)) continue;
      let postId = '';
      let title = room.postTitle;
      let author: string | undefined = room.opponentNickname;
      try {
        const metaRaw = localStorage.getItem(CHAT_ROOM_META_PREFIX + room.roomId);
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          if (meta.postId) postId = String(meta.postId);
          if (meta.title) title = meta.title;
          // author는 항상 API opponentNickname(채팅 상대) 사용. meta.author는 게시글 작성자라 목록에서는 쓰지 않음
        }
      } catch {}
      if (!postId && room.sharePostId != null) postId = String(room.sharePostId);
      if (!postId) postId = `room_${room.roomId}`;
      const roomMessages = loadRoomMessagesFromStorage(room.roomId);
      const lastMsg = roomMessages.length > 0 ? roomMessages[roomMessages.length - 1] : null;
      list.push({
        roomId: room.roomId,
        postId,
        title,
        author,
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageAt: lastMsg ? lastMsg.createdAt : '',
      });
    }
    list.sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
  } catch (e) {
    console.warn('buildChatRoomListFromApi failed', e);
  }
  return list;
}

/** 기존 post 기반 로컬 채팅 + API 방 목록 병합 (API 우선, post 기반은 postId로 보완) */
export function getChatRoomList(): ChatRoomListItem[] {
  const list: ChatRoomListItem[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(CHAT_STORAGE_KEY_PREFIX)) continue;
      const postId = key.slice(CHAT_STORAGE_KEY_PREFIX.length);
      const messages = loadMessages(postId);
      let title = '나눔 게시글';
      let author: string | undefined;
      try {
        const metaRaw = localStorage.getItem(CHAT_META_KEY_PREFIX + postId);
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          if (meta.title) title = meta.title;
          if (meta.author) author = meta.author;
        }
      } catch {}
      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
      list.push({
        roomId: 0,
        postId,
        title,
        author,
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageAt: lastMsg ? lastMsg.createdAt : '',
      });
    }
    list.sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
  } catch (e) {
    console.warn('getChatRoomList failed', e);
  }
  return list;
}

interface ChatRoomModalProps {
  post: ChatPostInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

/** 이메일 동일 여부 (공백·대소문자 무시) */
function isSameEmail(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** 서버 메시지 → 표시용 메시지 (본인/상대 구분) */
function toDisplayMessage(res: ChatMessageResponse, myEmail: string): ChatMessage {
  const isMe =
    myEmail.trim() !== '' &&
    isSameEmail(res.senderEmail || '', myEmail);
  return {
    id: String(res.messageId),
    sender: isMe ? 'me' : 'other',
    content: res.message,
    createdAt: res.sendTime || new Date().toISOString(),
    senderNickname: isMe ? undefined : (res.senderNickname || '상대방'),
  };
}

const ChatRoomModal: React.FC<ChatRoomModalProps> = ({ post, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { token, user } = useAuth();
  const myEmail = user?.email ?? '';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  // 목록에서 연 방은 post.id가 "room_14" 형태 → createRoom 호출하지 않고 roomId 직접 사용
  const isRoomIdFromList = Boolean(
    post?.id && typeof post.id === 'string' && /^room_\d+$/.test(post.id)
  );
  const roomIdFromList = isRoomIdFromList
    ? parseInt((post!.id as string).replace(/^room_/, ''), 10)
    : undefined;

  const { data: roomIdFromApi, isSuccess: hasRoomIdFromApi } = useQuery({
    queryKey: ['chat-room', post?.id],
    queryFn: () => chatApi.createRoom(post!.id),
    enabled: !!post?.id && isOpen && !isRoomIdFromList,
    retry: false,
  });

  const roomId = isRoomIdFromList ? roomIdFromList! : roomIdFromApi;
  const hasRoomId = isRoomIdFromList ? true : hasRoomIdFromApi;

  // 내 채팅방 목록에서 현재 방의 상대방 닉네임 조회 (헤더에 "↔ 상대방" 표시용)
  const { data: apiRooms } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms(),
    enabled: hasRoomId && roomId != null && isOpen,
  });
  const opponentFromApi =
    hasRoomId && roomId != null
      ? apiRooms?.find((r) => r.roomId === roomId)?.opponentNickname
      : undefined;

  // 과거 메시지 (소켓 채팅 모드일 때만)
  const { data: apiMessages } = useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: () => chatApi.getMessages(roomId!),
    enabled: hasRoomId && roomId != null,
  });

  // 실시간 수신 메시지 추가 (중복 제거)
  const handleSocketMessage = useCallback(
    (res: ChatMessageResponse) => {
      const display = toDisplayMessage(res, myEmail);
      setMessages((prev) => {
        if (prev.some((m) => m.id === display.id)) return prev;
        return [...prev, display];
      });
    },
    [myEmail]
  );

  const { send: sendSocket, connected } = useChatSocket(
    hasRoomId && roomId != null ? roomId : null,
    token,
    handleSocketMessage
  );

  // 소켓 모드: API 응답 올 때마다 병합 (API 우선, 그다음 소켓/로컬 보완). id 기준 중복 제거로 열 때마다 메시지 늘어나는 현상 방지
  const hasMergedApiRef = useRef(false);
  useEffect(() => {
    if (!hasRoomId || roomId == null || apiMessages == null) return;
    if (!myEmail.trim()) return;
    hasMergedApiRef.current = true;
    setMessages((prev) => {
      const fromApi = apiMessages.map((m) => toDisplayMessage(m, myEmail));
      const apiIds = new Set(fromApi.map((m) => m.id));
      const fromSocketOrPrev = prev.filter((m) => !apiIds.has(m.id));
      const fromStorage = loadRoomMessagesFromStorage(roomId!);
      const fromStorageOnly = fromStorage.filter((m) => !apiIds.has(m.id));
      const combined = [...fromApi, ...fromSocketOrPrev, ...fromStorageOnly];
      const byId = new Map<string, ChatMessage>();
      for (const m of combined) {
        if (!byId.has(m.id)) byId.set(m.id, m);
      }
      return Array.from(byId.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, [hasRoomId, roomId, apiMessages, myEmail]);

  // 병합이 한 번이라도 된 뒤에만 전체 메시지를 로컬에 저장 (API 반영 전 덮어쓰기 방지)
  useEffect(() => {
    if (!hasRoomId || roomId == null || !hasMergedApiRef.current || messages.length === 0) return;
    saveRoomMessagesToStorage(roomId, messages);
  }, [hasRoomId, roomId, messages]);

  // 채팅방(roomId)이 바뀌거나 모달 닫히면 병합 플래그 리셋
  const prevRoomIdRef = useRef<number | null>(null);
  useEffect(() => {
    const id = roomId ?? null;
    if (id !== prevRoomIdRef.current) {
      prevRoomIdRef.current = id;
      hasMergedApiRef.current = false;
    }
    if (!isOpen) hasMergedApiRef.current = false;
  }, [roomId, isOpen]);

  // 소켓 모드: roomId + post 있으면 로컬에 메타 저장 (마이페이지 목록에서 해당 방 열기용)
  useEffect(() => {
    if (!hasRoomId || roomId == null || !post || !isOpen) return;
    try {
      const meta = { postId: post.id, title: post.title, author: post.author };
      localStorage.setItem(CHAT_ROOM_META_PREFIX + roomId, JSON.stringify(meta));
    } catch (e) {
      console.warn('Failed to save room meta', e);
    }
  }, [hasRoomId, roomId, post?.id, post?.title, post?.author, isOpen]);

  // localStorage 폴백: 채팅방 API 없을 때
  useEffect(() => {
    if (!post || !isOpen) return;
    saveChatMeta(post.id, { title: post.title, author: post.author });
    if (!hasRoomId) {
      setMessages(loadMessages(post.id));
    }
  }, [post?.id, post?.title, post?.author, isOpen, hasRoomId]);

  const refetchPostListQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['my-share-posts'] });
    queryClient.invalidateQueries({ queryKey: ['nearby-posts-map'] });
    queryClient.invalidateQueries({ queryKey: ['nearby-posts'] });
    queryClient.invalidateQueries({ queryKey: ['share-posts'] });
    queryClient.invalidateQueries({ queryKey: ['all-nearby-posts'] });
    queryClient.refetchQueries({ queryKey: ['my-share-posts'] });
    queryClient.refetchQueries({ queryKey: ['nearby-posts-map'] });
    queryClient.refetchQueries({ queryKey: ['nearby-posts'] });
    queryClient.refetchQueries({ queryKey: ['share-posts'] });
    queryClient.refetchQueries({ queryKey: ['all-nearby-posts'] });
  }, [queryClient]);

  // 예약 상태 조회: GET .../status?roomId= (진입 시 + 폴링). postId가 "room_14" 형태면 API 호출 안 함
  const {
    data: reservationStatus,
    isSuccess: reservationApiReady,
    isError: reservationApiError,
    refetch: refetchReservationStatus,
    isFetching: reservationStatusFetching,
  } = useQuery({
    queryKey: ['reservation-status', post?.id, roomId],
    queryFn: () => reservationApi.getStatus(post!.id, roomId!),
    enabled: !!post?.id && roomId != null && isOpen && !isRoomIdFromList,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const d = query.state.data as ReservationStatusResponse | undefined;
      if (d?.postStatus === 'RESERVED' || d?.bothAgreed === true) return false;
      if (d?.myAgreed === true) return 2000;
      return 3000;
    },
    refetchIntervalInBackground: true,
  });

  // 예약 확정: postStatus가 RESERVED일 때만 표시 (DB 초기화 등으로 bothAgreed만 true인 잘못된 응답 방지)
  const isReservationConfirmed = reservationStatus?.postStatus === 'RESERVED';

  // 폴링으로 예약 확정 감지됐을 때 게시글 목록 즉시 갱신 (먼저 예약한 사람 쪽에서도 reserved 반영)
  const prevBothAgreedRef = useRef(false);
  useEffect(() => {
    if (isReservationConfirmed) {
      if (!prevBothAgreedRef.current) {
        prevBothAgreedRef.current = true;
        refetchPostListQueries();
      }
    } else {
      prevBothAgreedRef.current = false;
    }
  }, [isReservationConfirmed, refetchPostListQueries]);

  // 예약 동의: POST .../agree?roomId= (예약하기 버튼 클릭 시). md/나눔_예약_API_수정요청_백엔드.md
  const agreeMutation = useMutation({
    mutationFn: ({ postId, roomId: rId }: { postId: string; roomId: number }) =>
      reservationApi.agree(postId, rId),
    onSuccess: (data: ReservationStatusResponse | undefined, variables) => {
      if (variables) {
        queryClient.invalidateQueries({ queryKey: ['reservation-status', variables.postId, variables.roomId] });
      }
      refetchPostListQueries();
    },
    onError: (err: unknown) => {
      console.error('예약 동의 API 실패:', err);
      const msg =
        (err as { response?: { data?: { message?: string }; status?: number } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        '예약 동의에 실패했습니다.';
      alert(msg);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSend = () => {
    if (sendingRef.current) return;
    const text = input.trim();
    if (!text || !post) return;
    sendingRef.current = true;
    if (hasRoomId && roomId != null) {
      sendSocket(text);
      setInput('');
    } else {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        sender: 'me',
        content: text,
        createdAt: new Date().toISOString(),
      };
      const next = [...messages, newMsg];
      setMessages(next);
      saveMessages(post.id, next);
      setInput('');
    }
    setTimeout(() => {
      sendingRef.current = false;
    }, 150);
  };

  const handleReservationAgree = () => {
    if (!post || roomId == null || agreeMutation.isPending) return;
    agreeMutation.mutate({ postId: post.id, roomId });
  };

  // 메시지 항상 시간순 정렬 (과거 → 최신) — 자기 메시지가 위로 몰리는 현상 방지
  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [messages]
  );

  // 상단 "↔ 이름" = 채팅 버블에 나오는 상대와 동일 (버블과 같은 sortedMessages에서 추출)
  const opponentFromMessages = useMemo(() => {
    const otherMsg = sortedMessages.find((m) => m.sender === 'other' && m.senderNickname?.trim());
    return otherMsg?.senderNickname?.trim() || undefined;
  }, [sortedMessages]);
  const headerDisplayName = hasRoomId
    ? (opponentFromMessages ?? opponentFromApi ?? '상대방')
    : post?.author;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen || !post) return null;

  return (
    <div className="chat-room-modal-overlay" onClick={onClose}>
      <div className="chat-room-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-room-header">
          <button type="button" className="chat-room-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
          <div className="chat-room-title-wrap">
            <h2 className="chat-room-title">나눔 채팅</h2>
            <p className="chat-room-subtitle">{post.title}</p>
            {headerDisplayName && (
              <span className="chat-room-with">↔ {headerDisplayName}</span>
            )}
            {hasRoomId && (
              <span className={`chat-room-connection ${connected ? 'connected' : 'connecting'}`}>
                {connected ? '● 연결됨' : '○ 연결 중...'}
              </span>
            )}
          </div>
        </div>

        <div className="chat-room-messages">
          {sortedMessages.length === 0 && (
            <div className="chat-room-empty">
              <p>아직 대화가 없어요.</p>
              <p>첫 메시지를 보내보세요.</p>
            </div>
          )}
          {sortedMessages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="chat-message-bubble-wrap">
                {msg.sender === 'other' && msg.senderNickname && (
                  <span className="chat-message-sender-name">{msg.senderNickname}</span>
                )}
                <div className="chat-message-bubble">
                  <span className="chat-message-content">{msg.content}</span>
                  <span className="chat-message-time">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 예약하기 — 채팅 연결된 경우 둘 다 표시. 목록에서 연 방(room_14)은 예약 API 미지원 */}
        {hasRoomId && post && (
          <div className="chat-room-reservation">
            {isRoomIdFromList ? (
              <p className="chat-room-reservation-status hint">
                예약은 해당 나눔 글에서 채팅을 열면 이용할 수 있습니다.
              </p>
            ) : reservationApiReady && reservationStatus ? (
              <>
                {isReservationConfirmed ? (
                  <p className="chat-room-reservation-status confirmed">예약 확정됨</p>
                ) : reservationStatus.postStatus !== 'OPEN' ? (
                  <p className="chat-room-reservation-status">예약할 수 없는 상태입니다.</p>
                ) : reservationStatus.myAgreed ? (
                  <p className="chat-room-reservation-status waiting">
                    예약 요청함 · 상대방 수락 대기 중
                    <button
                      type="button"
                      className="chat-room-reservation-refresh"
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ['reservation-status', post?.id, roomId] });
                        refetchReservationStatus();
                      }}
                      disabled={reservationStatusFetching}
                    >
                      {reservationStatusFetching ? '확인 중...' : '새로고침'}
                    </button>
                  </p>
                ) : (
                  <>
                    {reservationStatus.otherAgreed && (
                      <p className="chat-room-reservation-status hint">상대방이 예약을 요청했습니다.</p>
                    )}
                    <button
                      type="button"
                      className="chat-room-reservation-button"
                      onClick={handleReservationAgree}
                      disabled={agreeMutation.isPending}
                    >
                      {agreeMutation.isPending ? '처리 중...' : '예약하기'}
                    </button>
                  </>
                )}
              </>
            ) : reservationApiError ? (
              <>
                <p className="chat-room-reservation-status hint">예약 상태를 불러오지 못했습니다. 예약하기를 눌러 동의할 수 있습니다.</p>
                <button
                  type="button"
                  className="chat-room-reservation-button"
                  onClick={handleReservationAgree}
                  disabled={agreeMutation.isPending}
                >
                  {agreeMutation.isPending ? '처리 중...' : '예약하기'}
                </button>
              </>
            ) : (
              <>
                <p className="chat-room-reservation-status hint">예약 상태 불러오는 중...</p>
                <button
                  type="button"
                  className="chat-room-reservation-button"
                  onClick={handleReservationAgree}
                  disabled={agreeMutation.isPending}
                >
                  {agreeMutation.isPending ? '처리 중...' : '예약하기'}
                </button>
              </>
            )}
          </div>
        )}

        <div className="chat-room-input-wrap">
          <input
            type="text"
            className="chat-room-input"
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                e.stopPropagation();
                handleSend();
              }
            }}
          />
          <button
            type="button"
            className="chat-room-send"
            onClick={handleSend}
            disabled={!input.trim() || (hasRoomId && !connected)}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomModal;
