import { useCallback } from 'react';
import { useUserStore } from '@/entities/user';
import type { User } from '@/shared/types';
import { validatePinFormat } from '../lib/pinValidation';

export interface UseAuthReturn {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const currentUser = useUserStore((s) => s.currentUser);
  const loginAction = useUserStore((s) => s.login);
  const logoutAction = useUserStore((s) => s.logout);

  const login = useCallback(
    async (pin: string) => {
      if (!validatePinFormat(pin)) {
        return { success: false, error: 'PIN must be 4 digits' };
      }
      const user = await loginAction(pin);
      if (user) {
        return { success: true };
      }
      return { success: false, error: 'Invalid PIN' };
    },
    [loginAction]
  );

  const logout = useCallback(() => {
    logoutAction();
  }, [logoutAction]);

  return {
    currentUser,
    isAuthenticated: currentUser !== null,
    login,
    logout,
  };
}
