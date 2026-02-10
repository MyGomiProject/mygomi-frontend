import React from 'react';
import './SharingPostList.css';

interface SharingPost {
  id: string;
  title: string;
  description: string;
  author: string;
  location: string;
  createdAt: string;
  imageUrl?: string;
  imageUrls?: string[]; // 여러 장의 이미지
  category?: string;
  status?: 'OPEN' | 'RESERVED' | 'COMPLETED';
}

interface SharingPostListProps {
  posts?: SharingPost[];
  onPostClick?: (post: SharingPost) => void;
}

const SharingPostList: React.FC<SharingPostListProps> = ({ posts, onPostClick }) => {
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
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 예시 데이터
  const defaultPosts: SharingPost[] = posts || [
    {
      id: '1',
      title: '전자레인지 나눔합니다',
      description: '사용 잘하는 전자레인지입니다. 깨끗하게 사용했어요.',
      author: '지윤',
      location: '신주쿠구',
      createdAt: '2024-01-29',
      imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=300&h=300&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
      ],
      category: 'ELECTRONICS',
      status: 'OPEN',
    },
    {
      id: '2',
      title: '책장 나눔합니다',
      description: '작은 책장 나눔합니다. 상태 양호합니다.',
      author: '신규구',
      location: '시부야구',
      createdAt: '2024-01-28',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
      ],
      category: 'FURNITURE',
      status: 'RESERVED',
    },
    {
      id: '3',
      title: '자전거 나눔합니다',
      description: '자전거 나눔합니다. 잘 타고 다녔어요.',
      author: '지험',
      location: '미나토구',
      createdAt: '2024-01-27',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
      ],
      category: 'ETC',
      status: 'COMPLETED',
    },
    {
      id: '4',
      title: '자전거 나눔합니다',
      description: '자전거 나눔합니다. 잘 타고 다녔어요.',
      author: '지험',
      location: '미나토구',
      createdAt: '2024-01-27',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      imageUrls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
      ],
      category: 'ETC',
      status: 'COMPLETED',
    },
  ];

  const handlePostClick = (post: SharingPost) => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  return (
    <div className="sharing-post-list">
      {defaultPosts.map((post) => (
        <div
          key={post.id}
          className="sharing-post-card"
          onClick={() => handlePostClick(post)}
        >
          <div className="post-content-wrapper">
            {post.imageUrl && (
              <div className="post-image">
                <img src={post.imageUrl} alt={post.title} />
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

