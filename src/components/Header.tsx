import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 닉네임이 있으면 닉네임, 없으면 이메일 앞부분 표시
  const displayName = user?.nickname || user?.email?.split('@')[0] || '사용자';

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <span className="logo-text">MYGOMI</span>
            <span className="logo-icon"></span>
          </Link>
        </div>
        <nav className="header-nav">
          <a href="#waste-guide" className="nav-link">분리수거 정보</a>
          <Link to="/sharing" className="nav-link">나눔</Link>
          <a href="#notice" className="nav-link">신고</a>
          <a href="#mypage" className="nav-link">마이페이지</a>
          {token ? (
            <div className="user-menu">
              <span className="user-nickname">{displayName}</span>
              <button className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={handleLoginClick}>
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

