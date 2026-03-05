import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import SharingPage from './pages/SharingPage';
import AddressInputPage from './pages/AddressInputPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import IntegratedSearchPage from './pages/IntegratedSearchPage';
import SharePostCreatePage from './pages/SharePostCreatePage';
import TestPage from './pages/TestPage';
import AdminReportList from './pages/AdminReportList';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ChatNotificationListener from './components/ChatNotificationListener';
import KeywordAlertPoller from './components/KeywordAlertPoller';
import './App.css';

const queryClient = new QueryClient();

// 💡 관리자 라우트 보호 컴포넌트
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') {
    alert('관리자 권한이 필요합니다.');
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="App">
            <ChatNotificationListener />
            <KeywordAlertPoller />
            <Routes>
              {/* 팀원의 기본 페이지 구조를 따릅니다 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/sharing" element={<SharingPage />} />
              <Route path="/sharing/create" element={<SharePostCreatePage />} />
              <Route path="/address-input" element={<AddressInputPage />} />

              {/* 검색 페이지 경로 등록 */}
                <Route path="/integrated-search" element={<IntegratedSearchPage />} />
              
              {/* 인증 페이지 추가 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* 마이페이지 */}
              <Route path="/mypage" element={<MyPage />} />
              
              {/* 테스트 페이지 (개발용) */}
              <Route path="/test" element={<TestPage />} />

              {/* 💡 관리자 전용 라우트 추가 */}
              <Route 
                path="/admin/reports" 
                element={
                  <AdminRoute>
                    <AdminReportList />
                  </AdminRoute>
                } 
              />

            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;