import { useEffect, useState } from 'react';
import { createLink } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button, LinkAction, PillLabel } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { clubContent } from '@/content/en/club';
import { exportSubscribers, getClubOverview } from '@/lib/email/club.functions';

const EditorLink = createLink(LinkAction);

/** Staff-only strip in the Pasta Club section: count, editor pages and CSV export. */
export function ClubAdminBar() {
  const loadOverview = useServerFn(getClubOverview);
  const exportList = useServerFn(exportSubscribers);
  const [count, setCount] = useState<number | null>(null);
  const t = clubContent.admin;

  useEffect(() => {
    void loadOverview()
      .then((o) => setCount(o.subscribers))
      .catch(() => undefined);
  }, [loadOverview]);

  const download = async () => {
    const csv = await exportList();
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pasta-club.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="club-admin">
      <MovingRibbon text={t.ribbon} variant="tomato" />
      <div className="club-admin-actions">
        {count !== null && <PillLabel variant="mustard">{t.subscribers(count)}</PillLabel>}
        <EditorLink to="/emails/compose" tone="mustard">
          {t.compose}
        </EditorLink>
        <EditorLink to="/emails/welcome" tone="mustard">
          {t.welcome}
        </EditorLink>
        <Button size="sm" variant="cream" onClick={() => void download()}>
          {t.download}
        </Button>
      </div>
    </div>
  );
}
