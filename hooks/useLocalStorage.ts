'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * A `useState`-like hook that persists its value to `localStorage` and keeps it
 * in sync across browser tabs. SSR-safe: it reads from storage only on the
 * client after hydration.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read the persisted value once on mount (client only).
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // Ignore read/parse errors and keep the initial value.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Storage may be unavailable (private mode, quota) — fail silently.
        }
        return next;
      });
    },
    [key]
  );

  // Sync changes made in other tabs.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [storedValue, setValue];
}
