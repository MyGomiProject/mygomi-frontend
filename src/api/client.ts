import axios from 'axios';

// [수정 전] const API_BASE = '/api';
// [수정 후] 빈 문자열로 변경 (이미 개별 API 파일에 /api를 적었으므로 중복 방지)
const API_BASE = '';

const apiClient = axios.create({
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

// 요청 인터셉터: 요청 전 로그
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log('API 요청:', config.method?.toUpperCase(), config.url);
    console.log('Base URL:', config.baseURL || '(empty - using proxy)');
    console.log('Full URL:', fullUrl);
    console.log('Request config:', {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터로 401을 받으면 토큰을 제거하고 콘솔 경고
apiClient.interceptors.response.use(
  (res) => {
    console.log('API 응답 성공:', res.config.url, res.status);
    return res;
  },
  (error) => {
    console.error('API 응답 에러:', {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      message: error?.message,
      code: error?.code,
    });
    
    if (error?.response?.status === 401) {
      // 자동으로 토큰 제거 (로그아웃 처리는 앱 쪽에서 수행)
      localStorage.removeItem(TOKEN_KEY);
      delete apiClient.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export default apiClient;
