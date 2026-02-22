/* [src/index.tsx] */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. MSW 활성화를 기다려주는 비동기 함수
async function enableMocking() {
  // 개발 환경이고 .env에서 MSW 사용이 true일 때만 작동
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MSW === 'true') {
    const { worker } = await import('./mocks/browser');
    
    // worker.start()가 완료될 때까지 await로 기다립니다
    return worker.start({
      onUnhandledRequest: 'bypass', // 정의되지 않은 API는 실제 서버로 보냄
    });
  }
  return Promise.resolve();
}

// 2. MSW가 완전히 준비된 후에만 리액트 앱을 렌더링합니다
enableMocking().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

reportWebVitals();