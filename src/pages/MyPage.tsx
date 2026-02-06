import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { addressApi } from '../api/address';
import { userApi } from '../api/user';
import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import Loading from '../components/Loading';
import ErrorDisplay from '../components/ErrorDisplay';
import './MyPage.css';

interface SharingPost {
  id: string;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  imageUrl?: string;
  status: 'OPEN' | 'RESERVED' | 'COMPLETED';
  category?: string;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // 사용자 정보 조회
  const { data: userInfo, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['userInfo'],
    queryFn: () => userApi.getMe(),
    enabled: !!token,
  });

  // 주소 목록 조회
  const { data: addresses, isLoading: addressesLoading, error: addressesError } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.getAddresses(),
    enabled: !!token,
  });

  // 나눔 게시물 조회 (임시 Mock 데이터)
  const mockPosts: SharingPost[] = [
    {
      id: '1',
      title: '나무 의자 드림',
      description: '사용 잘하는 나무 의자입니다.',
      location: '도쿄 오타구',
      createdAt: '2026-02-15',
      imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300&h=300&fit=crop',
      status: 'OPEN',
      category: 'FURNITURE',
    },
    {
      id: '2',
      title: '전자레인지 무료로 드립니다',
      description: '상태 양호한 전자레인지입니다.',
      location: '도쿄 오타구',
      createdAt: '2026-02-10',
      imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=300&h=300&fit=crop',
      status: 'OPEN',
      category: 'ELECTRONICS',
    },
  ];

  // 페이지네이션 계산
  const totalPages = Math.ceil(mockPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = mockPosts.slice(startIndex, endIndex);

  // 로그인하지 않은 경우 리다이렉트
  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { message: '마이페이지를 보려면 로그인이 필요합니다.' } });
    }
  }, [token, navigate]);

  const handleEditInfo = () => {
    // 정보 수정 페이지로 이동 (추후 구현)
    console.log('정보 수정');
  };

  const handleChangePassword = () => {
    // 비밀번호 변경 페이지로 이동 (추후 구현)
    console.log('비밀번호 변경');
  };

  const handleAddAddress = () => {
    navigate('/address-input', { 
      state: { 
        redirectTo: '/mypage' // 주소 추가 후 마이페이지로 돌아오기
      } 
    });
  };

  const handleAddressClick = (addressId: number) => {
    // 주소 상세/수정 페이지로 이동 (추후 구현)
    console.log('주소 클릭:', addressId);
  };

  const handlePostClick = (postId: string) => {
    // 게시글 상세 페이지로 이동 (추후 구현)
    console.log('게시글 클릭:', postId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  if (!token) {
    return null; // 리다이렉트 중
  }

  if (userLoading || addressesLoading) {
    return (
      <div className="my-page">
        <Header />
        <Loading message="정보를 불러오는 중..." />
      </div>
    );
  }

  if (userError || addressesError) {
    return (
      <div className="my-page">
        <Header />
        <ErrorDisplay
          title="정보 로드 실패"
          message={userError?.message || addressesError?.message || '정보를 불러오는데 실패했습니다.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const displayName = userInfo?.nickname || user?.nickname || '사용자';
  const displayEmail = userInfo?.email || user?.email || '';
  const joinDate = userInfo?.createdAt ? formatDate(userInfo.createdAt) : '2026.01.28';

  return (
    <div className="my-page">
      <ParallaxBackground />
      <Header />
      <main className="my-page-main">
        {/* 헤더 섹션 */}
        <section className="my-page-header">
          <h1 className="my-page-title">마이페이지</h1>
          <p className="my-page-greeting">환영합니다, {displayName}님!</p>
        </section>

        {/* 사용자 정보 및 주소 카드 */}
        <section className="my-page-content">
          <div className="info-card">
            {/* 왼쪽: 사용자 프로필 */}
            <div className="profile-section">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  <span className="avatar-icon">👤</span>
                </div>
              </div>
              <h2 className="profile-name">{displayName}</h2>
              <p className="profile-email">{displayEmail}</p>
              <p className="profile-join-date">가입일 · {joinDate}</p>
              <div className="profile-actions">
                <button className="action-button" onClick={handleEditInfo}>
                  정보 수정
                </button>
                <button className="action-button" onClick={handleChangePassword}>
                  비밀번호 변경
                </button>
              </div>
            </div>

            {/* 오른쪽: 주소 관리 */}
            <div className="address-section">
              <h3 className="address-title">내 주소</h3>
              <div className="address-list">
                {addresses && addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className="address-item"
                      onClick={() => handleAddressClick(address.id)}
                    >
                      <div className="address-icon">
                        {address.isPrimary ? '✅' : ''}
                      </div>
                      <span className="address-text">{address.fullAddress}</span>
                      <span className="address-arrow">→</span>
                    </div>
                  ))
                ) : (
                  <p className="no-address">등록된 주소가 없습니다.</p>
                )}
              </div>
              <button className="add-address-button" onClick={handleAddAddress}>
                주소 추가
              </button>
            </div>
          </div>

          {/* 내가 올린 나눔 게시물 */}
          <section className="my-posts-section">
            <h2 className="my-posts-title">내가 올린 나눔 게시물</h2>
            <div className="posts-grid">
              {currentPosts.length > 0 ? (
                currentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="post-card"
                    onClick={() => handlePostClick(post.id)}
                  >
                    {post.imageUrl && (
                      <div className="post-image">
                        <img src={post.imageUrl} alt={post.title} />
                      </div>
                    )}
                    <div className="post-content">
                      <div className="post-header">
                        <h3 className="post-title">{post.title}</h3>
                        <span className={`post-status ${post.status.toLowerCase()}`}>
                          {post.status === 'OPEN' ? '나눔 진행중' : post.status === 'RESERVED' ? '예약됨' : '완료'}
                        </span>
                      </div>
                      <p className="post-date">{formatDate(post.createdAt)}</p>
                      <p className="post-location">📍 {post.location}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-posts">올린 게시물이 없습니다.</p>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  &lt; 이전
                </button>
                <span className="pagination-page">
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음 &gt;
                </button>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default MyPage;

