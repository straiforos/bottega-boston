import { useQuery } from '@tanstack/react-query';
import { Display, LinkAction, PillLabel, Serif } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { StoryVideo } from '@/components/media/StoryVideo';
import { useStaffSession } from '@/hooks/useStaffSession';
import { defaultHomeContent, homeContentQueryOptions } from '@/lib/home/home-content';
import { RibbonEditor, StoryEditor } from '../admin/HomeContentEditors';

export function StorySection() {
  const { data = defaultHomeContent } = useQuery(homeContentQueryOptions);
  const { isAdmin } = useStaffSession();
  const story = data.story;

  return (
    <section id="about" className="section story bt-surface-dark home-editable">
      <div className="story-ribbon home-editable">
        <MovingRibbon text={data.ribbon} />
        {isAdmin && <RibbonEditor text={data.ribbon} />}
      </div>
      <div className="section-inner story-grid">
        {story.mediaKind === 'video' ? (
          <StoryVideo src={story.videoUrl} poster={story.posterUrl} />
        ) : (
          <div className="arch-video story-player">
            <img src={story.imageUrl} alt={story.imageAlt} loading="lazy" decoding="async" />
            <div className="video-caption">
              <PillLabel variant="mustard">About us</PillLabel>
            </div>
          </div>
        )}
        <div>
          <div className="story-heading">
            <Display size="xl" tone="mustard">
              Bottega
              <br />
              Pasta Club.
            </Display>
          </div>
          <Serif size="lg" tone="cream">
            The place to meet, eat,
            <br />
            and celebrate life.
          </Serif>
          <div className="story-copy">
            <p>Judgment-free and full of carbs. A haven where joy is served on a plate alongside a slice of bread.</p>
            <p>With a cannolo in hand and an espresso in the other, we cin cin for a place that feels like home.</p>
          </div>
          <LinkAction href="#club" tone="mustard">
            Come join the club
          </LinkAction>
        </div>
      </div>
      {isAdmin && <StoryEditor story={story} />}
    </section>
  );
}
