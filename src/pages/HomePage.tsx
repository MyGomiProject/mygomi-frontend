import React from 'react';
import Header from '../components/Header';
import ParallaxBackground from '../components/ParallaxBackground';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <ParallaxBackground />
      <Header />
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">복잡한 분리수거, MYGOMI와 함께 쉽게</h1>
            <p className="hero-subtitle">
              우리 동네 분리수거 요일과 배출 방법을 한눈에 확인하고, 재사용 가능한
              물건은 이웃과 나눠보세요.
            </p>
            <div className="search-container">
              <input
                type="text"
                placeholder="예: 신주쿠구 페트병 배출 요일"
                className="search-input"
              />
              <button className="search-button">검색</button>
            </div>
          </div>
        </section>

        <section className="bottom-section">
          <div className="bottom-inner">
            <div className="panel panel-left">
              <div className="panel-header">
                <h2 className="panel-title">마짬 분리수거 캘린더</h2>
                <span className="panel-subtitle">이번 주 배출 요일 한눈에 보기</span>
              </div>
              <div className="panel-placeholder calendar-placeholder">
                <div className="calendar-grid">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="calendar-day">
                      <span className="calendar-day-label">
                        {['월', '화', '수', '목', '금', '토', '일'][index]}
                      </span>
                      <span className="calendar-badge" />
                    </div>
                  ))}
                </div>
                <p className="panel-description">
                  실제 서비스에서는 각 요일별 배출 가능한 쓰레기 종류와 알림이 표시될
                  예정입니다.
                </p>
              </div>
            </div>

            <div className="panel panel-right">
              <div className="panel-header">
                <h2 className="panel-title">근처 나눔 지도</h2>
                <span className="panel-subtitle">우리 동네 Free Sharing Market</span>
              </div>
              <div className="panel-placeholder map-placeholder">
                <div className="map-area">
                  <div className="map-block map-water" />
                  <div className="map-block map-park" />
                  <div className="map-block map-town" />
                  <div className="map-pin pin-one" />
                  <div className="map-pin pin-two" />
                  <div className="map-pin pin-three" />
                </div>
                <p className="panel-description">
                  나눔 물품 등록과 픽업 장소가 지도 위에 표시되어 주변 이웃과 쉽게 연결될
                  수 있어요.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
