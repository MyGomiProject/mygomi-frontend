import React, { useState, useEffect } from 'react';
import {
  getKeywordAlertKeywords,
  setKeywordAlertKeywords,
} from '../utils/keywordAlert';
import './KeywordAlertModal.css';

interface KeywordAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeywordAlertModal: React.FC<KeywordAlertModalProps> = ({ isOpen, onClose }) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (isOpen) setKeywords(getKeywordAlertKeywords());
  }, [isOpen]);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed || keywords.includes(trimmed)) {
      setInput('');
      return;
    }
    const next = [...keywords, trimmed];
    setKeywords(next);
    setKeywordAlertKeywords(next);
    setInput('');
  };

  const handleRemove = (keyword: string) => {
    const next = keywords.filter((k) => k !== keyword);
    setKeywords(next);
    setKeywordAlertKeywords(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  if (!isOpen) return null;

  return (
    <div className="keyword-alert-modal-overlay" onClick={onClose}>
      <div className="keyword-alert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="keyword-alert-modal-header">
          <h2 className="keyword-alert-modal-title">🔔 키워드 알림</h2>
          <button type="button" className="keyword-alert-modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>
        <p className="keyword-alert-modal-desc">
          등록한 키워드가 제목이나 내용에 포함된 근처 나눔 글이 올라오면 벨 알림으로 알려드립니다.
        </p>
        <div className="keyword-alert-modal-input-wrap">
          <input
            type="text"
            className="keyword-alert-modal-input"
            placeholder="키워드 입력 (예: 책상, 유아차)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="keyword-alert-modal-add-btn" onClick={handleAdd}>
            추가
          </button>
        </div>
        <ul className="keyword-alert-modal-list">
          {keywords.length === 0 ? (
            <li className="keyword-alert-modal-empty">등록된 키워드가 없습니다.</li>
          ) : (
            keywords.map((k) => (
              <li key={k} className="keyword-alert-modal-item">
                <span className="keyword-alert-modal-item-text">{k}</span>
                <button
                  type="button"
                  className="keyword-alert-modal-remove-btn"
                  onClick={() => handleRemove(k)}
                  aria-label={`${k} 삭제`}
                >
                  삭제
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="keyword-alert-modal-footer">
          <button type="button" className="keyword-alert-modal-done-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordAlertModal;
