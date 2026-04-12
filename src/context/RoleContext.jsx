import { createContext, useContext, useState, useCallback } from 'react';

const RoleContext = createContext(null);

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => {
    try {
      return localStorage.getItem('nourish-role') || null;
    } catch {
      return null;
    }
  });

  const [pinVerified, setPinVerified] = useState(false);

  const setRole = useCallback((r) => {
    setRoleState(r);
    if (r) {
      localStorage.setItem('nourish-role', r);
    } else {
      localStorage.removeItem('nourish-role');
      setPinVerified(false);
    }
  }, []);

  const verifyPin = useCallback((pin) => {
    const stored = localStorage.getItem('nourish-therapist-pin');
    if (!stored) {
      // First time — set the PIN
      localStorage.setItem('nourish-therapist-pin', pin);
      setPinVerified(true);
      return true;
    }
    if (stored === pin) {
      setPinVerified(true);
      return true;
    }
    return false;
  }, []);

  const switchRole = useCallback(() => {
    setRoleState(null);
    localStorage.removeItem('nourish-role');
    setPinVerified(false);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, switchRole, pinVerified, verifyPin }}>
      {children}
    </RoleContext.Provider>
  );
}
