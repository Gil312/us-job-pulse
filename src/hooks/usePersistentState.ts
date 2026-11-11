import { useState, useEffect, useCallback } from 'react';

/**
 * Safely persists state to localStorage with a fallback default when unavailable.
 */
export function usePersistentState<T extends string>(
  storageKey: string,
  defaultValue: T,
  allowedValues?: readonly T[]
): [T, (value: T) => void, () => void] {
  const readStoredValue = (): T => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue;
      }
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) {
        if (!allowedValues || allowedValues.includes(raw as T)) {
          return raw as T;
        }
      }
    } catch {
      // Ignore storage access errors in restricted environments
    }
    return defaultValue;
  };

  const [value, setValue] = useState<T>(readStoredValue);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(storageKey, value);
      }
    } catch {
      // Ignore write failures
    }
  }, [storageKey, value]);

  const resetValue = useCallback(() => {
    setValue(defaultValue);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore removal failures
    }
  }, [storageKey, defaultValue]);

  return [value, setValue, resetValue];
}
