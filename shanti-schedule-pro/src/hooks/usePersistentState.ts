import { useEffect, useRef, useState } from 'react';

/**
 * usePersistentState
 * A lightweight wrapper around useState that syncs value to localStorage as JSON.
 * Safely parses and handles errors. Optional versioning to support migrations.
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: { version?: number; migrate?: (stored: any) => T }
) {
  const { version = 1, migrate } = options || {};
  const versionedKey = `${key}::v${version}`;
  const hasHydrated = useRef(false);
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue; // SSR safety
    try {
      const raw = localStorage.getItem(versionedKey);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      if (migrate) return migrate(parsed);
      return parsed as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return; // skip first render save to preserve stored value
    }
    try {
      localStorage.setItem(versionedKey, JSON.stringify(state));
    } catch (e) {
      // Silently ignore quota or serialization issues
      console.warn('Persist failed for', versionedKey, e);
    }
  }, [state, versionedKey]);

  return [state, setState] as const;
}
