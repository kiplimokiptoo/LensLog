import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addMovieToWatchlist, logWatchedMovie } from '../services/firestore';
import { searchMovies } from '../services/tmdb';
import Search from './Search';

const mockUseWatchlist = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../contexts/WatchlistContext', () => ({
  useWatchlist: () => mockUseWatchlist(),
}));

jest.mock('../services/firestore', () => ({
  addMovieToWatchlist: jest.fn(),
  logWatchedMovie: jest.fn(),
}));

jest.mock('../services/tmdb', () => ({
  getPosterUrl: jest.fn(() => null),
  searchMovies: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseWatchlist.mockReturnValue({
    markMovieRemoved: jest.fn(),
    markMovieSaved: jest.fn(() => true),
    refreshWatchCount: jest.fn(() => Promise.resolve([])),
  });
});

test('shows watchlist adds immediately while Firestore syncs', async () => {
  let resolveSave;
  const savePromise = new Promise((resolve) => {
    resolveSave = resolve;
  });

  useAuth.mockReturnValue({ user: { uid: 'abc123' } });
  searchMovies.mockResolvedValue([
    {
      id: 1,
      title: 'Arrival',
      release_date: '2016-11-11',
      poster_path: null,
    },
  ]);
  addMovieToWatchlist.mockReturnValue(savePromise);

  render(
    <MemoryRouter>
      <Search />
    </MemoryRouter>
  );

  await userEvent.type(screen.getByPlaceholderText(/search by title/i), 'arrival');
  await userEvent.click(screen.getByRole('button', { name: /search/i }));

  const addButton = await screen.findByRole('button', { name: /add to watchlist/i });
  await userEvent.click(addButton);

  expect(screen.getByRole('button', { name: /added/i })).toBeDisabled();
  expect(screen.getByText(/syncing/i)).toBeInTheDocument();
  expect(mockUseWatchlist().markMovieSaved).toHaveBeenCalledWith(1);

  resolveSave();

  await waitFor(() => {
    expect(screen.getByText(/saved arrival/i)).toBeInTheDocument();
  });
});

test('logs a rating from a search result', async () => {
  useAuth.mockReturnValue({ user: { uid: 'abc123' } });
  searchMovies.mockResolvedValue([
    {
      id: 2,
      title: 'Moonlight',
      release_date: '2016-10-21',
      poster_path: null,
    },
  ]);
  logWatchedMovie.mockResolvedValue();

  render(
    <MemoryRouter>
      <Search />
    </MemoryRouter>
  );

  await userEvent.type(screen.getByPlaceholderText(/search by title/i), 'moonlight');
  await userEvent.click(screen.getByRole('button', { name: /search/i }));

  await screen.findByText('Moonlight');
  await userEvent.type(screen.getByLabelText(/rating 0 to 10/i), '9');
  await userEvent.type(screen.getByLabelText(/short review/i), 'Beautiful.');
  await userEvent.click(screen.getByRole('button', { name: /rate movie/i }));

  await waitFor(() => {
    expect(logWatchedMovie).toHaveBeenCalledWith(
      'abc123',
      expect.objectContaining({
        id: 2,
        title: 'Moonlight',
        rating: 9,
        review: 'Beautiful.',
        watchedAt: expect.any(Date),
      })
    );
  });
});

test('opens a search query in discover', async () => {
  useAuth.mockReturnValue({ user: { uid: 'abc123' } });

  function LocationDisplay() {
    const location = useLocation();
    return <p>{`${location.pathname}${location.search}`}</p>;
  }

  render(
    <MemoryRouter initialEntries={['/search']}>
      <Routes>
        <Route path="/search" element={<Search />} />
        <Route path="/discover" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  );

  await userEvent.type(screen.getByPlaceholderText(/search by title/i), 'arrival');
  await userEvent.click(screen.getByRole('button', { name: /open in discover/i }));

  expect(screen.getByText('/discover?query=arrival')).toBeInTheDocument();
});
