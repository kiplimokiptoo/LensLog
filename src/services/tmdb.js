import env from '../env';

const API_KEY = env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export function getPosterUrl(path) {
  return path ? `${POSTER_BASE}${path}` : null;
}

export async function searchMovies(query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(trimmedQuery)}&page=1&include_adult=false`
  );

  if (!response.ok) {
    throw new Error('Unable to fetch movies from TMDB');
  }

  const data = await response.json();
  return data.results || [];
}

export async function getPopularMovies() {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
  );

  if (!response.ok) {
    throw new Error('Unable to fetch popular movies from TMDB');
  }

  const data = await response.json();
  return data.results || [];
}

export async function getDiscoveryMovies(query = '') {
  const trimmedQuery = query.trim();
  return trimmedQuery ? searchMovies(trimmedQuery) : getPopularMovies();
}
