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
          <Route path="/" element={<HomePage />} />
          <Route path="/sharing" element={<SharingPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
