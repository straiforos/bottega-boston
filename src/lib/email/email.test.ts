import { describe, expect, it } from 'vitest';
import { chunk, defaultWelcome, moveBlock, validateDraft } from './blocks';
import { renderEmail, renderRichText } from './render-email';

const opts = {
  logoUrl: 'https://x/logo.png',
  siteUrl: 'https://x',
  unsubscribeUrl: 'https://x/u?token=abc',
  locations: [{ name: 'A', lines: ['1 St.'] }],
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
  it('links footer addresses in mustard deep, not the client default blue', () => {
    const html = renderEmail(defaultWelcome, opts);
    expect(html).toContain('href="https://maps.google.com/?q=A%201%20St."');
    expect(html).toContain('style="color:#e8b938;text-decoration:none;"');
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

import { applyVariables, newBlock } from './blocks';
import { toWaypointDocument } from './render-email';
import { eventEffect, verifySvixSignature } from './webhook';

describe('templates and Waypoint documents', () => {
  it('fills {{fields}} and keeps unknown ones', () => {
    const d = applyVariables(
      { subject: 'Hi {{guest_name}}', preheader: '{{x}}', blocks: [{ id: 'a', type: 'text', text: 'For {{guest_count}}' }] },
      { guest_name: 'Ana', guest_count: '12' },
    );
    expect(d.subject).toBe('Hi Ana');
    expect(d.preheader).toBe('{{x}}');
    expect(d.blocks[0]).toMatchObject({ text: 'For 12' });
  });
  it('escapes HTML typed into a fill-in field', () => {
    const d = applyVariables({ subject: 's', preheader: '', blocks: [{ id: 'a', type: 'headline', text: '{{n}}' }] }, { n: '<b>' });
    expect(renderEmail(d, opts)).toContain('&lt;b&gt;');
  });
  it('wraps blocks in the Bottega header and footer', () => {
    const doc = toWaypointDocument(defaultWelcome, opts) as Record<string, { data: { childrenIds?: string[] } }>;
    const ids = doc.root.data.childrenIds!;
    expect(ids[0]).toBe('header');
    expect(ids.at(-1)).toBe('footer');
  });
  it('blocks sending with a placeholder photo', () => {
    expect(validateDraft({ ...defaultWelcome, blocks: [newBlock('columns')] })).toMatch(/picture/);
  });
});

describe('Resend webhook', () => {
  const secret = 'whsec_' + btoa('test-secret-key');
  async function sign(id: string, ts: string, body: string) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('test-secret-key'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${ts}.${body}`));
    return 'v1,' + btoa(String.fromCharCode(...new Uint8Array(mac)));
  }
  it('accepts a correctly signed delivery', async () => {
    const signature = await sign('msg_1', '1000', '{}');
    expect(await verifySvixSignature({ secret, id: 'msg_1', timestamp: '1000', signature, body: '{}', nowSeconds: 1000 })).toBe(true);
  });
  it('rejects a tampered body', async () => {
    const signature = await sign('msg_1', '1000', '{}');
    expect(await verifySvixSignature({ secret, id: 'msg_1', timestamp: '1000', signature, body: '{"x":1}', nowSeconds: 1000 })).toBe(false);
  });
  it('rejects deliveries older than five minutes', async () => {
    const signature = await sign('msg_1', '1000', '{}');
    expect(await verifySvixSignature({ secret, id: 'msg_1', timestamp: '1000', signature, body: '{}', nowSeconds: 1301 })).toBe(false);
  });
  it('marks bounced and spam-reporting addresses', () => {
    expect(eventEffect('email.bounced')?.subscriberStatus).toBe('bounced');
    expect(eventEffect('email.complained')?.subscriberStatus).toBe('complained');
    expect(eventEffect('email.opened')?.subscriberStatus).toBeUndefined();
  });
});

import { describe as d2, expect as e2, it as i2 } from 'vitest';
import { duplicateBlock, insertBlockAt, removeBlock, selectNeighbor, defaultWelcome as dw } from './blocks';
import { renderEmail as re } from './render-email';

d2('canvas helpers', () => {
  const blocks = dw.blocks;
  i2('inserts at an index', () => {
    e2(insertBlockAt(blocks, 1, { id: 'x', type: 'divider' }).map((b) => b.id).slice(0, 3)).toEqual(['w1', 'x', 'w2']);
  });
  i2('removes by id', () => {
    e2(removeBlock(blocks, 'w2').some((b) => b.id === 'w2')).toBe(false);
  });
  i2('duplicates right after with a new id', () => {
    const r = duplicateBlock(blocks, 'w1');
    e2(r.blocks[1]).toMatchObject({ type: 'headline', text: blocks[0].type === 'headline' ? blocks[0].text : '' });
    e2(r.id).not.toBe('w1');
    e2(r.blocks[1].id).toBe(r.id);
  });
  i2('selects neighbours, clamped', () => {
    e2(selectNeighbor(blocks, 'w1', -1)).toBe('w1');
    e2(selectNeighbor(blocks, 'w1', 1)).toBe('w2');
    e2(selectNeighbor(blocks, null, 1)).toBe('w1');
  });
  i2('sent emails never carry editor markup', () => {
    const opts = { logoUrl: 'https://x/l.png', siteUrl: 'https://x', unsubscribeUrl: 'https://x/u', locations: [] };
    e2(re(dw, opts)).not.toMatch(/data-bt-anchor|<script/);
    e2(re(dw, { ...opts, editor: true })).toMatch(/data-bt-anchor="w1"/);
  });
});
