import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface StaffUser {
  email: string;
}

export interface StaffSession {
  user: StaffUser | null;
  isAdmin: boolean;
  ready: boolean;
}

const initial: StaffSession = { user: null, isAdmin: false, ready: false };
const StaffSessionContext = createContext<StaffSession>(initial);

/** Single auth listener for the app; session comes from the Worker cookie. */
export function StaffSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StaffSession>(initial);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (!res.ok) throw new Error('session');
        const data = (await res.json()) as { email: string | null; isAdmin: boolean };
        if (!active) return;
        setState({
          user: data.email ? { email: data.email } : null,
          isAdmin: data.isAdmin === true,
          ready: true,
        });
      } catch {
        if (active) setState({ user: null, isAdmin: false, ready: true });
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  return <StaffSessionContext.Provider value={state}>{children}</StaffSessionContext.Provider>;
}

export function useStaffSession() {
  return useContext(StaffSessionContext);
}
