import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import SharingPage from './pages/SharingPage';
import AddressInputPage from './pages/AddressInputPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              {/* 팀원의 기본 페이지 구조를 따릅니다 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/sharing" element={<SharingPage />} />
              <Route path="/address-input" element={<AddressInputPage />} />
              
              {/* 인증 페이지 추가 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;