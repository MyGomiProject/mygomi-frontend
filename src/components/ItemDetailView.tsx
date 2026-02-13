import React from 'react';
import { SearchItem } from '../types/items';

interface ItemDetailViewProps {
  item: SearchItem;
  weekdays?: string[];
}

// 💡 수정 1: { item } 옆에 weekdays를 꼭 넣어주세요!
const ItemDetailView: React.FC<ItemDetailViewProps> = ({ item, weekdays }) => {
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

      {/* 버리는 방법 */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#636E72' }}>✅ 버리는 방법</h4>
        <p style={{ lineHeight: '1.6' }}>{item.description}</p>
      </div>

      {/* 수거 요일 */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ color: '#636E72' }}>📅 수거 요일 (내 지역 기준)</h4>
        <p style={{ color: '#0984E3', fontWeight: '500' }}>
          {/* 💡 수정 2: 넘겨받은 weekdays 데이터를 실제로 화면에 출력하는 로직 추가! */}
          {weekdays && weekdays.length > 0 
            ? `매주 ${weekdays.join(', ')}요일` 
            : '해당 지역의 수거 요일 정보가 없습니다.'}
        </p>
      </div>
    </div>
  );
};

export default ItemDetailView;