import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

test('redirects unauthenticated users to login', () => {
  useAuth.mockReturnValue({ user: null, loading: false });

  render(
    <MemoryRouter initialEntries={["/watchlist"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <div>Watchlist</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/login page/i)).toBeInTheDocument();
});

test('shows loading state while auth is pending', () => {
  useAuth.mockReturnValue({ user: null, loading: true });

  render(
    <MemoryRouter initialEntries={["/watchlist"]}>
      <Routes>
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <div>Watchlist</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
});
