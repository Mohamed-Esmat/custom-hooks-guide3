import { useEffect, useState } from "react";

/**
 * Very simple localStorage hook for beginners.
 * Reads once on mount, saves whenever the value changes.
 * Returns a tuple: [value, setValue].
 *
 * @param {string} key localStorage key
 * @param {any} initialValue fallback if nothing stored
 * @returns {[any, Function]}
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
