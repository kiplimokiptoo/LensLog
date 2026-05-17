import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDiscoverLogs } from '../services/firestore';
import { getDiscoveryMovies, getPosterUrl } from '../services/tmdb';

function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const apiQuery = searchParams.get('query')?.trim() || '';
  const [query, setQuery] = useState(apiQuery);
  const [discover, setDiscover] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuery(apiQuery);
  }, [apiQuery]);

  useEffect(() => {
    const loadDiscover = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [entriesResult, moviesResult] = await Promise.allSettled([
          getDiscoverLogs(),
          getDiscoveryMovies(apiQuery),
        ]);

        if (entriesResult.status === 'fulfilled') {
          setDiscover(entriesResult.value);
        } else {
          setDiscover([]);
        }

        if (moviesResult.status === 'fulfilled') {
          setMovies(moviesResult.value);
        } else {
          setMovies([]);
          setError('Unable to load discovery movies right now.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDiscover();
  }, [apiQuery]);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      setSearchParams({ query: trimmedQuery });
    } else {
      setSearchParams({});
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Unknown';
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <section>
      <h2>Discover</h2>
      <p>See what other users are watching and find new movies to review.</p>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          placeholder="Search discovery..."
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="search-actions">
          <button type="submit">Search API</button>
          <button type="button" className="secondary-button" onClick={() => setSearchParams({})}>
            Popular
          </button>
        </div>
      </form>
      {isLoading && <p>Loading discovery…</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && discover.length > 0 && (
        <>
          <h3>Community Reviews</h3>
          <div className="discover-grid">
            {discover.map((entry, index) => (
              <article key={`${entry.movieId}-${index}`} className="discover-card">
                {entry.poster_path && (
                  <img
                    src={getPosterUrl(entry.poster_path)}
                    alt={entry.title}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="discover-meta">
                  <h3>{entry.title}</h3>
                  <p>{formatDate(entry.watchedAt)}</p>
                  {entry.rating != null && <p>Rating: ⭐ {entry.rating}/10</p>}
                  {entry.review && <p>{entry.review}</p>}
                  <p className="small-text">Shared by {entry.uid}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {!isLoading && (
        <>
          <h3>{apiQuery ? `API Results for "${apiQuery}"` : 'Popular Movies'}</h3>
          {movies.length === 0 ? (
            <p>No movies available right now.</p>
          ) : (
            <div className="movie-grid">
              {movies.map((movie) => (
                <article key={movie.id} className="movie-card">
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
                    {movie.vote_average != null && (
                      <p>TMDB: ⭐ {movie.vote_average.toFixed(1)}/10</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Discover;
