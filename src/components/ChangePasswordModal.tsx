import React, { useState, useEffect } from 'react';
import './ChangePasswordModal.css';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (currentPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setShowPasswords({ current: false, new: false, confirm: false });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword.trim()) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!newPassword.trim()) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('현재 비밀번호와 새 비밀번호가 같습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(currentPassword, newPassword);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      onClose();
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">비밀번호 변경</h2>
          <button className="modal-close-button" onClick={handleClose} disabled={isSubmitting}>
            ✕
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
              현재 비밀번호
            </label>
            <div className="password-input-wrapper">
              <input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => togglePasswordVisibility('current')}
                disabled={isSubmitting}
              >
                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              새 비밀번호
            </label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                disabled={isSubmitting}
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isSubmitting}
              >
                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              새 비밀번호 확인
            </label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                disabled={isSubmitting}
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isSubmitting}
              >
                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
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
              disabled={
                isSubmitting ||
                !currentPassword.trim() ||
                !newPassword.trim() ||
                !confirmPassword.trim()
              }
            >
              {isSubmitting ? '변경 중...' : '변경'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

