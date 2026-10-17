import { describe, expect, it } from 'vitest';
import { cardInk, defaultHomeContent, mergeHomeContent, validateCard, validateHero } from './home-content';

describe('home content', () => {
  it('keeps exactly three cards', () => {
    expect(mergeHomeContent([{ key: 'card-4', data: { title: 'x' } }]).cards).toHaveLength(3);
  });
  it('applies a stored card shape and style', () => {
    const c = mergeHomeContent([{ key: 'card-1', data: { shape: 'arch', variant: 'forest' } }]).cards[0];
    expect([c.shape, c.variant]).toEqual(['arch', 'forest']);
  });
  it('dark surfaces use cream ink, light use forest', () => {
    expect(cardInk('cobalt').text).toBe('cream');
    expect(cardInk('forest').text).toBe('cream');
    expect(cardInk('mustard').text).toBe('forest');
  });
  it('rejects unsafe links', () => {
    expect(validateCard({ ...defaultHomeContent.cards[0], linkHref: 'javascript:alert(1)' })).not.toBeNull();
  });
  it('allows hiding the hero stamp', () => {
    const h = mergeHomeContent([{ key: 'hero', data: { showStamp: false } }]).hero;
    expect(h.showStamp).toBe(false);
    expect(validateHero({ ...h, stamp: '' })).toBeNull();
  });
  it('stores editable ribbon text', () => {
    expect(mergeHomeContent([{ key: 'ribbon', data: { text: 'Ciao' } }]).ribbon).toBe('Ciao');
  });
});
