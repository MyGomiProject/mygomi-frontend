import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import Map from '../components/Map';
import SharingPostList from '../components/SharingPostList';
import SharingPostModal from '../components/SharingPostModal';
import ChatRoomModal, { ChatPostInfo } from '../components/ChatRoomModal';
import AllPostsModal from '../components/AllPostsModal';
import KeywordAlertModal from '../components/KeywordAlertModal';
import { sharePostApi } from '../api/sharePost';
import './SharingPage.css';

interface SharingPost {
  id: string;
  title: string;
  description: string;
  author?: string;
  location?: string;
  createdAt: string;
  imageUrl?: string;
  imageUrls?: string[];
  category?: string;
  status?: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
  userId?: number; // 본인 게시글 확인용
}

const SharingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPost, setSelectedPost] = useState<SharingPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatPost, setChatPost] = useState<ChatPostInfo | null>(null);
  const [isAllPostsModalOpen, setIsAllPostsModalOpen] = useState(false);
  const [isKeywordAlertModalOpen, setIsKeywordAlertModalOpen] = useState(false);

  // 벨 알림에서 키워드 알림 클릭 시 해당 글 상세 모달 열기
  useEffect(() => {
    const openPostId = (location.state as { openPostId?: string })?.openPostId;
    if (!openPostId) return;
    navigate(location.pathname, { replace: true, state: {} });
    sharePostApi
      .getPost(openPostId)
      .then((res) => {
        const raw = res as unknown as Record<string, unknown>;
        const author =
          typeof raw.author === 'string'
            ? raw.author
            : (raw as { userNickname?: string }).userNickname ??
              (raw as { writerNickname?: string }).writerNickname ??
              (raw as { user?: { nickname?: string } }).user?.nickname;
        const description =
          typeof raw.description === 'string'
            ? raw.description
            : typeof raw.content === 'string'
              ? raw.content
              : '';
        const imageUrls = Array.isArray(raw.imageUrls)
          ? raw.imageUrls
          : raw.imageUrl
            ? [raw.imageUrl]
            : (raw as { images?: string[] }).images ?? [];
        const firstImage =
          Array.isArray(imageUrls) && imageUrls.length > 0 && typeof imageUrls[0] === 'string'
            ? imageUrls[0]
            : (raw.thumbnailUrl as string | undefined);
        const locationStr =
          typeof raw.location === 'string'
            ? raw.location
            : [raw.ward, (raw as { town?: string }).town]
                .filter(Boolean)
                .join(' ');
        const post: SharingPost = {
          id: String(raw.id),
          title: typeof raw.title === 'string' ? raw.title : '',
          description,
          author: typeof author === 'string' ? author : undefined,
          location: typeof locationStr === 'string' ? locationStr : undefined,
          createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
          imageUrl: firstImage,
          imageUrls: Array.isArray(imageUrls) ? (imageUrls as string[]) : undefined,
          category: typeof raw.category === 'string' ? raw.category : undefined,
          status: (raw.status as SharingPost['status']) ?? 'OPEN',
          userId: typeof raw.userId === 'number' ? raw.userId : undefined,
        };
        setSelectedPost(post);
        setIsModalOpen(true);
      })
      .catch(() => {});
  }, [location.state, location.pathname, navigate]);

  const handleWriteClick = () => {
    navigate('/sharing/create');
  };

  const handlePostClick = (post: SharingPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleMarkerClick = (marker: {
    id: string;
    title: string;
    description?: string;
    author?: string;
    location?: string;
    createdAt?: string;
    imageUrl?: string;
    imageUrls?: string[];
    category?: string;
    status?: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
    userId?: number;
  }) => {
    const post: SharingPost = {
      id: marker.id,
      title: marker.title,
      description: marker.description || '',
      author: marker.author,
      location: marker.location,
      createdAt: marker.createdAt || new Date().toISOString(),
      imageUrl: marker.imageUrl,
      imageUrls: marker.imageUrls || (marker.imageUrl ? [marker.imageUrl] : undefined),
      category: marker.category,
      status: marker.status || 'OPEN',
      userId: marker.userId, // 본인 게시글 확인용
    };
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  return (
    <div className="sharing-page">
      <ParallaxBackground />
      <Header />
      <main className="sharing-main">
        <div className="sharing-container">
          <div className="sharing-header">
            <h1 className="sharing-title">근처 나눔 지도</h1>
            <p className="sharing-subtitle">우리 동네의 나눔 물품들을 확인해보세요</p>
          </div>
          <div className="sharing-content-wrapper">
            <div className="sharing-map-section">
              <h2 className="map-section-title">동네 나눔 지도</h2>
              <Map onMarkerClick={handleMarkerClick} />
            </div>
            <div className="sharing-posts-section">
              <div className="posts-header">
                <h2 className="posts-title">나눔 게시글</h2>
                <div className="posts-header-buttons">
                  <button
                    type="button"
                    className="keyword-alert-button"
                    onClick={() => setIsKeywordAlertModalOpen(true)}
                  >
                    🧷 키워드 알림
                  </button>
                  <button className="write-button" onClick={handleWriteClick}>
                    ✏️ 글쓰기
                  </button>
                </div>
              </div>
              <SharingPostList onPostClick={handlePostClick} />
              <button 
                className="view-all-button"
                onClick={() => setIsAllPostsModalOpen(true)}
              >
                전체 목록 더보기 / 검색 🔍
              </button>
            </div>
          </div>
        </div>
      </main>
      <SharingPostModal 
        post={selectedPost} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onOpenChat={(post) => setChatPost({ id: post.id, title: post.title, author: post.author, userId: post.userId })}
      />
      <ChatRoomModal
        post={chatPost}
        isOpen={!!chatPost}
        onClose={() => setChatPost(null)}
      />

      <AllPostsModal
        isOpen={isAllPostsModalOpen}
        onClose={() => setIsAllPostsModalOpen(false)}
        onPostClick={handlePostClick} // 전체 보기 모달에서 글을 클릭하면 상세 모달이 뜨도록 연결!
      />

      <KeywordAlertModal
        isOpen={isKeywordAlertModalOpen}
        onClose={() => setIsKeywordAlertModalOpen(false)}
      />
    </div>
  );
};

export default SharingPage;

