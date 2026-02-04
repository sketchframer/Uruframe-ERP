import { useState, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export interface UseAsyncOptions {
  onError?: (error: Error) => void;
  retries?: number;
  retryDelay?: number;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { onError, retries = 0, retryDelay = 1000 } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const data = await asyncFn();
        setState({ data, error: null, isLoading: false });
        setRetryCount(0);
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries) {
          await new Promise((r) =>
            setTimeout(r, retryDelay * (attempt + 1))
          );
          attempt++;
        } else {
          break;
        }
      }
    }

    setState({
      data: null,
      error: lastError ?? new Error('Unknown error'),
      isLoading: false,
    });
    setRetryCount(attempt);
    if (lastError) {
      onError?.(lastError);
      throw lastError;
    }
  }, [asyncFn, onError, retries, retryDelay]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
    setRetryCount(0);
  }, []);

  return {
    ...state,
    execute,
    reset,
    retryCount,
  };
}
