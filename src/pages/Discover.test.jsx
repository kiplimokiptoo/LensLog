import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getDiscoverLogs } from '../services/firestore';
import { getDiscoveryMovies } from '../services/tmdb';
import Discover from './Discover';

jest.mock('../services/firestore', () => ({
  getDiscoverLogs: jest.fn(),
}));

jest.mock('../services/tmdb', () => ({
  getDiscoveryMovies: jest.fn(),
  getPosterUrl: jest.fn(() => null),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows popular movies on the discover page', async () => {
  getDiscoverLogs.mockResolvedValue([]);
  getDiscoveryMovies.mockResolvedValue([
    {
      id: 1,
      title: 'Dune: Part Two',
      release_date: '2024-03-01',
      poster_path: null,
      vote_average: 8.2,
    },
  ]);

  render(
    <MemoryRouter>
      <Discover />
    </MemoryRouter>
  );

  expect(await screen.findByText(/popular movies/i)).toBeInTheDocument();
  expect(screen.getByText('Dune: Part Two')).toBeInTheDocument();
  expect(screen.getByText(/tmdb: .*8.2\/10/i)).toBeInTheDocument();
  expect(getDiscoveryMovies).toHaveBeenCalledWith('');
});

test('uses the URL query to search TMDB from discover', async () => {
  getDiscoverLogs.mockResolvedValue([]);
  getDiscoveryMovies.mockResolvedValue([
    {
      id: 2,
      title: 'Arrival',
      release_date: '2016-11-11',
      poster_path: null,
      vote_average: 7.6,
    },
  ]);

  render(
    <MemoryRouter initialEntries={['/discover?query=arrival']}>
      <Discover />
    </MemoryRouter>
  );

  expect(await screen.findByText(/api results for "arrival"/i)).toBeInTheDocument();
  expect(screen.getByText('Arrival')).toBeInTheDocument();
  expect(getDiscoveryMovies).toHaveBeenCalledWith('arrival');
});
