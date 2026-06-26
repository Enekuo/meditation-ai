import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const AuthContext = createContext({
  user: null,
  isAuthLoading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  const signOutUser = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
