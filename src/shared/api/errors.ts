import { ApiError } from './apiClient';

/**
 * Check if error is a network failure (e.g. offline, CORS).
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError && error.message === 'Failed to fetch'
  );
}

/**
 * Check if error is 401 Unauthorized.
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/**
 * Check if error is 404 Not Found.
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/**
 * Check if error is 422 Validation Error.
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 422;
}

/**
 * Check if error is 5xx server error.
 */
export function isServerError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 500;
}

/**
 * Return a user-facing message for any error.
 */
export function getErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Error de conexión. Verifica tu internet.';
  }
  if (isAuthError(error)) {
    return 'Sesión expirada. Por favor, inicia sesión de nuevo.';
  }
  if (isServerError(error)) {
    return 'Error del servidor. Intenta más tarde.';
  }
  if (error instanceof ApiError) {
    const data = error.data as { message?: string; detail?: string } | undefined;
    const msg = data?.message ?? data?.detail;
    return typeof msg === 'string' ? msg : error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado';
}
