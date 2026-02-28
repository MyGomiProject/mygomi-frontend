import React, { useEffect, useState } from 'react';
import './ToastNotification.css';

interface ToastNotificationProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  /** 메인 콘텐츠(max-width 1200px, padding 2rem) 오른쪽 끝과 맞출 때 true */
  alignWithMainContent?: boolean;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  alignWithMainContent = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose?.();
        }, 300); // CSS transition 시간과 맞춤
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`toast-notification toast-${type} ${isVisible ? 'toast-visible' : ''} ${alignWithMainContent ? 'toast-align-main' : ''}`}
    >
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={handleClose} aria-label="닫기">
          ×
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
