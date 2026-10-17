import { describe, expect, it } from 'vitest';
import { chunk, defaultWelcome, moveBlock, validateDraft } from './blocks';
import { renderEmail, renderRichText } from './render-email';

const opts = {
  logoUrl: 'https://x/logo.png',
  siteUrl: 'https://x',
  unsubscribeUrl: 'https://x/u?token=abc',
  address: 'A',
};

describe('email rendering', () => {
  it('escapes HTML typed by staff', () => {
    expect(renderRichText('<script>x</script>')).toBe('&lt;script&gt;x&lt;/script&gt;');
  });
  it('drops javascript: links but keeps the label', () => {
    expect(renderRichText('[hi](javascript:alert(1))')).not.toContain('href');
  });
  it('turns **bold** and https links into HTML', () => {
    const html = renderRichText('**Ciao** [menu](https://eatbottega.com)');
    expect(html).toContain('<strong>Ciao</strong>');
    expect(html).toContain('href="https://eatbottega.com"');
  });
  it('always includes the unsubscribe link', () => {
    expect(renderEmail(defaultWelcome, opts)).toContain('https://x/u?token=abc');
  });
});

describe('email drafts', () => {
  it('requires a subject', () => {
    expect(validateDraft({ ...defaultWelcome, subject: ' ' })).toBe('Add a subject line.');
  });
  it('rejects buttons without an https link', () => {
    const draft = { ...defaultWelcome, blocks: [{ id: 'b', type: 'button' as const, label: 'Go', url: 'ftp://x' }] };
    expect(validateDraft(draft)).toMatch(/link/);
  });
  it('moves a block down one place', () => {
    expect(
      moveBlock(defaultWelcome.blocks, 'w1', 1)
        .map((b) => b.id)
        .slice(0, 2),
    ).toEqual(['w2', 'w1']);
  });
  it('sends in batches of at most 100', () => {
    expect(chunk(Array.from({ length: 250 }), 100).map((g) => g.length)).toEqual([100, 100, 50]);
  });
});
