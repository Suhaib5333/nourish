import { useState, useEffect, useCallback } from 'react';

export function usePersistedState(key, initial) {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const update = useCallback(
    (valOrFn) => {
      setData((prev) => {
        const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          console.error('Storage error:', e);
        }
        return next;
      });
    },
    [key]
  );

  return [data, update, loaded];
}
