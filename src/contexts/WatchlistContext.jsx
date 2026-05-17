import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

async function loadWatchlist(uid) {
  const { getWatchlist } = await import('../services/firestore');
  return getWatchlist(uid);
}

export function WatchlistProvider({ children }) {
  const { user, loading } = useAuth();
  const savedMovieIds = useRef(new Set());
  const [watchCount, setWatchCount] = useState(0);
  const [isWatchCountLoading, setIsWatchCountLoading] = useState(false);

  const replaceWatchlist = useCallback((movies) => {
    const nextIds = new Set(movies.map((movie) => String(movie.id)));
    savedMovieIds.current = nextIds;
    setWatchCount(nextIds.size);
  }, []);

  const refreshWatchCount = useCallback(async () => {
    if (!user) {
      replaceWatchlist([]);
      return [];
    }

    setIsWatchCountLoading(true);
    try {
      const list = await loadWatchlist(user.uid);
      replaceWatchlist(list);
      return list;
    } finally {
      setIsWatchCountLoading(false);
    }
  }, [replaceWatchlist, user]);

  const markMovieSaved = useCallback((movieId) => {
    const key = String(movieId);
    if (savedMovieIds.current.has(key)) return false;

    const nextIds = new Set(savedMovieIds.current);
    nextIds.add(key);
    savedMovieIds.current = nextIds;
    setWatchCount(nextIds.size);
    return true;
  }, []);

  const markMovieRemoved = useCallback((movieId) => {
    const key = String(movieId);
    if (!savedMovieIds.current.has(key)) return false;

    const nextIds = new Set(savedMovieIds.current);
    nextIds.delete(key);
    savedMovieIds.current = nextIds;
    setWatchCount(nextIds.size);
    return true;
  }, []);

  useEffect(() => {
    let isCurrent = true;

    if (loading) return undefined;

    if (!user) {
      replaceWatchlist([]);
      setIsWatchCountLoading(false);
      return undefined;
    }

    setIsWatchCountLoading(true);
    loadWatchlist(user.uid)
      .then((list) => {
        if (isCurrent) {
          replaceWatchlist(list);
        }
      })
      .catch((error) => {
        console.warn('Unable to load watch count:', error.message);
      })
      .finally(() => {
        if (isCurrent) {
          setIsWatchCountLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [loading, replaceWatchlist, user]);

  const value = useMemo(
    () => ({
      isWatchCountLoading,
      markMovieRemoved,
      markMovieSaved,
      refreshWatchCount,
      replaceWatchlist,
      watchCount,
    }),
    [
      isWatchCountLoading,
      markMovieRemoved,
      markMovieSaved,
      refreshWatchCount,
      replaceWatchlist,
      watchCount,
    ]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used inside WatchlistProvider');
  }

  return context;
}
