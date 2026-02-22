import React from 'react';
import './Loading.css';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message = '로딩 중...', fullScreen = false }) => {
  return (
    <div className={`loading-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default Loading;

