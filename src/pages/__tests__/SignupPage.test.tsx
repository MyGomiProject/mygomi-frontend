import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SignupPage from '../SignupPage';
import { AuthProvider } from '../../contexts/AuthContext';

describe('SignupPage', () => {
  test('정상 가입 시 로그인 페이지로 이동한다', async () => {
    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <AuthProvider>
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<div>LOGIN PAGE</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/닉네임/i), '테스트');
    await userEvent.type(screen.getByLabelText(/이메일/i), 'new@example.com');
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /회원가입/i }));

    await waitFor(() => expect(screen.getByText(/LOGIN PAGE/i)).toBeInTheDocument());
  });

  test('중복 이메일은 에러를 보여줍니다', async () => {
    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <AuthProvider>
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/닉네임/i), '테스트');
    await userEvent.type(screen.getByLabelText(/이메일/i), 'existing@example.com');
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /회원가입/i }));

    await waitFor(() => expect(screen.getByText(/이미 등록된 이메일입니다./i)).toBeInTheDocument());
  });
});
