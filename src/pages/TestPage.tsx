import React, { useState } from 'react';
import Loading from '../components/Loading';
import ErrorDisplay from '../components/ErrorDisplay';

const TestPage: React.FC = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [throwError, setThrowError] = useState(false);

  // ErrorBoundary 테스트를 위한 에러 발생 컴포넌트
  if (throwError) {
    throw new Error('테스트 에러: ErrorBoundary가 이 에러를 잡아야 합니다!');
  }

  const handleTestLoading = () => {
    setShowLoading(true);
    setTimeout(() => {
      setShowLoading(false);
    }, 3000);
  };

  const handleTestError = () => {
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 5000);
  };

  const handleTestErrorBoundary = () => {
    setThrowError(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>컴포넌트 테스트 페이지</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        ErrorBoundary와 Loading 컴포넌트를 테스트할 수 있습니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>1. Loading 컴포넌트 테스트</h2>
          <button
            onClick={handleTestLoading}
            style={{
              padding: '0.8rem 1.5rem',
              background: '#66bb6a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            로딩 표시 (3초)
          </button>
          {showLoading && (
            <div style={{ marginTop: '1rem' }}>
              <Loading message="테스트 로딩 중..." />
            </div>
          )}
        </div>

        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>2. ErrorDisplay 컴포넌트 테스트</h2>
          <button
            onClick={handleTestError}
            style={{
              padding: '0.8rem 1.5rem',
              background: '#ff7043',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            에러 표시 (5초)
          </button>
          {showError && (
            <div style={{ marginTop: '1rem' }}>
              <ErrorDisplay
                title="테스트 에러"
                message="이것은 에러 표시 컴포넌트 테스트입니다. 5초 후 자동으로 사라집니다."
                onRetry={() => setShowError(false)}
              />
            </div>
          )}
        </div>

        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>3. ErrorBoundary 테스트</h2>
          <p style={{ color: '#ff5252', marginBottom: '1rem' }}>
            ⚠️ 주의: 이 버튼을 누르면 페이지가 ErrorBoundary로 감싸진 에러 화면으로 전환됩니다.
            새로고침하면 다시 정상적으로 돌아옵니다.
          </p>
          <button
            onClick={handleTestErrorBoundary}
            style={{
              padding: '0.8rem 1.5rem',
              background: '#ff5252',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ErrorBoundary 테스트 (에러 발생)
          </button>
        </div>

        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>4. 전체 화면 모드 테스트</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setShowLoading(true);
                setTimeout(() => setShowLoading(false), 3000);
              }}
              style={{
                padding: '0.8rem 1.5rem',
                background: '#42a5f5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              전체 화면 로딩
            </button>
            <button
              onClick={() => {
                setShowError(true);
                setTimeout(() => setShowError(false), 5000);
              }}
              style={{
                padding: '0.8rem 1.5rem',
                background: '#ef5350',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              전체 화면 에러
            </button>
          </div>
          {showLoading && (
            <Loading message="전체 화면 로딩 테스트..." fullScreen={true} />
          )}
          {showError && (
            <ErrorDisplay
              title="전체 화면 에러 테스트"
              message="이것은 전체 화면 에러 표시입니다."
              onRetry={() => setShowError(false)}
              fullScreen={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;

