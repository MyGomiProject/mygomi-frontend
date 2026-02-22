// 유저 관련 타입 정의

export interface User {
  id: number;
  email: string;
  nickname: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  data: User;
}

