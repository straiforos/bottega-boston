import { useEffect, useState } from 'react';
import { LinkAction } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import { useStaffSession } from '@/hooks/useStaffSession';

/** Quiet footer action: Google sign-in for listed staff, sign-out once signed in. */
export function StaffAccess() {
  const { user, isAdmin, ready } = useStaffSession();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('staff_error');
    if (error === 'not_listed') setNotice(staffContent.notListed);
    if (error === 'failed') setNotice(staffContent.signInFailed);
  }, []);

  useEffect(() => {
    if (ready && user && !isAdmin) setNotice(staffContent.notListed);
  }, [ready, user, isAdmin]);

  const signIn = () => {
    setNotice(null);
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}` || '/';
    window.location.href = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const signOut = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/auth/logout';
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="staff-access" aria-live="polite">
      {user && isAdmin ? (
        <>
          <span>{staffContent.signedInAs(user.email)}</span>
          <LinkAction
            href="#"
            role="button"
            tone="cream"
            onClick={(event) => {
              event.preventDefault();
              signOut();
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
            signIn();
          }}
        >
          {staffContent.signIn}
        </LinkAction>
      )}
      {notice && <span role="status">{notice}</span>}
    </div>
  );
}
