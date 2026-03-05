import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ParallaxBackground from '../components/ParallaxBackground';
import './Auth.css';

// 1. 폼 데이터 타입 정의 (비밀번호 확인 추가)
type SignupFormInputs = {
  email: string;
  password: string;
  passwordConfirm: string; // 추가됨
  nickname: string;
};

// =================================================================
// [메인] 회원가입 페이지
// =================================================================
const SignupPage: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isValid, isSubmitting } 
  } = useForm<SignupFormInputs>({ mode: 'onChange' });
  
  // 비밀번호 실시간 비교를 위해 값 관찰
  const password = watch('password');

  const onSubmit = async (data: SignupFormInputs) => {
    setServerError(null);
    try {
      // 1. 회원가입 API 호출
      const response = await signup({
        email: data.email,
        password: data.password,
        nickname: data.nickname,
      });

      console.log('회원가입 완료:', response);

      // 2. 회원가입 성공 후 자동으로 로그인하여 토큰 획득
      try {
        await login({
          email: data.email,
          password: data.password,
        });
        console.log('자동 로그인 완료, 토큰 획득됨');

        // 3. 토큰이 저장된 후 주소 입력 페이지로 이동
        navigate('/address-input', { 
          state: { 
            signupData: {
              email: data.email,
              nickname: data.nickname,
            }
          } 
        });
      } catch (loginError: any) {
        console.error('자동 로그인 실패:', loginError);
        // 로그인 실패해도 회원가입은 성공했으므로 로그인 페이지로 이동
        setServerError('회원가입은 완료되었지만 자동 로그인에 실패했습니다. 로그인해주세요.');
        // 또는 로그인 페이지로 리다이렉트
        // navigate('/login', { state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' } });
      }
      
    } catch (err: any) {
      const msg = err?.response?.data?.message || '회원가입에 실패했습니다.';
      setServerError(msg);
    }
  };

  return (
    <div className="auth-page signup-page">
      <ParallaxBackground />
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} aria-label="signup-form">
        <h2>회원가입</h2>

        {/* 1. 닉네임 */}
        <label htmlFor="nickname">닉네임</label>
        <input 
          id="nickname" 
          {...register('nickname', { 
            required: '닉네임을 입력해 주세요',
            pattern: {
                value: /^[a-zA-Z0-9가-힣]+$/,
                message: '특수문자는 사용할 수 없습니다.'
            }
          })} 
        />
        {errors.nickname && <p className="error">{errors.nickname.message}</p>}

        {/* 2. 이메일 */}
        <label htmlFor="email">이메일</label>
        <input 
          id="email" 
          type="email" 
          {...register('email', { 
            required: '이메임을 입력해 주세요',
            pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: '올바른 이메일 형식이 아닙니다.'
            }
          })} 
        />
        {errors.email && <p className="error">{errors.email.message}</p>}

        {/* 3. 비밀번호 */}
        <label htmlFor="password">비밀번호</label>
        <input 
          id="password" 
          type="password" 
          placeholder="영문, 숫자, 특수문자 포함 6자 이상"
          {...register('password', { 
            required: '비밀번호를 입력해 주세요', 
            minLength: { value: 6, message: '비밀번호는 최소 6자리입니다' },
            pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^])[A-Za-z\d@$!%*#?&^]{6,}$/,
                message: '영문, 숫자, 특수문자를 포함해야 합니다.'
            }
          })} 
        />
        {errors.password && <p className="error">{errors.password.message}</p>}
        
        <label htmlFor="passwordConfirm">비밀번호 확인</label>
        <input 
          id="passwordConfirm" 
          type="password" 
          placeholder="비밀번호를 다시 입력해 주세요"
          {...register('passwordConfirm', { 
            required: '비밀번호 확인이 필요합니다.',
            validate: (value) => value === password || '비밀번호가 일치하지 않습니다.'
          })} 
        />
        {errors.passwordConfirm && <p className="error">{errors.passwordConfirm.message}</p>}
        {!errors.passwordConfirm && watch('passwordConfirm') && (
            <p className="success" style={{ color: 'green', fontSize: '12px', marginTop: '4px' }}>
                비밀번호가 일치합니다.
            </p>
        )}

        {/* 서버 에러 메시지 */}
        {serverError && <p className="error server-error">{serverError}</p>}

        <button type="submit" className="btn-primary" disabled={!isValid || isSubmitting}>
          {isSubmitting ? '가입 중...' : '회원가입'}
        </button>

        <p className="muted">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;