export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  token: string;
  // 필요한 경우 user 정보 추가
}