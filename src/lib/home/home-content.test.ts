import { describe, expect, it } from 'vitest';
import { cardInk, defaultHomeContent, mergeHomeContent, validateCard, validateHero } from './home-shared';

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
  it('merges story media kind, copy and tones', () => {
    const story = mergeHomeContent([
      {
        key: 'story',
        data: {
          mediaKind: 'image',
          videoUrl: defaultHomeContent.story.videoUrl,
          posterUrl: defaultHomeContent.story.posterUrl,
          imageUrl: '/media/story.jpg',
          imageAlt: 'Our dining room',
          caption: 'About us',
          title: 'Ciao\nBottega.',
          titleStyle: 'serif',
          titleTone: 'cream',
          subtitle: 'Come sit with us.',
          subtitleTone: 'mustard',
          body: 'First paragraph.\n\nSecond.',
          linkLabel: 'Join',
          linkHref: '#club',
          linkTone: 'cream',
        },
      },
    ]).story;
    expect(story.mediaKind).toBe('image');
    expect(story.imageUrl).toBe('/media/story.jpg');
    expect(story.caption).toBe('About us');
    expect(story.titleStyle).toBe('serif');
    expect(story.titleTone).toBe('cream');
    expect(story.linkLabel).toBe('Join');
  });
  it('fills missing story copy from defaults', () => {
    const story = mergeHomeContent([
      {
        key: 'story',
        data: {
          mediaKind: 'video',
          videoUrl: defaultHomeContent.story.videoUrl,
          posterUrl: defaultHomeContent.story.posterUrl,
          imageUrl: defaultHomeContent.story.imageUrl,
          imageAlt: defaultHomeContent.story.imageAlt,
          caption: '',
        },
      },
    ]).story;
    expect(story.title).toBe(defaultHomeContent.story.title);
    expect(story.body).toContain('Judgment-free');
  });
});
