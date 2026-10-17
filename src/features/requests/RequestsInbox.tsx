import { useCallback, useEffect, useId, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button, Card, Display, PillLabel, Radio, Serif } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { eventsContent } from '@/content/en/events';
import { clubContent } from '@/content/en/club';
import { orderLocations } from '@/content/links';
import { useStaffSession } from '@/hooks/useStaffSession';
import { listRequests, updateRequest } from '@/lib/events/requests.functions';
import { describeLines, formatMoney, orderTotal, REQUEST_STATUSES, type RequestStatus } from '@/lib/events/requests';

const t = eventsContent.inbox;
const r = eventsContent.requests;
type Row = Awaited<ReturnType<typeof listRequests>>[number];

/** Staff inbox for catering and event-space requests. */
export function RequestsInbox() {
  const { isAdmin, ready } = useStaffSession();
  const navigate = useNavigate();
  const load = useServerFn(listRequests);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [kind, setKind] = useState<'all' | 'catering' | 'space'>('all');
  const [status, setStatus] = useState<'all' | RequestStatus>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(() => void load().then(setRows).catch((e: Error) => setError(e.message)), [load]);

  useEffect(() => {
    if (ready && !isAdmin) void navigate({ to: '/' });
    if (isAdmin) refresh();
  }, [ready, isAdmin, navigate, refresh]);

  const shown = (rows ?? []).filter((x) => (kind === 'all' || x.kind === kind) && (status === 'all' || x.status === status));

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
              <div className="inbox-filters">
                <fieldset className="request-choice">
                  <legend className="bt-field__label">Type</legend>
                  {(['all', 'catering', 'space'] as const).map((k) => (
                    <Radio key={k} name="inbox-kind" checked={kind === k} onChange={() => setKind(k)}>{t[k]}</Radio>
                  ))}
                </fieldset>
                <fieldset className="request-choice">
                  <legend className="bt-field__label">Status</legend>
                  <Radio name="inbox-status" checked={status === 'all'} onChange={() => setStatus('all')}>{t.all}</Radio>
                  {REQUEST_STATUSES.map((s) => (
                    <Radio key={s} name="inbox-status" checked={status === s} onChange={() => setStatus(s)}>{t.status[s]}</Radio>
                  ))}
                </fieldset>
              </div>
              {error && <p className="request-error" role="alert">{error}</p>}
              {rows && shown.length === 0 && <p>{t.empty}</p>}
              <div className="admin-list">
                {shown.map((row) =>
                  open === row.id ? (
                    <RequestDetail key={row.id} row={row} onClose={() => setOpen(null)} onSaved={refresh} />
                  ) : (
                    <Card key={row.id} variant="white" className="admin-row bt-surface-light">
                      <div>
                        <Serif as="h2" size="sm" tone="forest">{`${row.name} · ${row.kind === 'catering' ? t.catering : t.space}`}</Serif>
                        <p className="request-muted">
                          {new Date(row.requested_for).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })}
                          {row.guests ? ` · ${row.guests} guests` : ''}
                        </p>
                      </div>
                      <div className="admin-row-actions">
                        <PillLabel variant={row.status === 'new' ? 'terracotta' : 'chip-forest'}>{t.status[row.status]}</PillLabel>
                        <Button size="sm" variant="outline" onClick={() => setOpen(row.id)}>Open</Button>
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function RequestDetail({ row, onClose, onSaved }: { row: Row; onClose: () => void; onSaved: () => void }) {
  const save = useServerFn(updateRequest);
  const [status, setStatus] = useState(row.status as RequestStatus);
  const [notes, setNotes] = useState(row.staff_notes);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const notesId = useId();
  const location = orderLocations.find((l) => l.id === row.location_id);
  const lines = row.order_lines;

  const submit = async () => {
    setState('saving');
    try {
      await save({ data: { id: row.id, status, staffNotes: notes } });
      setState('saved');
      onSaved();
    } catch {
      setState('failed');
    }
  };

  const facts: [string, string][] = [
    [r.email, row.email],
    [r.phone, row.phone],
    [r.when, new Date(row.requested_for).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })],
    [r.location, location?.name ?? row.location_id],
    [r.guests, row.guests ? String(row.guests) : ''],
    [r.eventType, row.event_type],
    [r.fulfillment, row.fulfillment ? `${row.fulfillment}${row.address ? ` — ${row.address}` : ''}` : ''],
    [r.dietary, row.dietary],
    [r.notes, row.notes],
    [t.received, new Date(row.created_at).toLocaleString()],
  ];

  return (
    <Card variant="cream" elevated className="request-detail bt-surface-light">
      <Serif as="h2" size="md" tone="forest">{`${row.name} · ${row.kind === 'catering' ? t.catering : t.space}`}</Serif>
      <dl className="request-facts">
        {facts.filter(([, v]) => v).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {lines.length > 0 && (
        <div>
          <p className="bt-field__label">{r.order}</p>
          <pre className="request-lines">{describeLines(lines)}</pre>
          <p>{r.total(formatMoney(orderTotal(lines)))}</p>
        </div>
      )}
      <fieldset className="request-choice">
        <legend className="bt-field__label">Status</legend>
        {REQUEST_STATUSES.map((s) => (
          <Radio key={s} name={`status-${row.id}`} checked={status === s} onChange={() => setStatus(s)}>{t.status[s]}</Radio>
        ))}
      </fieldset>
      <div className="bt-field">
        <label className="bt-field__label" htmlFor={notesId}>{t.staffNotes}</label>
        <textarea id={notesId} className="bt-input" rows={3} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {state === 'saved' && <p role="status">{t.saved}</p>}
      {state === 'failed' && <p className="request-error" role="alert">{eventsContent.requests.failed}</p>}
      <div className="event-editor-actions">
        <Button variant="ghost" onClick={onClose}>{t.back}</Button>
        <Button variant="outline" href={`mailto:${row.email}?subject=${encodeURIComponent('Your Bottega request')}`}>{t.reply}</Button>
        <Button onClick={submit} disabled={state === 'saving'}>{t.save}</Button>
      </div>
    </Card>
  );
}
