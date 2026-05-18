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
          signInWithEmailAndPassword: authSdk.signInWithEmailAndPassword,
          createUserWithEmailAndPassword: authSdk.createUserWithEmailAndPassword,
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

  const signInWithEmail = async (email, password) => {
    const { auth, signInWithEmailAndPassword } = await loadAuthClient();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email, password) => {
    const { auth, createUserWithEmailAndPassword } = await loadAuthClient();
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOutUser = async () => {
    const { auth, signOut } = await loadAuthClient();
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithEmail, signUpWithEmail, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
