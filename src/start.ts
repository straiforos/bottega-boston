import { createStart } from '@tanstack/react-start';

export const startInstance = createStart(() => ({
  // Session rides on the HttpOnly cookie; no bearer attachment needed.
}));
