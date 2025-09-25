import { useState, useEffect, useCallback } from 'react';

export type UserRole = 'doctor' | 'patient' | null;
const STORAGE_KEY = 'app.userRole';

export function useUserRole(): [UserRole, (r: UserRole) => void] {
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'doctor' || stored === 'patient') setRole(stored);
    } catch { /* ignore */ }
  }, []);

  const update = useCallback((r: UserRole) => {
    setRole(r);
    try {
      if (r) localStorage.setItem(STORAGE_KEY, r); else localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, []);

  return [role, update];
}
