import { api } from '@/shared/api/apiClient';
import type { User } from '@/shared/types';

const AUTH_TOKEN_KEY = 'auth_token';

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Login with PIN against backend. Stores JWT in localStorage.
 * Use when VITE_USE_API=true; otherwise use userStore.login(pin).
 */
export async function loginWithPin(pin: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/api/auth/login', { pin });
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  }
  return response;
}

/**
 * Logout: clear token and notify backend.
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout', {});
  } finally {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }
}

/**
 * Fetch current user from backend using stored token.
 * Returns null if not authenticated or token invalid.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await api.get<User>('/api/auth/me');
  } catch {
    return null;
  }
}
