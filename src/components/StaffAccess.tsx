import { useEffect, useState } from 'react';
import { LinkAction } from '@/design-system/bottega-f5161c';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { staffContent } from '@/content/en/staff';
import { useStaffSession } from '@/hooks/useStaffSession';

/** Quiet footer action: Google sign-in for listed staff, sign-out once signed in. */
export function StaffAccess() {
  const { user, isAdmin, ready } = useStaffSession();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    if (params.get('error_description')) setNotice(staffContent.notListed);
  }, []);

  useEffect(() => {
    if (ready && user && !isAdmin) {
      setNotice(staffContent.notListed);
      void supabase.auth.signOut();
    }
  }, [ready, user, isAdmin]);

  const signIn = async () => {
    setNotice(null);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}${window.location.pathname}`,
    });
    if (result.error) {
      setNotice(/staff list/i.test(result.error.message) ? staffContent.notListed : staffContent.signInFailed);
    }
  };

  return (
    <div className="staff-access" aria-live="polite">
      {user && isAdmin ? (
        <>
          <span>{staffContent.signedInAs(user.email ?? '')}</span>
          <LinkAction
            href="#"
            role="button"
            tone="cream"
            onClick={(event) => {
              event.preventDefault();
              void supabase.auth.signOut();
            }}
          >
            {staffContent.signOut}
          </LinkAction>
        </>
      ) : (
        <LinkAction
          href="#"
          role="button"
          tone="cream"
          onClick={(event) => {
            event.preventDefault();
            void signIn();
          }}
        >
          {staffContent.signIn}
        </LinkAction>
      )}
      {notice && <span role="status">{notice}</span>}
    </div>
  );
}
