import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function getAuthErrorMessage(error) {
  if (error?.code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (error?.code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (error?.code === 'auth/weak-password') {
    return 'Password should be at least 6 characters.';
  }
  return error?.message || 'Sign up failed. Please try again.';
}

function Signup() {
  const { user, loading, signUpWithEmail, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signUpWithEmail(email, password);
    } catch (error) {
      console.error('Sign-up failed:', error.message);
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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
          <h2>Create Account</h2>
          <p>Sign up to save your watchlist, rate movies, and view your profile.</p>
        </div>

        <form onSubmit={handleSignup} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        {errorMessage && (
          <p className="login-error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="login-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Signup;
