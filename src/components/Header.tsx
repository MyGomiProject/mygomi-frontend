import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { chatApi } from '../api/chat';
import {
  buildChatRoomListFromApi,
  getSeenNotificationRoomIds,
  markNotificationRoomSeen,
} from './ChatRoomModal';
import {
  getKeywordAlertUnseen,
  markKeywordAlertSeen,
  type KeywordAlertItem,
} from '../utils/keywordAlert';
import BellIcon from './BellIcon';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [seenNotificationRoomIds, setSeenNotificationRoomIds] = useState<number[]>(() =>
    getSeenNotificationRoomIds()
  );
  const [keywordAlerts, setKeywordAlerts] = useState<KeywordAlertItem[]>(() =>
    getKeywordAlertUnseen()
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: apiRooms } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms(),
    enabled: !!token,
  });

  const chatRoomList = useMemo(() => {
    if (!apiRooms || !Array.isArray(apiRooms)) return [];
    return buildChatRoomListFromApi(apiRooms);
  }, [apiRooms]);

  const unreadChatRoomList = useMemo(
    () => chatRoomList.filter((room) => !seenNotificationRoomIds.includes(room.roomId)),
    [chatRoomList, seenNotificationRoomIds]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleChatNotification = (e: Event) => {
      const { roomId } = (e as CustomEvent<{ roomId: number }>).detail ?? {};
      if (typeof roomId !== 'number') return;
      setSeenNotificationRoomIds((prev) => prev.filter((id) => id !== roomId));
    };
    window.addEventListener('chat-notification-received', handleChatNotification);
    return () => window.removeEventListener('chat-notification-received', handleChatNotification);
  }, []);

  useEffect(() => {
    const handler = () => setKeywordAlerts(getKeywordAlertUnseen());
    window.addEventListener('keyword-alert-updated', handler);
    return () => window.removeEventListener('keyword-alert-updated', handler);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationToggle = () => {
    setNotificationOpen((prev) => !prev);
  };

  const handleChatRoomClick = (room: { roomId: number; postId: string; title: string; author?: string }) => {
    markNotificationRoomSeen(room.roomId);
    setSeenNotificationRoomIds((prev) => (prev.includes(room.roomId) ? prev : [...prev, room.roomId]));
    setNotificationOpen(false);
    navigate('/mypage', { state: { openChat: { id: room.postId, title: room.title, author: room.author } } });
  };

  const handleKeywordAlertClick = (postId: string) => {
    markKeywordAlertSeen(postId);
    setKeywordAlerts((prev) => prev.filter((a) => a.postId !== postId));
    setNotificationOpen(false);
    navigate('/sharing', { state: { openPostId: postId } });
  };

  const totalNotificationCount = unreadChatRoomList.length + keywordAlerts.length;

  // 닉네임이 있으면 닉네임, 없으면 이메일 앞부분 표시
  const displayName = user?.nickname || user?.email?.split('@')[0] || '사용자';

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <span className="logo-text">MYGOMI</span>
            <span className="logo-icon"></span>
          </Link>
        </div>
        <nav className="header-nav">
          <Link to="/integrated-search" className="nav-link">분리수거 정보</Link>
          <Link to="/sharing" className="nav-link">나눔</Link>
          {token && <Link to="/mypage" className="nav-link">마이페이지</Link>}

          {/* 💡 관리자(ADMIN)용 */}
          {user?.role === 'ADMIN' && (
            <Link to="/admin/reports" className="nav-link" style={{ fontWeight: 'bold', color: 'green' }}>
              신고 관리
            </Link>
          )}

          {token ? (
            <div className="user-menu">
              <div className="header-notification-wrap" ref={dropdownRef}>
                <button
                  type="button"
                  className="header-notification-btn"
                  onClick={handleNotificationToggle}
                  aria-label="알림"
                  title="알림"
                >
                  <span className="header-notification-icon-wrap">
                    <BellIcon className="header-notification-icon" size={22} />
                    {totalNotificationCount > 0 && (
                      <span className="header-notification-badge">{totalNotificationCount}</span>
                    )}
                  </span>
                </button>
                {notificationOpen && (
                  <div className="header-notification-dropdown">
                    <div className="header-notification-dropdown-title">알림</div>
                    <div className="header-notification-body">
                      {/* 채팅 알림 섹션 */}
                      <div className="header-notification-section">
                      <div className="header-notification-section-title">채팅</div>
                      {unreadChatRoomList.length === 0 ? (
                        <div className="header-notification-empty">새로운 채팅이 없습니다.</div>
                      ) : (
                        <ul className="header-notification-list">
                          {unreadChatRoomList.map((room) => (
                            <li key={room.roomId} className="header-notification-item">
                              <button
                                type="button"
                                className="header-notification-item-btn"
                                onClick={() => handleChatRoomClick(room)}
                              >
                                <span className="header-notification-item-title">{room.title}</span>
                                {room.author && (
                                  <span className="header-notification-item-author">↔ {room.author}</span>
                                )}
                                {room.lastMessage && (
                                  <span className="header-notification-item-preview">
                                    {room.lastMessage.length > 25 ? room.lastMessage.slice(0, 25) + '…' : room.lastMessage}
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {/* 키워드 알림 섹션 */}
                    {keywordAlerts.length > 0 && (
                      <div className="header-notification-section">
                        <div className="header-notification-section-title">키워드 알림</div>
                        <ul className="header-notification-list">
                          {keywordAlerts.map((alert) => (
                            <li key={`${alert.postId}-${alert.keyword}`} className="header-notification-item">
                              <button
                                type="button"
                                className="header-notification-item-btn"
                                onClick={() => handleKeywordAlertClick(alert.postId)}
                              >
                                <span className="header-notification-item-title">[{alert.keyword}] {alert.title}</span>
                                <span className="header-notification-item-preview">새 글이 올라왔어요</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    </div>
                    <div className="header-notification-footer">
                      <Link to="/mypage" className="header-notification-link" onClick={() => setNotificationOpen(false)}>
                        마이페이지에서 채팅 보기
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <span className="user-nickname">{displayName}</span>
              <button className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={handleLoginClick}>
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

