import { create } from 'zustand';
import api from '../config/api';

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'reviewer' | 'author';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profileImage?: string;
  createdAt?: string;
}

interface AuthState {
  token: string | null;
  role: UserRole | null;
  user: UserProfile | null;
  loginLogId: string | null;
  isInitialized: boolean;
  setAuth: (user: UserProfile, token: string, loginLogId?: string) => void;
  updateUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const getSafeUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined') return null;
    return JSON.parse(userStr);
  } catch (err) {
    console.error('Failed to parse user from localStorage', err);
    return null;
  }
};

const initialUser = getSafeUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  role: initialUser?.role || null,
  user: initialUser,
  loginLogId: localStorage.getItem('loginLogId'),
  isInitialized: !localStorage.getItem('token'),

  setAuth: (user, token, loginLogId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (loginLogId) {
      localStorage.setItem('loginLogId', loginLogId);
    } else {
      localStorage.removeItem('loginLogId');
    }
    set({ user, role: user?.role || null, token, loginLogId: loginLogId || null, isInitialized: true });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    const { loginLogId } = get();
    try {
      if (loginLogId) {
        await api.post('/api/auth/logout', { loginLogId });
      }
    } catch (err) {
      console.error('Logout log error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginLogId');
      set({ user: null, role: null, token: null, loginLogId: null, isInitialized: true });
      window.location.href = '/';
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isInitialized: true, user: null, role: null, token: null, loginLogId: null });
      return;
    }

    try {
      const res = await api.get('/api/auth/me');
      if (!res.data || !res.data.user) throw new Error('Invalid user data');
      
      const { user } = res.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, role: user.role, token, isInitialized: true });
    } catch (err) {
      console.error('Auth Check Failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginLogId');
      set({ user: null, role: null, token: null, loginLogId: null, isInitialized: true });
    }
  }
}));
