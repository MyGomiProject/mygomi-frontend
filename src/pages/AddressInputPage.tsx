import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { addressApi } from '../api/address';
import { areaApi } from '../api/area';
import { tokyoWardsKo } from '../mocks/data';
import './AddressInputPage.css';

type Step = 'prefecture' | 'ward' | 'details';

interface AddressFormData {
  prefecture: string;
  ward: string;
  town: string;
  chome: string;
  banchiText: string;
}

interface SignupData {
  email: string;
  nickname: string;
}

const AddressInputPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<Step>('prefecture');
  const [formData, setFormData] = useState<AddressFormData>({
    prefecture: '',
    ward: '',
    town: '',
    chome: '',
    banchiText: '',
  });
  const [signupData, setSignupData] = useState<SignupData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 회원가입 데이터 받아오기
  useEffect(() => {
    if (location.state && 'signupData' in location.state) {
      const data = location.state.signupData as SignupData;
      setSignupData(data);
      console.log('회원가입 데이터:', data);
    }
  }, [location]);

  const handlePrefectureSelect = (prefecture: string) => {
    setFormData({ ...formData, prefecture });
    setStep('ward');
  };

  const handleWardSelect = (ward: string) => {
    setFormData({ ...formData, ward });
    setStep('details');
  };

  const handleInputChange = (field: keyof AddressFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleBack = () => {
    if (step === 'ward') {
      setStep('prefecture');
      setFormData({ ...formData, ward: '' });
    } else if (step === 'details') {
      setStep('ward');
      setFormData({ ...formData, town: '', chome: '', banchiText: '' });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. 지역 검색 (area 매칭) - 선택적, 실패해도 계속 진행
      let areas: any[] = [];
      try {
        areas = await areaApi.searchAreas({
          prefecture: formData.prefecture,
          ward: formData.ward,
          town: formData.town,
          chome: formData.chome,
          banchi: formData.banchiText,
        });
        console.log('매칭된 지역:', areas);
      } catch (areaError) {
        console.warn('지역 검색 실패 (무시하고 계속 진행):', areaError);
        // 지역 검색 실패해도 주소 등록은 계속 진행
      }

      // 2. 주소 등록 (POST /api/user-addresses)
      const address = await addressApi.createAddress({
        prefecture: formData.prefecture,
        ward: formData.ward,
        town: formData.town,
        chome: formData.chome,
        banchi: formData.banchiText, // banchi 필드로 전달
        lat: 0, // 임시 값 (나중에 지오코딩으로 실제 좌표 가져오기)
        lng: 0, // 임시 값
        isPrimary: true, // 첫 주소는 대표 주소로 설정
      });

      console.log('주소 등록 완료:', address);

<<<<<<< Updated upstream
      // 저장 후 어디서 왔는지에 따라 다른 페이지로 이동
      // location.state에 redirectTo가 있으면 그곳으로, 없으면 기본적으로 마이페이지로
      const redirectTo = location.state?.redirectTo || '/mypage';
      navigate(redirectTo);
    } catch (err: any) {
      console.error('주소 등록 실패:', err);
      const errorMessage = err?.response?.data?.message || '주소 등록에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
=======
      // 저장 후 메인 페이지로 이동
      navigate('/');
    } catch (error) {
      console.error('주소 등록 실패:', error);
      alert('주소 등록에 실패했습니다. 다시 시도해주세요.');
>>>>>>> Stashed changes
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="address-input-page">
      <Header />
      <main className="address-input-main">
        <div className="address-input-container">
          <div className="progress-indicator">
            <div className={`progress-step ${step === 'prefecture' ? 'active' : step === 'ward' || step === 'details' ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">도/현 선택</span>
            </div>
            <div className={`progress-line ${step === 'ward' || step === 'details' ? 'completed' : ''}`} />
            <div className={`progress-step ${step === 'ward' ? 'active' : step === 'details' ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">구 선택</span>
            </div>
            <div className={`progress-line ${step === 'details' ? 'completed' : ''}`} />
            <div className={`progress-step ${step === 'details' ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">상세 주소</span>
            </div>
          </div>

          <div className="address-input-content">
            {step === 'prefecture' && (
              <div className="step-content">
                <h1 className="step-title">주소를 설정해주세요</h1>
                <p className="step-subtitle">거주하시는 도/현을 선택해주세요</p>
                <div className="prefecture-grid">
                  <button
                    className="prefecture-card"
                    onClick={() => handlePrefectureSelect('도쿄도')}
                  >
                    <div className="prefecture-icon">🗼</div>
                    <div className="prefecture-name">도쿄도</div>
                  </button>
                </div>
              </div>
            )}

            {step === 'ward' && (
              <div className="step-content">
                <h1 className="step-title">구를 선택해주세요</h1>
                <p className="step-subtitle">선택한 도/현: {formData.prefecture}</p>
                <div className="ward-grid">
                  {tokyoWardsKo.map((ward) => (
                    <button
                      key={ward}
                      className="ward-card"
                      onClick={() => handleWardSelect(ward)}
                    >
                      {ward}
                    </button>
                  ))}
                </div>
                <button className="back-button" onClick={handleBack}>
                  ← 이전
                </button>
              </div>
            )}

            {step === 'details' && (
              <div className="step-content">
                <h1 className="step-title">상세 주소를 입력해주세요</h1>
                <p className="step-subtitle">
                  {formData.prefecture} {formData.ward}
                </p>
                <form onSubmit={handleSubmit} className="address-form">
                  <div className="form-group">
                    <label htmlFor="town">町名 (읍면동)</label>
                    <input
                      id="town"
                      type="text"
                      value={formData.town}
                      onChange={(e) => handleInputChange('town', e.target.value)}
                      placeholder="예: 히가시닛포리"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="chome">丁目 (초메)</label>
                    <input
                      id="chome"
                      type="text"
                      value={formData.chome}
                      onChange={(e) => handleInputChange('chome', e.target.value)}
                      placeholder="예: 1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="banchiText">番地 (번지)</label>
                    <input
                      id="banchiText"
                      type="text"
                      value={formData.banchiText}
                      onChange={(e) => handleInputChange('banchiText', e.target.value)}
                      placeholder="예: 1-22-1"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="back-button" onClick={handleBack}>
                      ← 이전
                    </button>
                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                      {isSubmitting ? '저장 중...' : '완료'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddressInputPage;

