import React from 'react';
import { SearchItem } from '../types/items';
import './ItemDetailView.css';
import { WASTE_TYPE_LABELS } from '../constants/waste';

interface ItemDetailViewProps {
  item: SearchItem;
  weekdays?: string[];
}

const ItemDetailView: React.FC<ItemDetailViewProps> = React.memo(({ item, weekdays }) => {
  const wasteInfo = WASTE_TYPE_LABELS[item.wasteType as keyof typeof WASTE_TYPE_LABELS];
  const displayEmoji = wasteInfo ? wasteInfo.emoji : '♻️';

  return (
    <div className="item-detail-card">
      {/* 제목 및 쓰레기 종류 */}
      <div className="item-header">
        <span className="item-icon">{displayEmoji}</span>
        <div>
          <h2 className="item-title">{item.nameKo}</h2>
          <span className="item-waste-type">{item.wasteType}</span>
        </div>
      </div>

      <hr className="item-divider" />

      {/* 버리는 방법 */}
      <div className="item-section">
        <h4 className="section-title">✅ 버리는 방법</h4>
        <p className="item-description">{item.description}</p>
      </div>

      {/* 수거 요일 */}
      <div className="item-section">
        <h4 className="section-title">📅 수거 요일 (내 지역 기준)</h4>
        <p className="item-weekdays">
          {weekdays && weekdays.length > 0 
            ? `매주 ${weekdays.join(', ')}요일` 
            : '해당 지역의 수거 요일 정보가 없습니다.'}
        </p>
      </div>
    </div>
  );
});

ItemDetailView.displayName = 'ItemDetailView';

export default ItemDetailView;