import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // 로그인 페이지 이동
    navigate('/login');
  };

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
          <button className="login-button" onClick={handleLoginClick}>로그인
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

