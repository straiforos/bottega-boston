import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button, Card, Confirmation, Display, PillLabel, Serif } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { eventsContent } from '@/content/en/events';
import { clubContent } from '@/content/en/club';
import { useStaffSession } from '@/hooks/useStaffSession';
import { saveCampaign } from '@/lib/email/club.functions';
import { deleteEvent, eventsQueryOptions, type BottegaEvent } from '@/lib/events/events-api';
import { buildEventNewsletter } from '@/lib/events/event-newsletter';
import { describeRecurrence, upcomingOccurrences } from '@/lib/events/occurrences';
import { EventEditor } from './EventEditor';
import { formatWhen } from './EventCard';

const t = eventsContent.staff;

/** Staff list of every event, including hidden and past ones. */
export function EventsAdminPage() {
  const { isAdmin, ready } = useStaffSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({ ...eventsQueryOptions, enabled: isAdmin });
  const [editing, setEditing] = useState<BottegaEvent | null | undefined>(undefined);
  const [removing, setRemoving] = useState<BottegaEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = useServerFn(saveCampaign);

  useEffect(() => {
    if (ready && !isAdmin) void navigate({ to: '/' });
  }, [ready, isAdmin, navigate]);

  const emailClub = async (event: BottegaEvent) => {
    setBusy(true);
    setError(null);
    try {
      const next = upcomingOccurrences(event, event.exceptions, new Date(), 4);
      const draft = buildEventNewsletter(event, next.map((o) => formatWhen(o.startsAt, event.timezone)), describeRecurrence(event.recurrence));
      const { id } = await save({ data: { draft } });
      void navigate({ to: '/emails/compose', search: { id } });
    } catch {
      setError(t.emailFailed);
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    setBusy(true);
    try {
      await deleteEvent(removing.id);
      await queryClient.invalidateQueries({ queryKey: eventsQueryOptions.queryKey });
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
          <Display as="h1" size="lg" tone="forest">{t.title}</Display>
          {!isAdmin ? (
            <p>{ready ? clubContent.editor.staffOnly : '…'}</p>
          ) : (
            <>
              <div>
                <Button onClick={() => setEditing(null)}>{t.add}</Button>
              </div>
              {error && <p className="request-error" role="alert">{error}</p>}
              {(data ?? []).length === 0 && <p>{t.noEvents}</p>}
              <div className="admin-list">
                {(data ?? []).map((event) => {
                  const next = upcomingOccurrences(event, event.exceptions, new Date(), 1)[0];
                  return (
                    <Card key={event.id} variant="white" className="admin-row bt-surface-light">
                      <div>
                        <Serif as="h2" size="sm" tone="forest">{event.title}</Serif>
                        <p className="request-muted">
                          {describeRecurrence(event.recurrence) ?? ''}
                          {next ? ` ${formatWhen(next.startsAt, event.timezone)}` : ' —'}
                        </p>
                      </div>
                      <div className="admin-row-actions">
                        {!event.published && <PillLabel variant="chip-forest">{t.hidden}</PillLabel>}
                        <Button size="sm" variant="outline" onClick={() => setEditing(event)}>{eventsContent.staff.edit}</Button>
                        <Button size="sm" variant="outline" disabled={busy || !next} onClick={() => emailClub(event)}>{t.emailClub}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setRemoving(event)}>{t.delete}</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <EventEditor open={editing !== undefined} event={editing ?? null} onClose={() => setEditing(undefined)} />
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
