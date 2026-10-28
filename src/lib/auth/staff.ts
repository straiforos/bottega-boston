import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { readSessionCookie, verifySession, type StaffIdentity } from './session';

/** True when the email is on the staff allowlist. */
export async function isStaffEmail(email: string) {
  const row = await db().query.staffAllowlist.findFirst({
    where: eq(schema.staffAllowlist.email, email.toLowerCase()),
  });
  return !!row;
}

export async function staffFromRequest(request: Request): Promise<StaffIdentity | null> {
  const identity = await verifySession(readSessionCookie(request));
  if (!identity) return null;
  if (!(await isStaffEmail(identity.email))) return null;
  return identity;
}
