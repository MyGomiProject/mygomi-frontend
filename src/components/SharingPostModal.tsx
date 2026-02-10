import React, { useEffect, useState } from 'react';
import './SharingPostModal.css';

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

interface SharingPostModalProps {
  post: SharingPost | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDetail?: (post: SharingPost) => void;
}

const SharingPostModal: React.FC<SharingPostModalProps> = ({ post, isOpen, onClose, onViewDetail }) => {
  // 이미지 배열 처리 (imageUrls가 있으면 사용, 없으면 imageUrl을 배열로 변환)
  const images = post && (post.imageUrls && post.imageUrls.length > 0 
    ? post.imageUrls 
    : post.imageUrl 
      ? [post.imageUrl] 
      : []) || [];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 게시물이 변경되면 이미지 인덱스 초기화
  useEffect(() => {
    if (post) {
      setSelectedImageIndex(0);
    }
  }, [post?.id]);

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
  const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
    OPEN: { label: '나눔 대기', color: '#66bb6a', bgColor: 'rgba(102, 187, 106, 0.1)' },
    RESERVED: { label: '예약됨', color: '#ff9800', bgColor: 'rgba(255, 152, 0, 0.1)' },
    COMPLETED: { label: '나눔 종료', color: '#999', bgColor: 'rgba(153, 153, 153, 0.1)' },
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

  const statusInfo = post.status ? statusLabels[post.status] || statusLabels.OPEN : null;

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
              <img src={images[selectedImageIndex]} alt={`${post.title} - ${selectedImageIndex + 1}`} />
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
                <span className="meta-value">{post.author}</span>
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
              <button className="action-button primary">나눔 신청하기</button>
              <button className="action-button secondary">문의하기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingPostModal;

