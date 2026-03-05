import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import { sharePostApi, SharePostRequest, SharePostResponse } from '../api/sharePost';
import { useAuth } from '../contexts/AuthContext';
import { addressApi } from '../api/address';
import './SharePostCreatePage.css';

const MAX_IMAGES = 5;

const SharePostCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = new URLSearchParams(location.search);
  const editPostId = searchParams.get('postId');
  const isEditMode = Boolean(editPostId);
  
  const [formData, setFormData] = useState<SharePostRequest>({
    title: '',
    content: '',
    category: 'ETC',
    lat: 35.6762, // 도쿄 기본 위치
    lng: 139.6503,
    prefecture: '도쿄도',
    ward: '',
    town: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 사용자 주소 정보 가져오기
  const { data: addresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => addressApi.getAddresses(),
    enabled: !!user,
  });

  // 수정 모드일 때 기존 게시글 정보 조회
  const { data: editPost } = useQuery<SharePostResponse | null>({
    queryKey: ['share-post-edit', editPostId],
    queryFn: async () => {
      if (!editPostId) return null;
      return await sharePostApi.getPost(editPostId);
    },
    enabled: isEditMode,
  });

  // 주소 정보 또는 수정 대상 게시글이 로드되면 폼 초기값 설정
  useEffect(() => {
    // 수정 모드: 기존 게시글 정보를 우선 사용
    if (isEditMode && editPost) {
      const description = editPost.description || editPost.content || '';
      setFormData((prev) => ({
        ...prev,
        title: editPost.title || prev.title,
        content: description,
        category: (editPost.category as SharePostRequest['category']) || prev.category,
        lat: editPost.lat ?? prev.lat,
        lng: editPost.lng ?? prev.lng,
        prefecture: editPost.prefecture || prev.prefecture,
        ward: editPost.ward || prev.ward,
        town: editPost.town || prev.town,
      }));
      return;
    }

    // 신규 작성 모드: 사용자 주소로 초기 위치 설정
    if (!isEditMode && addresses && addresses.length > 0) {
      const primaryAddress = addresses.find((addr) => addr.isPrimary) || addresses[0];
      if (primaryAddress) {
        setFormData((prev) => ({
          ...prev,
          prefecture: primaryAddress.prefecture || prev.prefecture,
          ward: primaryAddress.ward || prev.ward,
          town: primaryAddress.town || prev.town,
          lat: primaryAddress.lat || prev.lat,
          lng: primaryAddress.lng || prev.lng,
        }));
      }
    }
  }, [addresses, editPost, isEditMode]);

  // 카테고리 한글 매핑 (백엔드 enum과 일치)
  const categoryLabels: Record<string, string> = {
    FURNITURE: '가구',
    ELECTRONICS: '전자제품',
    CLOTHING: '의류',
    BOOKS: '도서',
    KITCHENWARE: '주방/주방용품',
    SPORTS: '스포츠/레저',
    ETC: '기타',
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const totalImages = images.length + files.length;

    if (totalImages > MAX_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        images: `이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`,
      }));
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // 미리보기 생성
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // 에러 초기화
    if (errors.images) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }

    // input 초기화 (같은 파일을 다시 선택할 수 있도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // URL 해제 (메모리 누수 방지)
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    // 신규 작성 시에는 최소 1장 이미지 필수, 수정 모드에서는 기존 이미지가 있을 수 있으므로 강제하지 않음
    if (!isEditMode && images.length === 0) {
      newErrors.images = '최소 1장의 이미지를 업로드해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const savePostMutation = useMutation({
    mutationFn: async () => {
      if (isEditMode && editPostId) {
        return await sharePostApi.updatePost(editPostId, formData, images.length > 0 ? images : undefined);
      }
      return await sharePostApi.createPost(formData, images);
    },
    onSuccess: () => {
      navigate('/sharing');
    },
    onError: (error: any) => {
      console.error('게시글 저장 실패:', error);
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || '게시글 저장에 실패했습니다.',
      }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    savePostMutation.mutate();
  };

  const handleCancel = () => {
    // 미리보기 URL 정리
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    navigate('/sharing');
  };

  return (
    <div className="share-post-create-page">
      <ParallaxBackground />
      <Header />
      <main className="create-main">
        <div className="create-container">
          <div className="create-header">
            <h1 className="create-title">{isEditMode ? '나눔 글 수정' : '나눔 글쓰기'}</h1>
            <p className="create-subtitle">
              {isEditMode ? '나눔할 물품 정보를 수정합니다.' : '나눔할 물품을 등록해주세요'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="create-form">
            {/* 제목 */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                제목 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="예: 전자레인지 나눔합니다"
                maxLength={100}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* 내용 */}
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                내용 <span className="required">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={`form-textarea ${errors.content ? 'error' : ''}`}
                placeholder={isEditMode ? '수정할 내용을 입력해주세요' : '물품에 대한 상세 설명을 입력해주세요'}
                rows={8}
                maxLength={1000}
              />
              <div className="char-count">
                {formData.content.length} / 1000
              </div>
              {errors.content && <span className="error-message">{errors.content}</span>}
            </div>

            {/* 카테고리 */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                카테고리 <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 이미지 업로드 */}
            <div className="form-group">
              <label className="form-label">
                사진 <span className="required">*</span>
                <span className="image-limit">(최대 {MAX_IMAGES}장)</span>
              </label>
              <div className="image-upload-section">
                {imagePreviews.length > 0 && (
                  <div className="image-preview-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`미리보기 ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={() => handleRemoveImage(index)}
                          aria-label="이미지 삭제"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < MAX_IMAGES && (
                  <div className="image-upload-area">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="image-input"
                      id="image-input"
                    />
                    <label htmlFor="image-input" className="image-upload-label">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        {images.length === 0
                          ? ' 사진 추가하기'
                          : `${images.length}장 / ${MAX_IMAGES}장`}
                      </span>
                    </label>
                  </div>
                )}
              </div>
              {errors.images && <span className="error-message">{errors.images}</span>}
            </div>

            {/* 위치 정보 */}
            <div className="form-group">
              <label className="form-label">위치 정보</label>
              <div className="location-info">
                <p>
                  {formData.ward
                    ? `${formData.prefecture || ''} ${formData.ward} ${formData.town || ''}`
                    : '주소 정보가 없습니다. 마이페이지에서 주소를 설정해주세요.'}
                </p>
              </div>
            </div>

            {/* 에러 메시지 */}
            {errors.submit && (
              <div className="submit-error">{errors.submit}</div>
            )}

            {/* 버튼 */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
                disabled={savePostMutation.isPending}
              >
                취소
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={savePostMutation.isPending}
              >
                {savePostMutation.isPending
                  ? isEditMode ? '수정 중...' : '등록 중...'
                  : isEditMode ? '수정하기' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SharePostCreatePage;

