import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// MSW 비활성화: 실제 API를 사용하려면 아래 코드를 주석 처리하세요
// if (process.env.NODE_ENV === 'development') {
//   // 개발 환경에서 MSW를 사용해 백엔드 목업 제공
//   import('./mocks/browser').then(({ worker }) => {
//     worker.start({
//       onUnhandledRequest: 'bypass', // 실제 API로 요청 전달
//     });
//   });
// }

// 실제 API를 사용하려면 MSW를 완전히 비활성화
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MSW === 'true') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass', // 실제 API로 요청 전달
    });
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
