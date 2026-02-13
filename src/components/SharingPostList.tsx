import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sharePostApi } from '../api/sharePost';
import Loading from './Loading';
import ErrorDisplay from './ErrorDisplay';
import './SharingPostList.css';

interface SharingPost {
  id: string;
  title: string;
  description: string;
  author?: string;
  location?: string;
  createdAt: string;
  imageUrl?: string;
  imageUrls?: string[]; // 여러 장의 이미지
  category?: string;
  status?: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
  thumbnailUrl?: string;
  ward?: string;
}

interface SharingPostListProps {
  posts?: SharingPost[];
  onPostClick?: (post: SharingPost) => void;
  ward?: string;
  status?: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
}

const SharingPostList: React.FC<SharingPostListProps> = ({ posts, onPostClick, ward, status }) => {
  // 카테고리 한글 매핑
  const categoryLabels: Record<string, string> = {
    FURNITURE: '가구',
    ELECTRONICS: '전자제품',
    CLOTHING: '의류',
    BOOKS: '도서',
    TOYS: '장난감',
    KITCHEN: '주방용품',
    ETC: '기타',
  };

  // 상태 한글 매핑
  const statusLabels: Record<string, { label: string; color: string }> = {
    OPEN: { label: '나눔 대기', color: '#66bb6a' },
    RESERVED: { label: '예약됨', color: '#ff9800' },
    COMPLETED: { label: '나눔 완료', color: '#999' },
    DELETED: { label: '삭제됨', color: '#f44336' },
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // API로 게시글 목록 조회
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['share-posts', ward, status],
    queryFn: () => sharePostApi.getPosts({ ward, status, page: 0, size: 20 }),
    enabled: !posts, // posts prop이 제공되면 API 호출 안 함
  });

  // posts prop이 있으면 그것을 사용, 없으면 API 데이터 사용
  const displayPosts: SharingPost[] = posts || postsData?.data.map((post) => ({
    id: String(post.id),
    title: post.title,
    description: post.description || post.content || '',
    author: post.author,
    location: post.ward || post.location || '',
    createdAt: post.createdAt,
    imageUrl: post.thumbnailUrl || post.imageUrls?.[0],
    imageUrls: post.imageUrls,
    category: post.category,
    status: post.status,
  })) || [];

  const handlePostClick = (post: SharingPost) => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  if (isLoading) {
    return <Loading message="게시글을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorDisplay message="게시글을 불러오는데 실패했습니다." />;
  }

  if (displayPosts.length === 0) {
    return <div className="no-posts">게시글이 없습니다.</div>;
  }

  return (
    <div className="sharing-post-list">
      {displayPosts.map((post) => (
        <div
          key={post.id}
          className="sharing-post-card"
          onClick={() => handlePostClick(post)}
        >
          <div className="post-content-wrapper">
            {post.imageUrl && (
              <div className="post-image">
                <img 
                  src={
                    post.imageUrl.startsWith('http://') || post.imageUrl.startsWith('https://')
                      ? post.imageUrl
                      : `http://localhost:8080${post.imageUrl.startsWith('/') ? post.imageUrl : `/${post.imageUrl}`}`
                  } 
                  alt={post.title} 
                />
              </div>
            )}
            <div className="post-content">
              <div className="post-header">
                <h3 className="post-title">{post.title}</h3>
                {post.status && (
                  <span 
                    className={`post-status post-status-${post.status.toLowerCase()}`}
                    style={{ color: statusLabels[post.status]?.color }}
                  >
                    {statusLabels[post.status]?.label}
                  </span>
                )}
              </div>
              <p className="post-description">{post.description}</p>
              <div className="post-info">
                {post.category && (
                  <span className="post-category">
                    📦 {categoryLabels[post.category] || post.category}
                  </span>
                )}
                <span className="post-location">📍 {post.location}</span>
              </div>
              <div className="post-meta">
                <span className="post-author">작성자: {post.author}</span>
                <span className="post-date">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SharingPostList;

