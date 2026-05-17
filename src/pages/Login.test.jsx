import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

test('renders sign-in button for unauthenticated users', () => {
  useAuth.mockReturnValue({ user: null, loading: false, signIn: jest.fn() });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
});

test('calls signIn when button is clicked', async () => {
  const mockSignIn = jest.fn();
  useAuth.mockReturnValue({ user: null, loading: false, signIn: mockSignIn });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const button = screen.getByRole('button', { name: /sign in with google/i });
  await userEvent.click(button);

  expect(mockSignIn).toHaveBeenCalled();
});

test('shows a helpful message when Google sign-in fails', async () => {
  const mockSignIn = jest.fn().mockRejectedValue({
    code: 'auth/unauthorized-domain',
    message: 'Unauthorized domain',
  });
  useAuth.mockReturnValue({ user: null, loading: false, signIn: mockSignIn });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const button = screen.getByRole('button', { name: /sign in with google/i });
  await userEvent.click(button);

  expect(await screen.findByRole('alert')).toHaveTextContent(/domain is not authorized/i);
});

test('shows loading state while auth is pending', () => {
  useAuth.mockReturnValue({ user: null, loading: true, signIn: jest.fn() });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
