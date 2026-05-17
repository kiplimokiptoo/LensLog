import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '../contexts/AuthContext';
import {
  getWatchlist,
  logWatchedMovie,
  removeMovieFromWatchlist,
} from '../services/firestore';
import WatchlistPanel from '../components/WatchlistPanel';

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

const movie = {
  id: 1,
  title: 'Arrival',
  release_date: '2016-11-11',
  poster_path: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { uid: 'abc123' }, loading: false });
  mockUseWatchlist.mockReturnValue({
    markMovieRemoved: jest.fn(),
    replaceWatchlist: jest.fn(),
    watchCount: 1,
  });
});

test('loads movies in the watchlist', async () => {
  getWatchlist.mockResolvedValue([movie]);

  render(<WatchlistPanel />);

  expect(await screen.findByText('Arrival')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
});

test('shows an error when the watchlist cannot load', async () => {
  getWatchlist.mockRejectedValue(new Error('permission denied'));

  render(<WatchlistPanel />);

  expect(await screen.findByText(/unable to load your watchlist/i)).toBeInTheDocument();
});

test('removes a movie from the watchlist', async () => {
  getWatchlist.mockResolvedValue([movie]);
  removeMovieFromWatchlist.mockResolvedValue();

  render(<WatchlistPanel />);

  expect(await screen.findByText('Arrival')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /remove/i }));

  expect(removeMovieFromWatchlist).toHaveBeenCalledWith('abc123', 1);
  await waitFor(() => {
    expect(screen.queryByText('Arrival')).not.toBeInTheDocument();
  });
});

test('marks a watchlist movie as watched', async () => {
  getWatchlist.mockResolvedValue([movie]);
  logWatchedMovie.mockResolvedValue();
  removeMovieFromWatchlist.mockResolvedValue();

  render(<WatchlistPanel />);

  expect(await screen.findByText('Arrival')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /^mark watched$/i }));

  expect(logWatchedMovie).toHaveBeenCalledWith(
    'abc123',
    expect.objectContaining({
      id: 1,
      title: 'Arrival',
      watchedAt: expect.any(Date),
    })
  );
  expect(removeMovieFromWatchlist).toHaveBeenCalledWith('abc123', 1);
  await screen.findByText(/marked arrival as watched/i);
});
