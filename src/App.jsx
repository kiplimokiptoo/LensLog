import { AuthProvider } from './contexts/AuthContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import Router from './router';

function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <Router />
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
