import React from 'react';
import './ErrorDisplay.css';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = '오류가 발생했습니다',
  message,
  onRetry,
  fullScreen = false,
}) => {
  return (
    <div className={`error-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{message}</p>
        {onRetry && (
          <button className="error-retry-button" onClick={onRetry}>
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;

