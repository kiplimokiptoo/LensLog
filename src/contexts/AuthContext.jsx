import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

let authClientPromise;

async function loadAuthClient() {
  if (!authClientPromise) {
    authClientPromise = Promise.all([import('../firebase'), import('firebase/auth')]).then(
      ([firebase, authSdk]) => {
        if (!firebase.auth || !firebase.provider) {
          throw new Error(
            'Firebase authentication is not configured. Check your VITE_FIREBASE_* settings.'
          );
        }

        return {
          auth: firebase.auth,
          provider: firebase.provider,
          onAuthStateChanged: authSdk.onAuthStateChanged,
          signInWithPopup: authSdk.signInWithPopup,
          signOut: authSdk.signOut,
        };
      }
    );
  }

  return authClientPromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    let unsubscribe = null;

    loadAuthClient()
      .then(({ auth, onAuthStateChanged }) => {
        if (!isCurrent) return;

        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.warn(error.message);
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async () => {
    const { auth, provider, signInWithPopup } = await loadAuthClient();
    await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    const { auth, signOut } = await loadAuthClient();
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
