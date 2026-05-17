import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';

function Layout() {
  const { user, loading, signIn, signOutUser } = useAuth();
  const { watchCount } = useWatchlist();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="header-brand">
            <h1>LensLog</h1>
            <p className="tagline">Movie tracking with Google auth, watchlists, and reviews.</p>
          </div>

          <div className="header-controls">
            <nav>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/search">Search</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/discover">Discover</NavLink>
            </nav>
            <div className="user-actions">
              {loading ? (
                <span>Loading...</span>
              ) : user ? (
                <>
                  <span className="header-count">{watchCount} saved</span>
                  <span className="user-name">{user.displayName || user.email}</span>
                  <button type="button" onClick={signOutUser}>
                    Sign out
                  </button>
                </>
              ) : (
                <button type="button" onClick={signIn}>
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>Built with React, Firebase, and TMDB</p>
      </footer>
    </div>
  );
}

export default Layout;
