const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

/** API base URL. Set VITE_API_URL in .env for backend; defaults to local FastAPI. */
export const API_URL = env?.VITE_API_URL ?? 'http://localhost:8000';

/** When true, entities use API repositories instead of localStorage. */
export const USE_API = env?.VITE_USE_API === 'true';
