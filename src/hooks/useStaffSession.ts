import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface StaffSession {
  user: User | null;
  isAdmin: boolean;
  ready: boolean;
}

/** Tracks the signed-in staff member and whether the database grants them admin. */
export function useStaffSession(): StaffSession {
  const [state, setState] = useState<StaffSession>({ user: null, isAdmin: false, ready: false });

  useEffect(() => {
    let active = true;
    const resolve = async (user: User | null) => {
      if (!user) {
        if (active) setState({ user: null, isAdmin: false, ready: true });
        return;
      }
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (active) setState({ user, isAdmin: data === true, ready: true });
    };
    supabase.auth.getUser().then(({ data }) => resolve(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        void resolve(session?.user ?? null);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
