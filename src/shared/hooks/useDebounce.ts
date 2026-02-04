import { useState, useEffect } from 'react';

/**
 * Returns a debounced value that updates after `delay` ms of no changes.
 * Use for search/filter inputs to avoid expensive work on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
