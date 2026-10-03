import { Display, LinkAction, Serif } from '@/design-system/bottega-f5161c';
import { StoryVideo } from '@/components/media/StoryVideo';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { restaurantContent } from '@/content/en/restaurant';
import clubVideo from '@/assets/club-video.asset.json';
import poster from '@/assets/video-poster.asset.json';

export function StorySection() {
  return (
    <section id="about" className="section story bt-surface-dark">
      <div className="story-ribbon">
        <MovingRibbon text={restaurantContent.home.pastaIsLife} />
      </div>
      <div className="section-inner story-grid">
        <StoryVideo src={clubVideo.url} poster={poster.url} />
        <div>
          <p className="eyebrow">A tavola, with love</p>
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
    </section>
  );
}
