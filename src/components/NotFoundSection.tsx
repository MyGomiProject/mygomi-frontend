import React from 'react';

interface NotFoundSectionProps {
  onReportClick?: () => void;
}

const NotFoundSection: React.FC<NotFoundSectionProps> = ({ onReportClick }) => {
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
          backgroundColor: '#66bb6a',
          border: 'none',
          borderRadius: '10px',
          color: '#fff',
          fontWeight: '600',
          cursor: 'pointer'
        }}
        onClick={onReportClick}
      >
        정보 제보하기
      </button>
    </div>
  );
};

export default NotFoundSection;