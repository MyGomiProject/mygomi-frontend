import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { sharePostApi } from '../api/sharePost';
import { getCategoryLabel, getCategoryEmoji } from '../constants/sharePost';
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
  userId?: number; // 본인 게시글 확인용
}

interface SharingPostListProps {
  posts?: SharingPost[];
  onPostClick?: (post: SharingPost) => void;
  ward?: string;
  status?: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED';
  hideMyPosts?: boolean;
}

const SharingPostList: React.FC<SharingPostListProps> = ({ posts, onPostClick, ward, status, hideMyPosts = false }) => {
  const { user } = useAuth();
  // 상태 한글 매핑
  const statusLabels: Record<string, { label: string; color: string }> = {
    OPEN: { label: '나눔 중', color: '#66bb6a' },
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

  // API로 게시글 목록 조회 (5km 이내 주변 게시글)
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['nearby-posts', ward, status],
    queryFn: () => sharePostApi.getNearbyPosts({ page: 0, size: 20 }),
    enabled: !posts, // posts prop이 제공되면 API 호출 안 함
  });

  // posts prop이 있으면 그것을 사용, 없으면 API 데이터 사용
  const displayPosts: SharingPost[] = (() => {
    if (posts) {
      return posts;
    }
    
    if (!postsData || !postsData.data) {
      return [];
    }
    
    // data가 배열인지 확인
    const postsArray = Array.isArray(postsData.data) 
      ? postsData.data 
      : [];
    
    // 디버깅: API 응답 데이터 확인
    console.log('전체 게시글 데이터:', postsArray);
    console.log('게시글 상태별 분류:', {
      OPEN: postsArray.filter(p => p.status === 'OPEN').length,
      RESERVED: postsArray.filter(p => p.status === 'RESERVED').length,
      COMPLETED: postsArray.filter(p => p.status === 'COMPLETED').length,
      DELETED: postsArray.filter(p => p.status === 'DELETED').length,
    });

    return postsArray
      .filter((post) => {
        // 본인 게시글 필터링: userId가 현재 사용자 id와 다르거나, userId가 없으면 표시
        // 수정: hideMyPosts가 true일 때만 내 글 숨기기
        if (hideMyPosts && user && post.userId && post.userId === user.id) {
          console.log('본인 게시글 제외:', post.id, post.title);
          return false; // 본인 게시글은 제외
        }
        // 상태 필터링: COMPLETED(나눔 완료)와 DELETED(삭제됨)는 제외, OPEN(나눔 대기)과 RESERVED(예약됨)는 표시
        if (post.status === 'COMPLETED' || post.status === 'DELETED') {
          console.log('완료/삭제 게시글 제외:', post.id, post.title, post.status);
          return false;
        }
        console.log('게시글 표시:', post.id, post.title, post.status);
        return true;
      })
      .map((post) => {
        // 지역 정보 구성 (ward + town)
        let locationStr = '';
        if (post.ward) {
          locationStr = post.ward;
          if (post.town) {
            locationStr += ` ${post.town}`;
          }
        } else if (post.location) {
          locationStr = post.location;
        }

        // 디버깅: API 응답 구조 확인
        if (!post.author && post.userId) {
          console.log('게시글에 author 필드가 없습니다:', {
            postId: post.id,
            userId: post.userId,
            전체응답: post,
          });
        }

        return {
          id: String(post.id),
          title: post.title,
          description: post.description || post.content || '',
          author: post.author || '익명', // 백엔드에서 author 필드를 포함해서 반환해야 함
          location: locationStr,
          createdAt: post.createdAt,
          imageUrl: post.thumbnailUrl || post.imageUrls?.[0],
          imageUrls: post.imageUrls,
          category: post.category,
          status: post.status,
          userId: post.userId, // 본인 게시글 확인을 위해 userId 추가
        };
      });
  })();

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
                    {getCategoryEmoji(post.category)} {getCategoryLabel(post.category)}
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
