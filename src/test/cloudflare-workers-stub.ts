/** Vitest stub for the Workers runtime env binding. */
export const env = new Proxy(
  {},
  {
    get() {
      throw new Error('cloudflare:workers env is not available in unit tests');
    },
  },
);
