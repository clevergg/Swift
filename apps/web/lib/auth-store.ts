'use client';

import type { AuthResponse } from '@swift/types';
import { create } from 'zustand';

import { api, ApiException, configureAuth } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;

  isAuthenticated: () => boolean;

  login: (data: AuthResponse) => void;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  status: 'idle',

  isAuthenticated: () => get().status === 'authenticated',

  login: (data) => {
    set({
      user: { ...data.user, avatarUrl: null },
      accessToken: data.accessToken,
      status: 'authenticated',
    });
  },

  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', undefined, { skipAuth: true });
    } catch {
      // Локальный разлогин в любом случае.
    }
    set({ user: null, accessToken: null, status: 'unauthenticated' });
  },

  initialize: async () => {
    if (get().status !== 'idle') {
      return;
    }
    set({ status: 'loading' });

    try {
      const { accessToken } = await api.post<{ accessToken: string }>(
        '/auth/refresh',
        undefined,
        { skipAuth: true },
      );
      set({ accessToken });
      const user = await api.get<AuthUser>('/auth/me');
      set({ user, status: 'authenticated' });
    } catch (e) {
      if (e instanceof ApiException || e instanceof Error) {
        set({ user: null, accessToken: null, status: 'unauthenticated' });
      } else {
        set({ status: 'unauthenticated' });
      }
    }
  },
}));

configureAuth({
  getAccessToken: () => useAuth.getState().accessToken,
  setAccessToken: (token) => useAuth.getState().setAccessToken(token),
  onAuthFailure: () => {
    useAuth.setState({ user: null, accessToken: null, status: 'unauthenticated' });
  },
});
