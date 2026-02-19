import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sharePostApi } from '../api/sharePost';
import SharingPostList from './SharingPostList';
import { useAuth } from '../contexts/AuthContext';
import './AllPostsModal.css';

interface AllPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostClick: (post: any) => void;
}

const AllPostsModal: React.FC<AllPostsModalProps> = ({ isOpen, onClose, onPostClick }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMyPostsHidden, setIsMyPostsHidden] = useState(false); // 내 글 숨기기 상태
  const [page, setPage] = useState(0);

  // 모달이 열려있을 때만 데이터를 가져옵니다. (페이지네이션 적용)
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['all-nearby-posts', page],
    queryFn: () => sharePostApi.getNearbyPosts({ page, size: 20 }),
    enabled: isOpen,
  });

  // 모달이 닫히면 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setPage(0);
      setIsMyPostsHidden(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 백엔드에서 받아온 데이터
  const postsArray = postsData?.data && Array.isArray(postsData.data) ? postsData.data : [];
  
const filteredPosts = postsArray
    .filter((post: any) => 
      post.title.includes(searchTerm) || 
      (post.description && post.description.includes(searchTerm))
    )
    .filter((post: any) => {
      // 나눔 완료/삭제된 글 안 보이게 처리 (선택사항)
      if (post.status === 'COMPLETED' || post.status === 'DELETED') return false;
      
      // 내 글 숨기기 버튼이 켜져있고, 이 글의 작성자가 '나'라면? 목록에서 제외!
      if (isMyPostsHidden && user && post.userId === user.id) {
        return false; 
      }
      return true;
    })

    .map((post: any) => {
      // 지역 정보 조합 로직 (SharingPostList와 동일하게 맞춰줍니다)
      let locationStr = '';
      if (post.ward) {
        locationStr = post.ward;
        if (post.town) locationStr += ` ${post.town}`;
      } else if (post.location) {
        locationStr = post.location;
      }

      return {
        id: String(post.id), // 💡 핵심 해결 부분! number를 string으로 변환
        title: post.title,
        description: post.description || post.content || '',
        author: post.author || '익명',
        location: locationStr,
        createdAt: post.createdAt,
        imageUrl: post.thumbnailUrl || post.imageUrls?.[0],
        imageUrls: post.imageUrls,
        category: post.category,
        status: post.status,
        userId: post.userId,
      };
    });

  return (
    <div className="all-posts-modal-overlay" onClick={onClose}>
      <div className="all-posts-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="all-posts-modal-header">
          <h2>전체 나눔 게시글</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="all-posts-modal-controls">
          <input 
            type="text" 
            className="search-input"
            placeholder="검색어를 입력하세요..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className={`toggle-button ${isMyPostsHidden ? 'active' : ''}`}
            onClick={() => setIsMyPostsHidden(!isMyPostsHidden)}
          >
            {isMyPostsHidden ? '👀 내 글 보기' : '😶‍🌫️ 내 글 숨기기'}
          </button>
        </div>

        <div className="all-posts-modal-list">
          {isLoading ? (
            <div className="loading-text">데이터를 불러오는 중...</div>
          ) : (
            <SharingPostList 
              posts={filteredPosts} 
              onPostClick={onPostClick} 
              hideMyPosts={isMyPostsHidden} // 💡 1단계에서 만든 프롭스 활약!
            />
          )}
        </div>

        <div className="all-posts-modal-pagination">
          <button 
            disabled={page === 0} 
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          >
            이전
          </button>
          <span>페이지 {page + 1}</span>
          <button 
            // 💡 주의: 백엔드에서 마지막 페이지 여부(isLast 등)를 내려준다면 조건 수정 필요
            disabled={postsArray.length < 20} 
            onClick={() => setPage((prev) => prev + 1)}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllPostsModal;