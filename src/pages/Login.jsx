import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function getSignInErrorMessage(error) {
  if (error?.code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized in Firebase Authentication. Add it under Authentication settings, then try again.';
  }

  if (error?.code === 'auth/popup-blocked') {
    return 'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.';
  }

  if (error?.code === 'auth/popup-closed-by-user') {
    return 'The Google sign-in popup was closed before sign-in finished.';
  }

  return error?.message || 'Google sign-in failed. Please try again.';
}

function Login() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    try {
      await signIn();
    } catch (error) {
      console.error('Sign-in failed:', error.message);
      setErrorMessage(getSignInErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <section className="login-section">
        <div className="login-card">
          <h2>Loading…</h2>
          <p>Checking your session…</p>
        </div>
      </section>
    );
  }

  if (user) {
    return (
      <section className="login-section">
        <div className="login-card">
          <h2>Redirecting…</h2>
          <p>You are already signed in.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="login-section">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome to LensLog</h2>
          <p>Sign in to save your watchlist, rate movies, and view your profile.</p>
        </div>

        <button type="button" onClick={handleGoogleSignIn} className="login-button">
          <span>Sign in with Google</span>
        </button>

        {errorMessage && (
          <p className="login-error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="login-footer">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
