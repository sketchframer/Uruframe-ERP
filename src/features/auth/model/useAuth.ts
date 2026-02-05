import { useCallback } from 'react';
import { useUserStore } from '@/entities/user';
import type { User } from '@/shared/types';
import { USE_API } from '@/shared/api';
import { loginWithPin, logout as apiLogout } from '../api/authService';
import { validatePinFormat } from '../lib/pinValidation';

export interface UseAuthReturn {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const currentUser = useUserStore((s) => s.currentUser);
  const setCurrentUser = useUserStore((s) => s.setCurrentUser);
  const loginAction = useUserStore((s) => s.login);
  const logoutAction = useUserStore((s) => s.logout);

  const login = useCallback(
    async (pin: string) => {
      if (!validatePinFormat(pin)) {
        return { success: false, error: 'PIN must be 4 digits' };
      }
      if (USE_API) {
        try {
          const response = await loginWithPin(pin);
          setCurrentUser(response.user);
          return { success: true };
        } catch {
          return { success: false, error: 'Invalid PIN' };
        }
      }
      const user = await loginAction(pin);
      if (user) {
        return { success: true };
      }
      return { success: false, error: 'Invalid PIN' };
    },
    [USE_API, loginAction, setCurrentUser]
  );

  const logout = useCallback(() => {
    if (USE_API) {
      apiLogout();
      setCurrentUser(null);
    } else {
      logoutAction();
    }
  }, [USE_API, logoutAction, setCurrentUser]);

  return {
    currentUser,
    isAuthenticated: currentUser !== null,
    login,
    logout,
  };
}
