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
}

interface SharingPostListProps {
  posts?: SharingPost[];
}

const SharingPostList: React.FC<SharingPostListProps> = ({ posts }) => {
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
    },
    {
      id: '2',
      title: '책장 나눔합니다',
      description: '작은 책장 나눔합니다. 상태 양호합니다.',
      author: '신규구',
      location: '시부야구',
      createdAt: '2024-01-28',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
    },
    {
      id: '3',
      title: '자전거 나눔합니다',
      description: '자전거 나눔합니다. 잘 타고 다녔어요.',
      author: '지험',
      location: '미나토구',
      createdAt: '2024-01-27',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    },
  ];

  const handlePostClick = (postId: string) => {
    // 게시글 상세 페이지로 이동 (추후 구현)
    console.log('Post clicked:', postId);
  };

  return (
    <div className="sharing-post-list">
      {defaultPosts.map((post) => (
        <div
          key={post.id}
          className="sharing-post-card"
          onClick={() => handlePostClick(post.id)}
        >
          <div className="post-content-wrapper">
            {post.imageUrl && (
              <div className="post-image">
                <img src={post.imageUrl} alt={post.title} />
              </div>
            )}
            <div className="post-content">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">{post.description}</p>
              <div className="post-meta">
                <span className="post-author">{post.author}</span>
                <span className="post-location">📍 {post.location}</span>
                <span className="post-date">{post.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SharingPostList;

