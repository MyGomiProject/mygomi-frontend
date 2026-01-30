import React from 'react';
import Header from '../components/Header';
import Map from '../components/Map';
import './SharingPage.css';

const SharingPage: React.FC = () => {
  return (
    <div className="sharing-page">
      <Header />
      <main className="sharing-main">
        <div className="sharing-container">
          <div className="sharing-header">
            <h1 className="sharing-title">근처 나눔 지도</h1>
            <p className="sharing-subtitle">우리 동네 Free Sharing Market</p>
          </div>
          <div className="sharing-map-wrapper">
            <Map />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharingPage;

