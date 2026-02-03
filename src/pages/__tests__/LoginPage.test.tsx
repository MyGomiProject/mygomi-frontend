import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../contexts/AuthContext';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('성공적으로 로그인하면 토큰이 저장된다', async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /로그인/i }));

    await waitFor(() => expect(localStorage.getItem('authToken')).toBe('fake-token-123'));
    expect(screen.queryByText(/이메일 또는 비밀번호가 올바르지 않습니다./i)).toBeNull();
  });

  test('잘못된 인증 정보는 에러를 보여준다', async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/이메일/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/비밀번호/i), 'wrongpw');
    await userEvent.click(screen.getByRole('button', { name: /로그인/i }));

    await waitFor(() => expect(screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다./i)).toBeInTheDocument());
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});
