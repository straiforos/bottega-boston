import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { staffFromRequest } from '@/lib/auth/staff';

/** Requires a valid staff session cookie (email on staff_allowlist). */
export const requireStaffSession = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const request = getRequest();
  const staff = await staffFromRequest(request);
  if (!staff) throw new Error('Unauthorized');
  return next({
    context: {
      staffEmail: staff.email,
    },
  });
});
