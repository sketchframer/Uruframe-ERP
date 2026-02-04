import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { useUserStore } from '@/entities/user';

vi.mock('@/entities/user', () => ({
  useUserStore: vi.fn(),
}));

describe('useAuth', () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserStore).mockImplementation((selector: (s: any) => any) => {
      const state = {
        currentUser: null,
        login: mockLogin,
        logout: mockLogout,
      };
      return selector(state);
    });
  });

  it('returns isAuthenticated false when no user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });

  it('login calls store login with PIN', async () => {
    mockLogin.mockResolvedValue({ id: 'U-01', name: 'Test User' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const response = await result.current.login('1234');
      expect(response.success).toBe(true);
    });

    expect(mockLogin).toHaveBeenCalledWith('1234');
  });

  it('login returns error for invalid PIN format', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const response = await result.current.login('12');
      expect(response.success).toBe(false);
      expect(response.error).toBe('PIN must be 4 digits');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('login returns error when store returns null', async () => {
    mockLogin.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const response = await result.current.login('9999');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid PIN');
    });

    expect(mockLogin).toHaveBeenCalledWith('9999');
  });
});
