import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { getUserLogs } from '../services/firestore';

function Profile() {
  const { user, loading } = useAuth();
  const { isWatchCountLoading, watchCount } = useWatchlist();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLogs([]);
        return;
      }

      const data = await getUserLogs(user.uid);
      setLogs(data);
    };

    fetchData();
  }, [user]);

  const topRated = useMemo(
    () =>
      logs
        .filter((entry) => entry.rating != null)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3),
    [logs]
  );

  if (loading) {
    return (
      <section>
        <h2>Profile</h2>
        <p>Loading your profile…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h2>Profile</h2>
        <p>Sign in with Google to view your watch count and top-rated movies.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Profile</h2>
      <p>View your watch count, top-rated movies, and account details.</p>
      <div className="profile-grid">
        <div className="profile-card">
          <h3>Account</h3>
          <p>{user.displayName || 'Movie fan'}</p>
          <p>{user.email}</p>
        </div>
        <div className="profile-card">
          <h3>Watch Count</h3>
          <p>{isWatchCountLoading ? '...' : watchCount}</p>
        </div>
      </div>

      <div className="top-rated">
        <h3>Top Rated Movies</h3>
        {topRated.length === 0 ? (
          <p>You haven't rated any movies yet.</p>
        ) : (
          <ul>
            {topRated.map((entry) => (
              <li key={entry.movieId}>
                {entry.title} — ⭐ {entry.rating}/10
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Profile;
