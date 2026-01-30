import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SharingPage from './pages/SharingPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* 팀원의 기본 페이지 구조를 따릅니다 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/sharing" element={<SharingPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;