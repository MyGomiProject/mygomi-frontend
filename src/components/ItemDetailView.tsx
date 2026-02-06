import React from 'react';
import { SearchItem } from '../api/items';

interface ItemDetailViewProps {
  item: SearchItem;
}

const ItemDetailView: React.FC<ItemDetailViewProps> = ({ item }) => {
  return (
    <div className="item-detail-card" style={{
      border: '1px solid #eee',
      borderRadius: '16px',
      padding: '24px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      {/* 제목 및 쓰레기 종류 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '40px', marginRight: '16px' }}>♻️</span>
        <div>
          <h2 style={{ margin: 0, color: '#2D3436' }}>{item.nameKo}</h2>
          <span style={{ color: '#00B894', fontWeight: 'bold' }}>{item.wasteType}</span>
        </div>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

      {/* 버리는 방법 (REQ-03) */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#636E72' }}>✅ 버리는 방법</h4>
        <p style={{ lineHeight: '1.6' }}>{item.description}</p>
      </div>

      {/* 수거 요일 (REQ-02 연동 준비) */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#636E72' }}>📅 수거 요일 (내 지역 기준)</h4>
        <p style={{ color: '#0984E3', fontWeight: '500' }}>매주 수요일</p>
      </div>

      {/* 주의사항 (REQ-04) */}
      <div style={{ backgroundColor: '#FFF9F1', padding: '12px', borderRadius: '8px' }}>
        <h4 style={{ color: '#E17055', margin: '0 0 8px 0' }}>⚠️ 주의사항</h4>
        <p style={{ margin: 0, fontSize: '14px' }}>오염이 심하면 가연성 쓰레기로 분류해 주세요.</p>
      </div>
    </div>
  );
};

export default ItemDetailView;