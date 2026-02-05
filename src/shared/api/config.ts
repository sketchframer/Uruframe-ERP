const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

/** API base URL. Set VITE_API_URL in .env for backend; defaults to local FastAPI. */
export const API_URL = env?.VITE_API_URL ?? 'http://localhost:8000';

/** When true, entities use API repositories instead of localStorage. */
export const USE_API = env?.VITE_USE_API === 'true';

/** Background refetch interval in ms when USE_API is true. Env VITE_REFETCH_INTERVAL_MS overrides. */
const REFETCH_INTERVAL_MS_ENV = env?.VITE_REFETCH_INTERVAL_MS;
export const REFETCH_INTERVAL_MS = REFETCH_INTERVAL_MS_ENV
  ? Number.parseInt(REFETCH_INTERVAL_MS_ENV, 10)
  : 5_000;
