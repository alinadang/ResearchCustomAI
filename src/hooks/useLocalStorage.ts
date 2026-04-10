import { useState } from 'react';

/**
 * A drop-in replacement for useState that automatically persists the value
 * to localStorage under the given key. On mount, it hydrates from storage if
 * a value exists, otherwise it falls back to initialValue.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.error('[useLocalStorage] Failed to write key:', key, err);
      }
      return valueToStore;
    });
  };

  return [storedValue, setValue];
}
