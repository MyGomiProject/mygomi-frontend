import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ParallaxBackground from '../components/ParallaxBackground';
import './Auth.css';

type FormData = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      console.log('로그인 시도:', data);
      await auth.login(data);
      console.log('로그인 성공');
      navigate('/');
    } catch (err: any) {
      console.error('로그인 에러:', err);
      console.error('에러 응답:', err?.response);
      console.error('에러 요청:', err?.request);
      
      // Network Error (CORS 문제 등)
      if (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK') {
        setServerError('네트워크 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요. (CORS 문제일 수 있습니다)');
      } else if (err?.response) {
        // 서버에서 응답이 온 경우: 상태코드와 관계없이 로그인 실패는 동일한 문구로 안내
        setServerError('이메일 또는 비밀번호를 확인해주세요.');
      } else {
        // 기타 에러
        const msg = err?.message || '로그인에 실패했습니다.';
        setServerError(msg);
      }
    }
  };

  return (
    <div className="auth-page login-page">
      <ParallaxBackground />
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} aria-label="login-form">
        <h2>로그인</h2>

        <label htmlFor="email">이메일</label>
        <input id="email" type="email" {...register('email', { required: '이메일을 입력해 주세요' })} />
        {errors.email && <p className="error">{errors.email.message}</p>}

        <label htmlFor="password">비밀번호</label>
        <input id="password" type="password" {...register('password', { required: '비밀번호를 입력해 주세요', minLength: { value: 6, message: '비밀번호는 최소 6자리입니다' } })} />
        {errors.password && <p className="error">{errors.password.message}</p>}

        {serverError && <p className="error server-error">{serverError}</p>}

        <button type="submit" className="btn-primary">로그인</button>

        <p className="muted">계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
      </form>
    </div>
  );
};

export default LoginPage;
