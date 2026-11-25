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
  // Home page reads via loader + cache subscription; skip mount/focus refetches
  // that replace the tree and flash bundled About/offerings defaults.
  staleTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
});

export async function saveHomeContent(key: string, data: object) {
  await saveHomeContentFn({ data: { key, data: data as Record<string, unknown> } });
}
