import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useNavigate } from 'react-router-dom';
import MovieRatingForm from '../components/MovieRatingForm';
import { addMovieToWatchlist, logWatchedMovie } from '../services/firestore';
import { getPosterUrl, searchMovies } from '../services/tmdb';

function Search() {
  const { user } = useAuth();
  const { markMovieRemoved, markMovieSaved, refreshWatchCount } = useWatchlist();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [savingMovieIds, setSavingMovieIds] = useState([]);
  const [savedMovieIds, setSavedMovieIds] = useState([]);
  const [loggingMovieIds, setLoggingMovieIds] = useState([]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setError(null);
    setStatus('Searching…');

    try {
      const movies = await searchMovies(trimmedQuery);
      setResults(movies);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus('');
    }
  };

  const handleOpenDiscover = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    navigate(`/discover?query=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleAdd = async (movie) => {
    if (!user) return;
    if (savingMovieIds.includes(movie.id) || savedMovieIds.includes(movie.id)) return;

    setError(null);
    setStatus(`Added ${movie.title} to your watchlist. Syncing…`);
    setSavingMovieIds((current) => [...current, movie.id]);
    setSavedMovieIds((current) => [...current, movie.id]);
    const changedCount = markMovieSaved(movie.id);

    try {
      await addMovieToWatchlist(user.uid, movie);
      refreshWatchCount().catch(() => undefined);
      setStatus(`Saved ${movie.title} to your watchlist.`);
    } catch (err) {
      if (changedCount) {
        markMovieRemoved(movie.id);
      }
      setSavedMovieIds((current) => current.filter((movieId) => movieId !== movie.id));
      setError('Unable to add movie to watchlist.');
    } finally {
      setSavingMovieIds((current) => current.filter((movieId) => movieId !== movie.id));
      setTimeout(() => setStatus(''), 1500);
    }
  };

  const handleRate = async (movie, ratingData) => {
    if (!user) return;
    if (loggingMovieIds.includes(movie.id)) return;

    setError(null);
    setStatus(`Saving your rating for ${movie.title}…`);
    setLoggingMovieIds((current) => [...current, movie.id]);

    try {
      await logWatchedMovie(user.uid, {
        ...movie,
        ...ratingData,
        watchedAt: new Date(),
      });
      setStatus(`Rated ${movie.title}.`);
    } catch (err) {
      setError('Unable to save your rating.');
    } finally {
      setLoggingMovieIds((current) => current.filter((movieId) => movieId !== movie.id));
      setTimeout(() => setStatus(''), 1500);
    }
  };

  return (
    <section>
      <h2>Search Movies</h2>
      <p>Search for movies using the TMDB API and add them to your watchlist.</p>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          placeholder="Search by title..."
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="search-actions">
          <button type="submit">Search</button>
          <button type="button" className="secondary-button" onClick={handleOpenDiscover}>
            Open in Discover
          </button>
        </div>
      </form>

      {status && <p className="status-message">{status}</p>}
      {error && <p className="error-message">{error}</p>}

      {results.length > 0 && (
        <div className="movie-grid">
          {results.map((movie) => (
            <MovieResult
              key={movie.id}
              movie={movie}
              user={user}
              isSaving={savingMovieIds.includes(movie.id)}
              isSaved={savedMovieIds.includes(movie.id)}
              isLogging={loggingMovieIds.includes(movie.id)}
              onAdd={handleAdd}
              onRate={handleRate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MovieResult({ movie, user, isSaving, isSaved, isLogging, onAdd, onRate }) {
  let buttonText = 'Sign in to add';
  if (user) buttonText = 'Add to Watchlist';
  if (isSaving) buttonText = 'Saving...';
  if (isSaved) buttonText = 'Added';

  return (
    <article className="movie-card">
      {getPosterUrl(movie.poster_path) ? (
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={`${movie.title} poster`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="poster-fallback">No image</div>
      )}
      <div className="movie-meta">
        <h3>{movie.title}</h3>
        <p>{movie.release_date}</p>
        <button type="button" onClick={() => onAdd(movie)} disabled={!user || isSaving || isSaved}>
          {buttonText}
        </button>
        {user && (
          <MovieRatingForm
            disabled={isLogging}
            submitLabel={isLogging ? 'Saving...' : 'Rate Movie'}
            onSubmit={(ratingData) => onRate(movie, ratingData)}
          />
        )}
      </div>
    </article>
  );
}

export default Search;
