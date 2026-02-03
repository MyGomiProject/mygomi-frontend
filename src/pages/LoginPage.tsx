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
      await auth.login(data);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || '로그인에 실패했습니다.';
      setServerError(msg);
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
