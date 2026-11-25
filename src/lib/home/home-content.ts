import { queryOptions } from '@tanstack/react-query';
import { fetchHomeContent, saveHomeContent as saveHomeContentFn } from './home.functions';

export {
  CARD_SHAPES,
  CARD_VARIANTS,
  cardInk,
  defaultHomeContent,
  isSafeHref,
  lines,
  mergeHomeContent,
  validateCard,
  validateHero,
  validateRibbon,
  validateStory,
  type CardShape,
  type CardVariant,
  type HeroContent,
  type HomeContent,
  type OfferingCard,
  STORY_TONES,
  STORY_TITLE_STYLES,
  type StoryContent,
  type StoryMediaKind,
  type StoryTitleStyle,
  type StoryTone,
} from './home-shared';

export const homeContentQueryOptions = queryOptions({
  queryKey: ['home-content'],
  queryFn: () => fetchHomeContent(),
});

export async function saveHomeContent(key: string, data: object) {
  await saveHomeContentFn({ data: { key, data: data as Record<string, unknown> } });
}
