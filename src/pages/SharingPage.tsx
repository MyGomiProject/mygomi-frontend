import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import Map from '../components/Map';
import SharingPostList from '../components/SharingPostList';
import SharingPostModal from '../components/SharingPostModal';
import AllPostsModal from '../components/AllPostsModal';
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
  const [selectedPost, setSelectedPost] = useState<SharingPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAllPostsModalOpen, setIsAllPostsModalOpen] = useState(false);

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
                <button className="write-button" onClick={handleWriteClick}>
                  ✏️ 글쓰기
                </button>
              </div>
              <SharingPostList onPostClick={handlePostClick} hideMyPosts />
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
      />

      <AllPostsModal
        isOpen={isAllPostsModalOpen}
        onClose={() => setIsAllPostsModalOpen(false)}
        onPostClick={handlePostClick} // 전체 보기 모달에서 글을 클릭하면 상세 모달이 뜨도록 연결!
      />
    </div>
  );
};

export default SharingPage;

