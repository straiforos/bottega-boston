import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, LinkAction, Serif } from '@/design-system/bottega-f5161c';
import { announcementsContent } from '@/content/en/announcements';
import {
  DISMISS_STORAGE_KEY,
  dismissKey,
  isDismissed,
} from '@/lib/announcements/announcements-shared';
import { liveAnnouncementQueryOptions } from '@/lib/announcements/announcements-api';

const t = announcementsContent;

/** One dismissible promo card. Never a dialog — the page stays usable underneath. */
export function AnnouncementCard() {
  const { data } = useQuery(liveAnnouncementQueryOptions);
  const [dismissedVisit, setDismissedVisit] = useState(false);
  const [stored, setStored] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setStored(localStorage.getItem(DISMISS_STORAGE_KEY));
    } catch {
      setStored(null);
    }
    setReady(true);
  }, []);

  if (!ready || !data || dismissedVisit || isDismissed(stored, data)) return null;

  const dismiss = () => {
    const key = dismissKey(data.id, data.updatedAt);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, key);
    } catch {
      /* private mode */
    }
    setStored(key);
    setDismissedVisit(true);
  };

  const external = data.href?.startsWith('https://');

  return (
    <Card
      variant="cream"
      elevated
      className="announcement-card"
      role="region"
      aria-label={t.regionLabel}
    >
      <div className="announcement-card__header">
        <Serif as="h2" size="sm" tone="forest" className="announcement-card__title">
          {data.title}
        </Serif>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="announcement-card__close"
          aria-label={t.dismiss}
          onClick={dismiss}
        >
          <span aria-hidden="true">×</span>
        </Button>
      </div>
      {data.imageUrl && (
        <img className="announcement-card__media" src={data.imageUrl} alt="" />
      )}
      {data.body.trim() ? <p className="announcement-card__body">{data.body}</p> : null}
      {data.href && data.linkLabel ? (
        <LinkAction
          className="announcement-card__link"
          href={data.href}
          tone="forest"
          {...(external ? { target: '_blank' as const } : {})}
          onClick={dismiss}
        >
          {data.linkLabel}
        </LinkAction>
      ) : null}
    </Card>
  );
}
