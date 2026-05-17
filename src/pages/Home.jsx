import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useNavigate } from 'react-router-dom';
import WatchlistPanel from '../components/WatchlistPanel';

function Home() {
  const { user, loading } = useAuth();
  const { watchCount } = useWatchlist();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="home-shell">
      <div className="home-hero">
        <div>
          <h2>Welcome to LensLog</h2>
          <p>Discover movies, save your watchlist, and rate the films you love.</p>
        </div>

        {!loading && user && (
          <div className="home-stats">
            <div>
              <span>Watch Count</span>
              <strong>{watchCount}</strong>
            </div>
            <p>{watchCount === 1 ? 'movie saved' : 'movies saved'} to watch next.</p>
          </div>
        )}

        {!loading && !user && (
          <div className="home-cta">
            <p>Sign in to save your watchlist, rate movies, and view your profile.</p>
            <button type="button" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        )}
      </div>

      {!loading && user && <WatchlistPanel />}
    </div>
  );
}

export default Home;
