import { useEffect, useId, useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, Checkbox, Display, FileUpload, Radio, TextField } from '@/design-system/bottega-f5161c';
import { eventsContent } from '@/content/en/events';
import { orderLocations } from '@/content/links';
import { BottegaHeader } from '@/components/BottegaHeader';
import { clubContent } from '@/content/en/club';
import { useStaffSession } from '@/hooks/useStaffSession';
import { uploadTileMedia } from '@/lib/gallery/gallery-api';
import { localDate, localTime, zonedToUtc, type Recurrence, type RecurrenceFreq } from '@/lib/events/occurrences';
import {
  EVENT_TZ,
  eventsQueryOptions,
  saveEvent,
  validateEvent,
  type BottegaEvent,
  type EventDraft,
} from '@/lib/events/events-api';
import { EventDates } from './EventDates';

const t = eventsContent.staff;
const f = t.fields;

function toDraft(e: BottegaEvent | null): EventDraft {
  return e
    ? { ...e, ticketUrl: e.ticketUrl ?? '' }
    : {
        title: '',
        description: '',
        locationId: 'brookline',
        imageUrl: null,
        startsAt: '',
        durationMinutes: 120,
        ticketUrl: '',
        published: true,
        recurrence: null,
      };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** End clock time shown for a start like 2026-10-17T18:00 and a length in minutes. */
export function endTimeFor(start: string, durationMinutes: number): string {
  const time = start.split('T')[1];
  if (!time) return '';
  const total = (toMinutes(time) + durationMinutes) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Minutes from the start time to an end clock time; an earlier end means after midnight. */
export function durationUntil(start: string, end: string): number {
  const time = start.split('T')[1];
  if (!time || !end) return 0;
  const diff = toMinutes(end) - toMinutes(time);
  return diff > 0 ? diff : diff + 1440;
}

const toLocalInput = (iso: string) => (iso ? `${localDate(new Date(iso), EVENT_TZ)}T${localTime(new Date(iso), EVENT_TZ)}` : '');

/** Staff page for adding or changing an event, its repeat pattern and single dates. */
export function EventEditorPage({ eventId }: { eventId: string }) {
  const { isAdmin, ready } = useStaffSession();
  const navigate = useNavigate();
  const { data, isPending } = useQuery({ ...eventsQueryOptions, enabled: isAdmin });
  const isNew = eventId === 'new';
  const event = isNew ? null : ((data ?? []).find((e) => e.id === eventId) ?? null);
  const close = () => void navigate({ to: '/admin/events' });

  useEffect(() => {
    if (ready && !isAdmin) void navigate({ to: '/' });
  }, [ready, isAdmin, navigate]);

  return (
    <>
      <BottegaHeader />
      <main className="email-page">
        <div className="email-page-inner event-editor-page">
          <div>
            <Button variant="outline" size="sm" onClick={close}>{t.backToEvents}</Button>
          </div>
          <Display as="h1" size="lg" tone="forest">{isNew ? t.add : t.edit}</Display>
          {!isAdmin || (!isNew && isPending) ? (
            <p>{ready && !isAdmin ? clubContent.editor.staffOnly : '…'}</p>
          ) : !isNew && !event ? (
            <p>{t.notFound}</p>
          ) : (
            <EventForm key={event?.id ?? 'new'} event={event} onClose={close} />
          )}
        </div>
      </main>
    </>
  );
}

function EventForm({ event, onClose }: { event: BottegaEvent | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<EventDraft>(() => toDraft(event));
  const [when, setWhen] = useState(() => toLocalInput(draft.startsAt));
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const descId = useId();
  const rec = draft.recurrence;
  const set = (patch: Partial<EventDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const setRec = (patch: Partial<Recurrence> | null) =>
    set({ recurrence: patch === null ? null : ({ ...(rec ?? { freq: 'weekly', weekdays: [] }), ...patch } as Recurrence) });

  const firstWeekday = () => {
    const [date] = when.split('T');
    return date ? new Date(`${date}T12:00:00Z`).getUTCDay() : 0;
  };

  const chooseFreq = (freq: RecurrenceFreq | 'once') => {
    if (freq === 'once') return setRec(null);
    setRec({ freq, weekdays: rec?.weekdays.length ? rec.weekdays : [firstWeekday()], nth: freq === 'monthly' ? (rec?.nth ?? 1) : undefined });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const [date, time] = when.split('T');
    const next = { ...draft, startsAt: date && time ? zonedToUtc(date, time, EVENT_TZ).toISOString() : '' };
    const problem = validateEvent(next);
    if (problem) return setError(problem);
    setSaving(true);
    setError(null);
    try {
      if (file) {
        const { processMedia } = await import('@/lib/media/process-media');
        const processed = await processMedia(file, () => {});
        next.imageUrl = (await uploadTileMedia(`event-${Date.now()}`, processed)).media_url;
      }
      await saveEvent(event?.id ?? null, next);
      await queryClient.invalidateQueries({ queryKey: eventsQueryOptions.queryKey });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t save the event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="event-editor" onSubmit={submit}>
      <TextField label={f.title} required value={draft.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} />
      <div className="bt-field">
        <label className="bt-field__label" htmlFor={descId}>{f.description}</label>
        <textarea id={descId} className="bt-input" rows={3} maxLength={2000} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
      </div>
      <fieldset className="request-choice">
        <legend className="bt-field__label">{f.location}</legend>
        {orderLocations.map((l) => (
          <Radio key={l.id} name="event-location" checked={draft.locationId === l.id} onChange={() => set({ locationId: l.id })}>
            {l.name}
          </Radio>
        ))}
      </fieldset>
      <div className="request-grid">
        <TextField label={f.start} required type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <TextField
          label={f.end}
          hint={f.endHint}
          required
          type="time"
          value={endTimeFor(when, draft.durationMinutes)}
          onChange={(e) => set({ durationMinutes: durationUntil(when, e.target.value) })}
        />
      </div>

      <fieldset className="request-choice">
        <legend className="bt-field__label">{f.repeat}</legend>
        {(['once', 'weekly', 'biweekly', 'monthly'] as const).map((freq) => (
          <Radio key={freq} name="event-repeat" checked={(rec?.freq ?? 'once') === freq} onChange={() => chooseFreq(freq)}>
            {f[freq]}
          </Radio>
        ))}
      </fieldset>
      {rec && rec.freq !== 'monthly' && (
        <fieldset className="event-weekdays">
          <legend className="bt-field__label">{f.days}</legend>
          {t.weekdays.map((name, day) => (
            <Checkbox
              key={name}
              checked={rec.weekdays.includes(day)}
              onChange={(e) =>
                setRec({ weekdays: e.target.checked ? [...rec.weekdays, day].sort() : rec.weekdays.filter((d) => d !== day) })
              }
            >
              {name}
            </Checkbox>
          ))}
        </fieldset>
      )}
      {rec?.freq === 'monthly' && (
        <div className="request-grid">
          <fieldset className="request-choice">
            <legend className="bt-field__label">{f.nth}</legend>
            {[1, 2, 3, 4, -1].map((n) => (
              <Radio key={n} name="event-nth" checked={(rec.nth ?? 1) === n} onChange={() => setRec({ nth: n })}>
                {f.nthOptions[n]}
              </Radio>
            ))}
          </fieldset>
          <fieldset className="request-choice">
            <legend className="bt-field__label">{f.days}</legend>
            {t.weekdays.map((name, day) => (
              <Radio key={name} name="event-month-day" checked={rec.weekdays[0] === day} onChange={() => setRec({ weekdays: [day] })}>
                {name}
              </Radio>
            ))}
          </fieldset>
        </div>
      )}
      {rec && (
        <TextField label={f.until} type="date" value={rec.until ?? ''} onChange={(e) => setRec({ until: e.target.value || null })} />
      )}

      <TextField label={f.tickets} hint={f.ticketsHint} type="url" value={draft.ticketUrl} onChange={(e) => set({ ticketUrl: e.target.value })} />
      {draft.imageUrl && !file && (
        <div className="event-editor-photo">
          <img className="event-editor-photo-preview" src={draft.imageUrl} alt={draft.title} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={saving}
            aria-label={f.removePhoto}
            title={f.removePhoto}
            onClick={() => set({ imageUrl: null })}
          >
            <svg className="editor-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Button>
        </div>
      )}
      <FileUpload label={f.photo} browseLabel={f.browse} accept="image/*" multiple={false} size="sm" files={file ? [file] : []} onFilesChange={(files: File[]) => setFile(files[0] ?? null)} />
      <Checkbox checked={draft.published} onChange={(e) => set({ published: e.target.checked })}>
        {f.published}
      </Checkbox>

      {event && event.recurrence && <EventDates event={event} />}

      {error && <p className="request-error" role="alert">{error}</p>}
      <div className="event-editor-actions">
        <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>{t.cancel}</Button>
        <Button type="submit" disabled={saving}>{saving ? t.saving : t.save}</Button>
      </div>
    </form>
  );
}
