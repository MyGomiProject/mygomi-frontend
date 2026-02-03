import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'authToken';

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

// 초기화: 이미 로컬스토리지에 토큰이 있으면 헤더로 설정
const existing = localStorage.getItem(TOKEN_KEY);
if (existing) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${existing}`;
}

// 응답 인터셉터로 401을 받으면 토큰을 제거하고 콘솔 경고
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      // 자동으로 토큰 제거 (로그아웃 처리는 앱 쪽에서 수행)
      localStorage.removeItem(TOKEN_KEY);
      delete apiClient.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export default apiClient;
