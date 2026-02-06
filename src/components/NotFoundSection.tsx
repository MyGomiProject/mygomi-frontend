import React from 'react';

const NotFoundSection: React.FC = () => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '40px',
      backgroundColor: '#f8f9fa',
      borderRadius: '16px',
      marginTop: '20px'
    }}>
      <span style={{ fontSize: '32px' }}>🤔</span>
      <h3 style={{ margin: '16px 0 8px 0' }}>분류 정보를 찾지 못했어요</h3>
      <p style={{ color: '#666', marginBottom: '24px' }}>다른 이름으로 검색해보거나, 정보를 직접 제보하실 수 있어요.</p>
      <button 
        style={{
          padding: '12px 24px',
          backgroundColor: '#63E6BE',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        onClick={() => alert('제보하기 페이지로 이동합니다 (준비 중)')}
      >
        정보 제보하기
      </button>
    </div>
  );
};

export default NotFoundSection;