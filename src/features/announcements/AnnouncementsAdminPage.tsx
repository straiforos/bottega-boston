import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, Card, Confirmation, Display, PillLabel, Serif } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { announcementsContent } from '@/content/en/announcements';
import { clubContent } from '@/content/en/club';
import { useStaffSession } from '@/hooks/useStaffSession';
import {
  announcementsQueryOptions,
  deleteAnnouncement,
  type Announcement,
} from '@/lib/announcements/announcements-api';
import { localDate, localTime } from '@/lib/events/occurrences';
import { ANNOUNCEMENT_TZ } from '@/lib/announcements/announcements-shared';

const t = announcementsContent.staff;

function statusFor(a: Announcement, now: Date): 'live' | 'scheduled' | 'ended' | 'hidden' {
  if (!a.published) return 'hidden';
  const instant = now.toISOString();
  if (instant < a.startsAt) return 'scheduled';
  if (instant > a.endsAt) return 'ended';
  return 'live';
}

function formatWindow(a: Announcement) {
  const start = new Date(a.startsAt);
  const end = new Date(a.endsAt);
  return `${localDate(start, ANNOUNCEMENT_TZ)} ${localTime(start, ANNOUNCEMENT_TZ)} → ${localDate(end, ANNOUNCEMENT_TZ)} ${localTime(end, ANNOUNCEMENT_TZ)}`;
}

/** Staff list of every announcement, including hidden and past ones. */
export function AnnouncementsAdminPage() {
  const { isAdmin, ready } = useStaffSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({ ...announcementsQueryOptions, enabled: isAdmin });
  const [removing, setRemoving] = useState<Announcement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = new Date();

  useEffect(() => {
    if (ready && !isAdmin) void navigate({ to: '/' });
  }, [ready, isAdmin, navigate]);

  const confirmDelete = async () => {
    if (!removing) return;
    setBusy(true);
    try {
      await deleteAnnouncement(removing.id);
      await queryClient.invalidateQueries({ queryKey: announcementsQueryOptions.queryKey });
      await queryClient.invalidateQueries({ queryKey: ['announcements', 'live'] });
      setRemoving(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <BottegaHeader />
      <main className="email-page">
        <div className="email-page-inner">
          <Display as="h1" size="lg" tone="forest">
            {t.title}
          </Display>
          {!isAdmin ? (
            <p>{ready ? clubContent.editor.staffOnly : '…'}</p>
          ) : (
            <>
              <div>
                <Button
                  onClick={() =>
                    void navigate({
                      to: '/admin/announcements/$announcementId',
                      params: { announcementId: 'new' },
                    })
                  }
                >
                  {t.add}
                </Button>
              </div>
              {error && (
                <p className="request-error" role="alert">
                  {error}
                </p>
              )}
              {(data ?? []).length === 0 && <p>{t.noItems}</p>}
              <div className="admin-list">
                {(data ?? []).map((item) => {
                  const status = statusFor(item, now);
                  return (
                    <Card key={item.id} variant="white" className="admin-row bt-surface-light">
                      <div>
                        <Serif as="h2" size="sm" tone="forest">
                          {item.title}
                        </Serif>
                        <p className="request-muted">{formatWindow(item)}</p>
                      </div>
                      <div className="admin-row-actions">
                        {status === 'hidden' && <PillLabel variant="chip-forest">{t.hidden}</PillLabel>}
                        {status === 'live' && <PillLabel variant="chip-forest">{t.live}</PillLabel>}
                        {status === 'scheduled' && <PillLabel variant="chip-forest">{t.scheduled}</PillLabel>}
                        {status === 'ended' && <PillLabel variant="chip-forest">{t.ended}</PillLabel>}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void navigate({
                              to: '/admin/announcements/$announcementId',
                              params: { announcementId: item.id },
                            })
                          }
                        >
                          {t.edit}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setRemoving(item)}>
                          {t.delete}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <Confirmation
                open={removing !== null}
                variant="danger"
                title={t.confirmDeleteTitle}
                confirmLabel={t.delete}
                cancelLabel={t.cancel}
                pending={busy}
                onCancel={() => setRemoving(null)}
                onConfirm={confirmDelete}
              >
                {removing ? t.confirmDeleteBody(removing.title) : ''}
              </Confirmation>
            </>
          )}
        </div>
      </main>
    </>
  );
}
