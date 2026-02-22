import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { sharePostApi } from '../api/sharePost';
import './SharingPostModal.css';

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
  userId?: number; // 본인 게시글 확인용
}

interface SharingPostModalProps {
  post: SharingPost | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDetail?: (post: SharingPost) => void;
  onStatusUpdate?: (postId: string, newStatus: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED') => void;
  onOpenChat?: (post: SharingPost) => void;
}

const SharingPostModal: React.FC<SharingPostModalProps> = ({ post, isOpen, onClose, onViewDetail, onStatusUpdate, onOpenChat }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED' | undefined>(post?.status);
  
  // 본인 게시글인지 확인
  const isMyPost = user && post?.userId && post.userId === user.id;
  // 이미지 URL을 전체 URL로 변환하는 함수
  const getImageUrl = useCallback((url: string | undefined): string => {
    if (!url) return '';
    // 이미 전체 URL인 경우 (http:// 또는 https://로 시작)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // 상대 경로인 경우 백엔드 URL로 직접 변환
    // 프록시가 작동하지 않을 경우를 대비해 직접 백엔드 URL 사용
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
    return `${baseURL}${url.startsWith('/') ? url : `/${url}`}`;
  }, []);

  // 이미지 배열 처리 (imageUrls가 있으면 사용, 없으면 imageUrl을 배열로 변환)
  const images = useMemo(() => {
    if (!post) return [];
    let imageList: string[] = [];
    if (post.imageUrls && post.imageUrls.length > 0) {
      imageList = post.imageUrls;
    } else if (post.imageUrl) {
      imageList = [post.imageUrl];
    }
    // 모든 이미지 URL을 전체 URL로 변환
    const convertedImages = imageList.map(getImageUrl).filter(Boolean);
    console.log('이미지 URL 변환:', {
      원본: imageList,
      변환됨: convertedImages,
      변환_함수_결과: imageList.map(url => {
        const result = getImageUrl(url);
        console.log(`  "${url}" -> "${result}"`);
        return result;
      }),
    });
    return convertedImages;
  }, [post, getImageUrl]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 게시물이 변경되면 이미지 인덱스 초기화 및 상태 동기화
  useEffect(() => {
    if (post) {
      setSelectedImageIndex(0);
      setCurrentStatus(post.status);
      console.log('모달에 전달된 게시글 데이터:', {
        id: post.id,
        title: post.title,
        description: post.description,
        descriptionLength: post.description?.length || 0,
        imageUrls: post.imageUrls,
        imageUrl: post.imageUrl,
        images: images,
        imagesLength: images.length,
        author: post.author,
        status: post.status,
      });
    }
  }, [post, images]);

  // 상태 변경 mutation
  const statusUpdateMutation = useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: 'OPEN' | 'RESERVED' | 'COMPLETED' | 'DELETED' }) =>
      sharePostApi.updateStatus(postId, status),
    onSuccess: (data, variables) => {
      setCurrentStatus(variables.status);
      // 쿼리 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['my-share-posts'] });
      queryClient.invalidateQueries({ queryKey: ['share-posts'] });
      if (onStatusUpdate) {
        onStatusUpdate(variables.postId, variables.status);
      }
      // DELETED 상태로 변경되면 모달 닫기
      if (variables.status === 'DELETED') {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    },
    onError: (error) => {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    },
  });

  const handleToggleStatus = () => {
    if (!post) return;
    
    // OPEN ↔ COMPLETED 토글
    const newStatus: 'OPEN' | 'COMPLETED' = currentStatus === 'OPEN' ? 'COMPLETED' : 'OPEN';
    statusUpdateMutation.mutate({ postId: post.id, status: newStatus });
  };

  const handleDeletePost = () => {
    if (!post) return;
    
    if (window.confirm('정말 이 게시물을 삭제하시겠습니까?')) {
      statusUpdateMutation.mutate({ postId: post.id, status: 'DELETED' });
    }
  };

  const handleOpenChat = () => {
    if (!post) return;
    onOpenChat?.(post);
    onClose();
  };

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

  // 상태 한글 매핑 (4개 상태)
  const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
    OPEN: { label: '나눔 대기', color: '#66bb6a', bgColor: 'rgba(102, 187, 106, 0.1)' },
    RESERVED: { label: '예약됨', color: '#ff9800', bgColor: 'rgba(255, 152, 0, 0.1)' },
    COMPLETED: { label: '나눔 완료', color: '#999', bgColor: 'rgba(153, 153, 153, 0.1)' },
    DELETED: { label: '삭제됨', color: '#f44336', bgColor: 'rgba(244, 67, 54, 0.1)' },
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // 스크롤 방지
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !post) {
    return null;
  }

  // 현재 상태 정보 가져오기 (currentStatus 우선 사용)
  const displayStatus = currentStatus || post?.status;
  const statusInfo = displayStatus 
    ? (statusLabels[displayStatus] || (displayStatus === 'OPEN' ? statusLabels.OPEN : statusLabels.COMPLETED))
    : null;

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="sharing-post-modal-overlay" onClick={onClose}>
      <div className="sharing-post-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>

        <div className="modal-content">
          {/* 이미지 섹션 */}
          {images.length > 0 && (
            <div className="modal-image-section">
              <img 
                src={images[selectedImageIndex]} 
                alt={`${post.title} - ${selectedImageIndex + 1}`}
                onError={(e) => {
                  console.error('이미지 로드 실패:', {
                    src: images[selectedImageIndex],
                    index: selectedImageIndex,
                    allImages: images,
                  });
                }}
                onLoad={() => {
                  console.log('이미지 로드 성공:', images[selectedImageIndex]);
                }}
              />
              {images.length > 1 && (
                <>
                  <button className="image-nav-button prev" onClick={handlePrevImage}>
                    ‹
                  </button>
                  <button className="image-nav-button next" onClick={handleNextImage}>
                    ›
                  </button>
                  <div className="image-indicator">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                  <div className="image-thumbnails">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img src={img} alt={`썸네일 ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 정보 섹션 */}
          <div className="modal-info-section">
            <div className="modal-header">
              <h1 className="modal-title">{post.title}</h1>
              {statusInfo && (
                <span
                  className="modal-status"
                  style={{
                    color: statusInfo.color,
                    backgroundColor: statusInfo.bgColor,
                  }}
                >
                  {statusInfo.label}
                </span>
              )}
            </div>

            <div className="modal-meta">
              <div className="modal-meta-item">
                <span className="meta-label">작성자</span>
                <span className="meta-value">{post.author || '본인'}</span>
              </div>
              <div className="modal-meta-item">
                <span className="meta-label">작성일</span>
                <span className="meta-value">{formatDate(post.createdAt)}</span>
              </div>
              {post.category && (
                <div className="modal-meta-item">
                  <span className="meta-label">카테고리</span>
                  <span className="meta-value">📦 {categoryLabels[post.category] || post.category}</span>
                </div>
              )}
              <div className="modal-meta-item">
                <span className="meta-label">위치</span>
                <span className="meta-value">📍 {post.location}</span>
              </div>
            </div>

            <div className="modal-description">
              <h2 className="description-title">상세 설명</h2>
              <p className="description-text">{post.description}</p>
            </div>

            <div className="modal-actions">
              <button 
                className="action-button primary" 
                onClick={handleOpenChat}
              >
                나눔 채팅 열기
              </button>
              {isMyPost && (
                <>
                  <button 
                    className={`action-button ${currentStatus === 'OPEN' ? 'secondary' : 'primary'}`}
                    onClick={handleToggleStatus}
                    disabled={statusUpdateMutation.isPending || currentStatus === 'DELETED'}
                  >
                    {statusUpdateMutation.isPending 
                      ? '처리 중...' 
                      : currentStatus === 'OPEN' 
                        ? '나눔 종료' 
                        : '나눔 시작'}
                  </button>
                  <button 
                    className="action-button delete-button"
                    onClick={handleDeletePost}
                    disabled={statusUpdateMutation.isPending || currentStatus === 'DELETED'}
                  >
                    {statusUpdateMutation.isPending ? '처리 중...' : '삭제'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingPostModal;

