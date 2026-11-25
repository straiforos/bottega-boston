import { Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Display, LinkAction, PillLabel, Serif } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { StoryVideo } from '@/components/media/StoryVideo';
import { useStaffSession } from '@/hooks/useStaffSession';
import { defaultHomeContent, homeContentQueryOptions, lines } from '@/lib/home/home-content';
import { Broken } from './HeroSection';
import { RibbonEditor, StoryEditor } from '../admin/HomeContentEditors';

function StoryBody({ text }: { text: string }) {
  return text
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para, i) => (
      <p key={i}>
        {lines(para).map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </p>
    ));
}

export function StorySection() {
  const { data = defaultHomeContent } = useQuery(homeContentQueryOptions);
  const { isAdmin } = useStaffSession();
  const story = data.story;

  return (
    <section id="about" className="section story bt-surface-dark">
      <div className="story-ribbon home-editable">
        <MovingRibbon text={data.ribbon} />
        {isAdmin && <RibbonEditor text={data.ribbon} />}
      </div>
      <div className="section-inner story-grid">
        <div className="story-media home-editable">
          {story.mediaKind === 'video' ? (
            <StoryVideo src={story.videoUrl} poster={story.posterUrl} label={story.caption} />
          ) : (
            <div className="arch-video story-player">
              <img src={story.imageUrl} alt={story.imageAlt} loading="lazy" decoding="async" />
              {story.caption.trim() ? (
                <div className="video-caption">
                  <PillLabel variant="mustard">{story.caption.trim()}</PillLabel>
                </div>
              ) : null}
            </div>
          )}
          {isAdmin && <StoryEditor story={story} />}
        </div>
        <div className="story-copy-block">
          <div className="story-heading">
            {story.titleStyle === 'serif' ? (
              <Serif as="h2" size="lg" tone={story.titleTone}>
                <Broken text={story.title} />
              </Serif>
            ) : (
              <Display as="h2" size="xl" tone={story.titleTone}>
                <Broken text={story.title} />
              </Display>
            )}
          </div>
          {story.subtitle.trim() ? (
            <Serif size="lg" tone={story.subtitleTone}>
              <Broken text={story.subtitle} />
            </Serif>
          ) : null}
          <div className="story-copy">
            <StoryBody text={story.body} />
          </div>
          {story.linkLabel.trim() ? (
            <LinkAction href={story.linkHref.trim()} tone={story.linkTone}>
              {story.linkLabel.trim()}
            </LinkAction>
          ) : null}
        </div>
      </div>
    </section>
  );
}
