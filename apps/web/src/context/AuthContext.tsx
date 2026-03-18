'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase-auth';
import { api } from '@/lib/api';
import type { AuthUser } from '@/types/auth.types';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  appUser: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phone: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithBackend = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const token = await fbUser.getIdToken();
      const res = await api.post<{ data: AuthUser }>('/auth/login', {
        displayName: fbUser.displayName,
        email: fbUser.email,
        phoneNumber: fbUser.phoneNumber,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppUser(res.data);
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncUserWithBackend(fbUser);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [syncUserWithBackend]);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(firebaseAuth, provider);
    // onAuthStateChanged will handle the rest
  }, []);

  const signInWithPhone = useCallback(
    async (phone: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
      const recaptchaVerifier = new RecaptchaVerifier(
        firebaseAuth,
        recaptchaContainerId,
        { size: 'invisible' },
      );
      return signInWithPhoneNumber(firebaseAuth, phone, recaptchaVerifier);
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(firebaseAuth);
    setAppUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, signInWithGoogle, signInWithPhone, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
