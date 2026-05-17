import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getWatchlist } from '../services/firestore';
import Home from './Home';

const mockUseWatchlist = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../contexts/WatchlistContext', () => ({
  useWatchlist: () => mockUseWatchlist(),
}));

jest.mock('../services/firestore', () => ({
  getWatchlist: jest.fn(),
  logWatchedMovie: jest.fn(),
  removeMovieFromWatchlist: jest.fn(),
}));

jest.mock('../services/tmdb', () => ({
  getPosterUrl: jest.fn(() => null),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseWatchlist.mockReturnValue({
    markMovieRemoved: jest.fn(),
    replaceWatchlist: jest.fn(),
    watchCount: 0,
  });
});

test('shows sign-in prompt when user is not authenticated', () => {
  useAuth.mockReturnValue({ user: null, loading: false, signIn: jest.fn() });

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  expect(screen.getByText(/save your watchlist, rate movies/i)).toBeInTheDocument();
});

test('shows the fused watchlist and watch count when user is authenticated', async () => {
  useAuth.mockReturnValue({ user: { uid: 'abc123' }, loading: false, signIn: jest.fn() });
  mockUseWatchlist.mockReturnValue({
    markMovieRemoved: jest.fn(),
    replaceWatchlist: jest.fn(),
    watchCount: 2,
  });
  getWatchlist.mockResolvedValue([
    {
      id: 1,
      title: 'Arrival',
      release_date: '2016-11-11',
      poster_path: null,
    },
    {
      id: 2,
      title: 'Moonlight',
      release_date: '2016-10-21',
      poster_path: null,
    },
  ]);

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.queryByRole('button', { name: /get started/i })).toBeNull();
  expect(await screen.findByLabelText(/2 movies in watchlist/i)).toBeInTheDocument();
  expect(screen.getByText('Arrival')).toBeInTheDocument();
  expect(screen.getByText('Moonlight')).toBeInTheDocument();
});
