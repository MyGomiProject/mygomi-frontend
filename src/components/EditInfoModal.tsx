import React, { useState, useEffect } from 'react';
import './EditInfoModal.css';

interface EditInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNickname: string;
  onUpdate: (nickname: string) => Promise<void>;
}

const EditInfoModal: React.FC<EditInfoModalProps> = ({
  isOpen,
  onClose,
  currentNickname,
  onUpdate,
}) => {
  const [nickname, setNickname] = useState(currentNickname);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNickname(currentNickname);
      setError(null);
    }
  }, [isOpen, currentNickname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (nickname.trim() === currentNickname) {
      setError('변경된 내용이 없습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(nickname.trim());
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '닉네임 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNickname(currentNickname);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="edit-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">정보 수정</h2>
          <button className="modal-close-button" onClick={handleClose} disabled={isSubmitting}>
            ✕
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nickname" className="form-label">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              className="form-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              disabled={isSubmitting}
              maxLength={20}
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              className="modal-button cancel-button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="modal-button submit-button"
              disabled={isSubmitting || !nickname.trim() || nickname.trim() === currentNickname}
            >
              {isSubmitting ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInfoModal;

