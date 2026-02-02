import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './AddressInputPage.css';

type Step = 'prefecture' | 'ward' | 'details';

interface AddressFormData {
  prefecture: string;
  ward: string;
  town: string;
  chome: string;
  banchiText: string;
}

const AddressInputPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('prefecture');
  const [formData, setFormData] = useState<AddressFormData>({
    prefecture: '',
    ward: '',
    town: '',
    chome: '',
    banchiText: '',
  });

  // 도쿄도의 구 목록 (예시)
  const tokyoWards = [
    '오타구',
    '기타구',
    '에도가와구',
    '가쓰시카구',
    '이타바시구',
    '아다치구',
    '시나가와구',
    '미나토구',
    '네리마구',
    '시부야구',
    '치요다구',
    '주오구',
    '신주쿠구',
    '도시마구',
    '스기나미구',
    '나카노구',
    '세타가야구',
    '메구로구',
    '다이토구',
    '고토구',
    '분쿄구',
    '스미다구',
    '아라카와구',
  ];

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
    // TODO: API 호출하여 주소 저장
    console.log('주소 데이터:', formData);
    // 저장 후 다음 페이지로 이동 (예: 메인 페이지)
    navigate('/');
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
                  {tokyoWards.map((ward) => (
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
                    <button type="submit" className="submit-button">
                      완료
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

