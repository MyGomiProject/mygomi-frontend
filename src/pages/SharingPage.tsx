import React from 'react';
import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import Map from '../components/Map';
import SharingPostList from '../components/SharingPostList';
import './SharingPage.css';

const SharingPage: React.FC = () => {
  const handleWriteClick = () => {
    // 글쓰기 페이지로 이동 (추후 구현)
    console.log('Write button clicked');
  };

  return (
    <div className="sharing-page">
      <ParallaxBackground />
      <Header />
      <main className="sharing-main">
        <div className="sharing-container">
          <div className="sharing-header">
            <h1 className="sharing-title">근처 나눔 지도</h1>
            <p className="sharing-subtitle">우리 동네 Free Sharing Market</p>
          </div>
          <div className="sharing-content-wrapper">
            <div className="sharing-map-section">
              <Map />
            </div>
            <div className="sharing-posts-section">
              <div className="posts-header">
                <h2 className="posts-title">나눔 게시글</h2>
                <button className="write-button" onClick={handleWriteClick}>
                  ✏️ 글쓰기
                </button>
              </div>
              <SharingPostList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharingPage;

