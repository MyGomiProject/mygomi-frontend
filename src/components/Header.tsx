import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <span className="logo-text">MYGOMI</span>
          <span className="logo-icon"></span>
        </div>
        <nav className="header-nav">
          <a href="#waste-guide" className="nav-link">분리수거 정보</a>
          <a href="#sharing" className="nav-link">나눔</a>
          <a href="#notice" className="nav-link">신고</a>
          <a href="#mypage" className="nav-link">마이페이지</a>
          <button className="login-button">로그인</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

