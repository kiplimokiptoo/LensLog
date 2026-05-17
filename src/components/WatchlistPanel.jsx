import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import MovieRatingForm from './MovieRatingForm';
import { getPosterUrl } from '../services/tmdb';
import {
  getWatchlist,
  logWatchedMovie,
  removeMovieFromWatchlist,
} from '../services/firestore';

function WatchlistPanel() {
  const { user, loading } = useAuth();
  const { markMovieRemoved, replaceWatchlist, watchCount } = useWatchlist();
  const [watchlist, setWatchlist] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  const [loggingMovieIds, setLoggingMovieIds] = useState([]);
  const [removingMovieIds, setRemovingMovieIds] = useState([]);

  useEffect(() => {
    let isCurrent = true;

    const loadWatchlist = async () => {
      if (!user) {
        setWatchlist([]);
        setIsLoadingWatchlist(false);
        return;
      }

      setIsLoadingWatchlist(true);
      setError('');
      try {
        const list = await getWatchlist(user.uid);
        if (isCurrent) {
          setWatchlist(list);
          replaceWatchlist(list);
        }
      } catch (err) {
        if (isCurrent) {
          setError('Unable to load your watchlist. Check your Firestore rules and try again.');
        }
      } finally {
        if (isCurrent) {
          setIsLoadingWatchlist(false);
        }
      }
    };

    loadWatchlist();

    return () => {
      isCurrent = false;
    };
  }, [replaceWatchlist, user]);

  const sortedWatchlist = useMemo(
    () =>
      [...watchlist].sort((a, b) => {
        const aTime = a.addedAt?.toMillis?.() || 0;
        const bTime = b.addedAt?.toMillis?.() || 0;
        return bTime - aTime;
      }),
    [watchlist]
  );

  const handleRemove = async (movieId) => {
    if (!user) return;
    if (removingMovieIds.includes(movieId)) return;

    setError('');
    setRemovingMovieIds((current) => [...current, movieId]);
    try {
      await removeMovieFromWatchlist(user.uid, movieId);
      setWatchlist((current) => current.filter((movie) => movie.id !== movieId));
      markMovieRemoved(movieId);
    } catch (err) {
      setError('Unable to remove this movie from your watchlist.');
    } finally {
      setRemovingMovieIds((current) => current.filter((id) => id !== movieId));
    }
  };

  const handleMarkWatched = async (movie, ratingData = {}) => {
    if (!user) return;
    if (loggingMovieIds.includes(movie.id)) return;

    setError('');
    setLoggingMovieIds((current) => [...current, movie.id]);
    try {
      await logWatchedMovie(user.uid, {
        ...movie,
        ...ratingData,
        watchedAt: new Date(),
      });
      await removeMovieFromWatchlist(user.uid, movie.id);
      setWatchlist((current) => current.filter((item) => item.id !== movie.id));
      markMovieRemoved(movie.id);
      setStatus(`Marked ${movie.title} as watched.`);
      setTimeout(() => setStatus(''), 1800);
    } catch (err) {
      setError('Unable to mark this movie as watched.');
    } finally {
      setLoggingMovieIds((current) => current.filter((movieId) => movieId !== movie.id));
    }
  };

  if (loading) {
    return (
      <section className="watchlist-panel">
        <h2>Your Watchlist</h2>
        <p>Loading your session…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="watchlist-panel">
        <h2>Your Watchlist</h2>
        <p>Sign in with Google to save and manage your personal watchlist.</p>
      </section>
    );
  }

  return (
    <section className="watchlist-panel">
      <div className="watchlist-panel-header">
        <div>
          <h2>Your Watchlist</h2>
          <p>Saved movies are arranged newest first.</p>
        </div>
        <div
          className="watch-count"
          aria-label={`${watchCount} ${watchCount === 1 ? 'movie' : 'movies'} in watchlist`}
        >
          <strong>{watchCount}</strong>
          <span>{watchCount === 1 ? 'movie' : 'movies'}</span>
        </div>
      </div>

      {status && <p className="status-message">{status}</p>}
      {error && <p className="error-message">{error}</p>}
      {isLoadingWatchlist ? (
        <p>Loading your watchlist…</p>
      ) : sortedWatchlist.length === 0 ? (
        <p>You do not have any movies in your watchlist yet.</p>
      ) : (
        <div className="watchlist-grid">
          {sortedWatchlist.map((movie) => (
            <article key={movie.id} className="watchlist-card">
              <div className="watchlist-poster">
                {getPosterUrl(movie.poster_path) ? (
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="poster-fallback">No image</div>
                )}
              </div>
              <div className="watchlist-meta">
                <div>
                  <h3>{movie.title}</h3>
                  <p>{movie.release_date || 'Release date unavailable'}</p>
                </div>
                <MovieRatingForm
                  disabled={loggingMovieIds.includes(movie.id)}
                  submitLabel={
                    loggingMovieIds.includes(movie.id) ? 'Saving...' : 'Rate & Mark Watched'
                  }
                  onSubmit={(ratingData) => handleMarkWatched(movie, ratingData)}
                />
                <div className="button-group">
                  <button
                    type="button"
                    onClick={() => handleMarkWatched(movie)}
                    disabled={loggingMovieIds.includes(movie.id)}
                  >
                    Mark watched
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(movie.id)}
                    disabled={removingMovieIds.includes(movie.id)}
                  >
                    {removingMovieIds.includes(movie.id) ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default WatchlistPanel;
