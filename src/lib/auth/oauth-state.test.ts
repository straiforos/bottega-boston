import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('cloudflare:workers', () => ({
  env: { SESSION_SECRET: 'test-session-secret' },
}));

describe('oauth state', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('round-trips a signed state with matching nonce cookie', async () => {
    const { createOAuthState, verifyOAuthState } = await import('./oauth-state');
    const { state, setCookie } = await createOAuthState('/menu');
    const nonce = setCookie.match(/bottega_oauth=([^;]+)/)?.[1];
    expect(nonce).toBeTruthy();
    const request = new Request('https://bottega.boston/api/auth/callback', {
      headers: { cookie: `bottega_oauth=${nonce}` },
    });
    await expect(verifyOAuthState(state, request)).resolves.toBe('/menu');
  });

  it('rejects forged or cookieless state', async () => {
    const { createOAuthState, verifyOAuthState } = await import('./oauth-state');
    const { state } = await createOAuthState('/admin/events');
    const bare = new Request('https://bottega.boston/api/auth/callback');
    await expect(verifyOAuthState(state, bare)).resolves.toBeNull();
    await expect(verifyOAuthState('not.real', bare)).resolves.toBeNull();
    await expect(verifyOAuthState(null, bare)).resolves.toBeNull();
  });

  it('rejects open-redirect returnTo values', async () => {
    const { createOAuthState, verifyOAuthState } = await import('./oauth-state');
    const { state, setCookie } = await createOAuthState('//evil.example');
    const nonce = setCookie.match(/bottega_oauth=([^;]+)/)?.[1];
    const request = new Request('https://bottega.boston/api/auth/callback', {
      headers: { cookie: `bottega_oauth=${nonce}` },
    });
    await expect(verifyOAuthState(state, request)).resolves.toBe('/');
  });
});
