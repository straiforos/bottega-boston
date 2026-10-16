import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface StaffSession {
  user: User | null;
  isAdmin: boolean;
  ready: boolean;
}

const initial: StaffSession = { user: null, isAdmin: false, ready: false };
const StaffSessionContext = createContext<StaffSession>(initial);

/** Single auth listener for the app; resolves whether the database grants the user admin. */
export function StaffSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StaffSession>(initial);

  useEffect(() => {
    let active = true;
    const resolve = async (user: User | null) => {
      if (!user) {
        if (active) setState({ user: null, isAdmin: false, ready: true });
        return;
      }
      // Retry transient failures so a slow check never looks like "not on the staff list".
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const { data, error } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
        if (!error) {
          if (active) setState({ user, isAdmin: data === true, ready: true });
          return;
        }
        await new Promise((done) => setTimeout(done, 500 * (attempt + 1)));
      }
      // Still unknown: keep the session and stay non-admin rather than signing staff out.
      if (active) setState({ user, isAdmin: false, ready: false });
    };
    supabase.auth.getUser().then(({ data }) => resolve(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      void resolve(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <StaffSessionContext.Provider value={state}>{children}</StaffSessionContext.Provider>;
}

export function useStaffSession() {
  return useContext(StaffSessionContext);
}
