import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { addressApi } from '../api/address';
import { userApi } from '../api/user';
import { sharePostApi } from '../api/sharePost';
import Header from '../components/Header';
import Loading from '../components/Loading';
import ErrorDisplay from '../components/ErrorDisplay';
import ParallaxBackground from '../components/ParallaxBackground';
import EditInfoModal from '../components/EditInfoModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import SharingPostModal from '../components/SharingPostModal';
import './MyPage.css';

interface SharingPost {
  id: string;
  title: string;
  description: string;
  location?: string;
  createdAt: string;
  imageUrl?: string;
  imageUrls?: string[];
  status: 'OPEN' | 'RESERVED' | 'COMPLETED';
  category?: string;
  author?: string;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SharingPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const postsPerPage = 6;

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // 사용자 정보 조회
  const { data: userInfo, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['userInfo'],
    queryFn: () => userApi.getMe(),
    enabled: !!token,
  });

  // 주소 목록 조회
  const { data: addresses, isLoading: addressesLoading, error: addressesError } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: async () => {
      try {
        const result = await addressApi.getAddresses();
        console.log('MyPage - 주소 조회 결과:', result);
        return result;
      } catch (error) {
        console.error('MyPage - 주소 조회 에러:', error);
        throw error;
      }
    },
    enabled: !!token,
    retry: 1,
  });

  // 본인 나눔 게시물 조회
  const { data: myPostsData, isLoading: myPostsLoading, error: myPostsError } = useQuery({
    queryKey: ['my-share-posts', currentPage],
    queryFn: () => sharePostApi.getMyPosts({ page: currentPage - 1, size: postsPerPage }),
    enabled: !!token,
  });

  const myPosts: SharingPost[] = myPostsData?.data.map((post) => ({
    id: String(post.id),
    title: post.title,
    description: post.description || post.content || '',
    location: post.ward || post.location || '',
    createdAt: post.createdAt,
    imageUrl: post.thumbnailUrl || post.imageUrls?.[0],
    imageUrls: post.imageUrls || (post.thumbnailUrl ? [post.thumbnailUrl] : []),
    status: post.status || 'OPEN',
    category: post.category,
    author: userInfo?.nickname || '본인',
  })) || [];

  const totalPages = myPostsData?.meta ? Math.ceil(myPostsData.meta.total / postsPerPage) : 0;
  const currentPosts = myPosts;

  const handleEditInfo = () => {
    setIsEditInfoModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  // 닉네임 수정 Mutation
  const updateNicknameMutation = useMutation({
    mutationFn: (nickname: string) => userApi.updateNickname(nickname),
    onSuccess: () => {
      // 사용자 정보 자동 리페치
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      setIsEditInfoModalOpen(false);
    },
    onError: (error: any) => {
      console.error('닉네임 수정 실패:', error);
      throw error; // 모달에서 에러 처리
    },
  });

  // 비밀번호 변경 Mutation
  const updatePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      userApi.updatePassword(currentPassword, newPassword),
    onSuccess: () => {
      setIsChangePasswordModalOpen(false);
      alert('비밀번호가 변경되었습니다.');
    },
    onError: (error: any) => {
      console.error('비밀번호 변경 실패:', error);
      throw error; // 모달에서 에러 처리
    },
  });

  const handleUpdateNickname = async (nickname: string) => {
    await updateNicknameMutation.mutateAsync(nickname);
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    await updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
  };

  const handleAddAddress = () => {
    navigate('/address-input', { 
      state: { 
        redirectTo: '/mypage' // 주소 추가 후 마이페이지로 돌아오기
      } 
    });
  };

  // 대표 주소 변경 Mutation
  const setPrimaryMutation = useMutation({
    mutationFn: (addressId: number) => addressApi.setPrimaryAddress(addressId),
    onSuccess: () => {
      // 주소 목록 자동 리페치
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
    onError: (error: any) => {
      console.error('대표 주소 변경 실패:', error);
      alert(error.response?.data?.message || '대표 주소 변경에 실패했습니다.');
    },
  });

  // 주소 삭제 Mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: number) => addressApi.deleteAddress(addressId),
    onSuccess: () => {
      // 주소 목록 자동 리페치
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      setDeletingAddressId(null);
    },
    onError: (error: any) => {
      console.error('주소 삭제 실패:', error);
      alert(error.response?.data?.message || '주소 삭제에 실패했습니다.');
      setDeletingAddressId(null);
    },
  });

  const handleSetPrimaryClick = (addressId: number) => {
    if (window.confirm('이 주소를 대표 주소로 설정하시겠습니까?')) {
      setPrimaryMutation.mutate(addressId);
    }
  };

  const handleDeleteAddress = (e: React.MouseEvent, addressId: number) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    if (window.confirm('이 주소를 삭제하시겠습니까?\n대표 주소가 1개만 남은 경우 삭제할 수 없습니다.')) {
      setDeletingAddressId(addressId);
      deleteAddressMutation.mutate(addressId);
    }
  };

  const handlePostClick = async (postId: string) => {
    // 먼저 마이페이지에서 이미 가져온 데이터에서 찾기
    const existingPost = myPosts.find(p => p.id === postId);
    
    if (existingPost) {
      // 이미 가져온 데이터가 있으면 그대로 사용
      console.log('기존 게시글 데이터 사용:', existingPost);
      setSelectedPost(existingPost);
      setIsPostModalOpen(true);
    } else {
      // 현재 페이지에 없으면 API로 상세 정보 가져오기
      try {
        const postDetail = await sharePostApi.getPost(postId);
        console.log('API로 가져온 게시글 상세:', postDetail);
        
        // SharingPost 형식으로 변환
        const post: SharingPost = {
          id: String(postDetail.id),
          title: postDetail.title,
          description: postDetail.description || postDetail.content || '',
          location: postDetail.ward || postDetail.location || '',
          createdAt: postDetail.createdAt,
          imageUrl: postDetail.thumbnailUrl || postDetail.imageUrls?.[0],
          imageUrls: postDetail.imageUrls || (postDetail.thumbnailUrl ? [postDetail.thumbnailUrl] : []),
          status: postDetail.status || 'OPEN',
          category: postDetail.category,
          author: userInfo?.nickname || postDetail.author || '본인',
        };
        
        console.log('변환된 게시글 데이터:', post);
        setSelectedPost(post);
        setIsPostModalOpen(true);
      } catch (error) {
        console.error('게시글 상세 조회 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
      }
    }
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  if (userLoading || addressesLoading) {
    return <Loading fullScreen message="마이페이지 정보를 불러오는 중..." />;
  }

  // 사용자 정보 에러는 전체 페이지를 막음
  if (userError) {
    return (
      <ErrorDisplay
        fullScreen
        title="정보 로드 실패"
        message={userError?.message || '마이페이지 정보를 불러오는데 실패했습니다.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // 주소 에러는 로깅만 하고 페이지는 계속 표시
  if (addressesError) {
    console.error('MyPage - 주소 조회 에러:', addressesError);
  }

  const displayName = userInfo?.nickname || userInfo?.email?.split('@')[0] || '사용자';
  const displayEmail = userInfo?.email || '이메일 없음';
  const joinDate = userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('ko-KR') : 'N/A';

  return (
    <div className="my-page">
      <ParallaxBackground />
      <Header />
      <main className="my-page-main">
        <section className="my-page-header">
          <h1 className="my-page-title">마이페이지</h1>
          <p className="my-page-greeting">환영합니다, {displayName}님!</p>
        </section>

        {/* 사용자 정보 및 주소 카드 */}
        <section className="my-page-content">
          <div className="info-card">
            {/* 왼쪽: 사용자 프로필 */}
            <div className="profile-section">
              <div className="profile-header">
                <h2 className="profile-name">{displayName}</h2>
                <p className="profile-email">{displayEmail}</p>
                <p className="profile-join-date">가입일 · {joinDate}</p>
              </div>
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
              <div className="address-header">
                <h3 className="address-title">내 주소</h3>
                <button className="add-address-button" onClick={handleAddAddress}>
                  주소 추가
                </button>
              </div>
              <div className="address-list">
                {addressesError ? (
                  <div className="address-error">
                    <p>주소를 불러오는데 실패했습니다.</p>
                    <button 
                      className="retry-button"
                      onClick={() => window.location.reload()}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#66bb6a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      다시 시도
                    </button>
                  </div>
                ) : addressesLoading ? (
                  <p className="no-address">주소를 불러오는 중...</p>
                ) : addresses && addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`address-item ${address.isPrimary ? 'primary-address' : ''}`}
                      onClick={() => !address.isPrimary && handleSetPrimaryClick(address.id)}
                    >
                      <div className="address-icon">
                        {address.isPrimary ? '📌' : ''}
                      </div>
                      <span className="address-text">
                        {address.fullAddress ||
                          (address.prefecture && address.ward
                            ? [
                                address.prefecture,
                                address.ward,
                                address.town,
                                address.chome ? `${address.chome}丁目` : '',
                                address.banchiText,
                              ]
                                .filter(Boolean)
                                .join(' ')
                            : '주소 정보 없음')}
                      </span>
                      <div className="address-actions">
                        <button
                          className="address-action-button delete-button"
                          onClick={(e) => handleDeleteAddress(e, address.id)}
                          disabled={deleteAddressMutation.isPending && deletingAddressId === address.id}
                          title="주소 삭제"
                        >
                          {deleteAddressMutation.isPending && deletingAddressId === address.id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-address">등록된 주소가 없습니다.</p>
                )}
              </div>
            </div>
          </div>

          {/* 내가 올린 나눔 게시물 섹션 */}
          <div className="my-posts-section">
            <h2 className="my-posts-title">내가 올린 나눔 게시물</h2>
            {myPostsLoading ? (
              <Loading message="게시글을 불러오는 중..." />
            ) : myPostsError ? (
              <ErrorDisplay message="게시글을 불러오는데 실패했습니다." />
            ) : currentPosts.length > 0 ? (
              <div className="posts-grid">
                {currentPosts.map((post) => (
                  <div key={post.id} className="post-card" onClick={() => handlePostClick(post.id)}>
                    <div className="post-image">
                      <img 
                        src={
                          post.imageUrl && (post.imageUrl.startsWith('http://') || post.imageUrl.startsWith('https://'))
                            ? post.imageUrl
                            : post.imageUrl
                              ? `http://localhost:8080${post.imageUrl.startsWith('/') ? post.imageUrl : `/${post.imageUrl}`}`
                              : ''
                        } 
                        alt={post.title} 
                      />
                    </div>
                    <div className="post-content">
                      <div className="post-header">
                        <h3 className="post-title">{post.title}</h3>
                        <span className={`post-status ${post.status.toLowerCase()}`}>
                          {post.status === 'OPEN' ? '나눔 중' : post.status === 'RESERVED' ? '예약 중' : '완료'}
                        </span>
                      </div>
                      <p className="post-date">{post.createdAt}</p>
                      <p className="post-location">📍 {post.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-posts">아직 올린 나눔 게시물이 없습니다.</p>
            )}

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
                <span className="pagination-page">{currentPage} / {totalPages}</span>
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음 &gt;
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 정보 수정 모달 */}
      <EditInfoModal
        isOpen={isEditInfoModalOpen}
        onClose={() => setIsEditInfoModalOpen(false)}
        currentNickname={userInfo?.nickname || ''}
        onUpdate={handleUpdateNickname}
      />

      {/* 비밀번호 변경 모달 */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onUpdate={handleUpdatePassword}
      />

      {/* 게시글 상세 모달 */}
      <SharingPostModal
        post={selectedPost}
        isOpen={isPostModalOpen}
        onClose={handleClosePostModal}
      />
    </div>
  );
};

export default MyPage;

