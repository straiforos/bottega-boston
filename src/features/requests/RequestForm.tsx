import { useId, useState, type FormEvent } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button, Card, Checkbox, Display, Radio, Serif, TextField } from '@/design-system/bottega-f5161c';
import { eventsContent } from '@/content/en/events';
import { orderLocations } from '@/content/links';
import { zonedToUtc } from '@/lib/events/occurrences';
import { requestSchema, type OrderLineInput, type RequestKind } from '@/lib/events/requests';
import { submitRequest } from '@/lib/events/requests.functions';
import { OrderPicker } from './OrderPicker';
import { Turnstile } from './Turnstile';

const t = eventsContent.requests;

/** Guest form for catering orders or event-space bookings. */
export function RequestForm({ kind }: { kind: RequestKind }) {
  const send = useServerFn(submitRequest);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    locationId: 'brookline' as 'brookline' | 'boston',
    when: '',
    guests: '',
    eventType: '',
    fulfillment: (kind === 'catering' ? '' : '') as 'pickup' | 'delivery' | '',
    address: '',
    dietary: '',
    notes: '',
    website: '',
  });
  const [lines, setLines] = useState<OrderLineInput[]>([]);
  const [withCatering, setWithCatering] = useState(kind === 'catering');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [failure, setFailure] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const ids = { dietary: useId(), notes: useId() };
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const [date, time] = form.when.split('T');
    const payload = {
      kind,
      name: form.name,
      email: form.email,
      phone: form.phone,
      locationId: form.locationId,
      requestedFor: date && time ? zonedToUtc(date, time, 'America/New_York').toISOString() : '',
      guests: form.guests ? Number(form.guests) : null,
      eventType: form.eventType,
      fulfillment: withCatering ? form.fulfillment : '',
      address: withCatering && form.fulfillment === 'delivery' ? form.address : '',
      dietary: form.dietary,
      notes: form.notes,
      lines: withCatering ? lines : [],
      website: form.website,
      turnstileToken: captcha,
    };
    const parsed = requestSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      if (withCatering && kind === 'space' && lines.length === 0) next.lines = 'Add at least one tray.';
      setErrors(next);
      return;
    }
    if (withCatering && lines.length === 0) {
      setErrors({ lines: 'Add at least one tray.' });
      return;
    }
    if (!captcha) {
      setErrors({});
      setFailure('Please complete the human check.');
      setStatus('failed');
      return;
    }
    setErrors({});
    setStatus('sending');
    try {
      await send({ data: parsed.data });
      setStatus('sent');
    } catch (e) {
      setFailure(e instanceof Error && e.message.length < 140 ? e.message : t.failed);
      setStatus('failed');
      setCaptcha('');
      setCaptchaKey((k) => k + 1);
    }
  };

  if (status === 'sent') {
    return (
      <Card variant="cream" elevated className="request-thanks" role="status">
        <Display as="h2" size="md" tone="forest">{t.thanksTitle}</Display>
        <p>{t.thanksBody}</p>
      </Card>
    );
  }

  return (
    <form className="request-form" onSubmit={submit} noValidate>
      <div className="request-grid">
        <TextField label={t.name} required autoComplete="name" value={form.name} error={errors.name} onChange={(e) => set({ name: e.target.value })} maxLength={100} />
        <TextField label={t.email} required type="email" autoComplete="email" value={form.email} error={errors.email} onChange={(e) => set({ email: e.target.value })} maxLength={254} />
        <TextField label={t.phone} required type="tel" autoComplete="tel" value={form.phone} error={errors.phone} onChange={(e) => set({ phone: e.target.value })} maxLength={40} />
        <TextField label={t.when} required type="datetime-local" value={form.when} error={errors.requestedFor} onChange={(e) => set({ when: e.target.value })} />
        {kind === 'space' && (
          <>
            <TextField label={t.guests} required type="number" min={1} max={500} value={form.guests} error={errors.guests} onChange={(e) => set({ guests: e.target.value })} />
            <TextField label={t.eventType} hint={t.eventTypeHint} value={form.eventType} onChange={(e) => set({ eventType: e.target.value })} maxLength={100} />
          </>
        )}
      </div>

      <fieldset className="request-choice">
        <legend className="bt-field__label">{t.location}</legend>
        {orderLocations.map((l) => (
          <Radio key={l.id} name={`${kind}-location`} checked={form.locationId === l.id} onChange={() => set({ locationId: l.id })}>
            {`${l.name} · ${l.area}`}
          </Radio>
        ))}
      </fieldset>

      {kind === 'space' && (
        <Checkbox checked={withCatering} onChange={(e) => setWithCatering(e.target.checked)}>
          {t.addCatering}
        </Checkbox>
      )}

      {withCatering && (
        <>
          <OrderPicker lines={lines} onChange={setLines} error={errors.lines} />
          <fieldset className="request-choice">
            <legend className="bt-field__label">{t.fulfillment}</legend>
            <Radio name={`${kind}-fulfillment`} checked={form.fulfillment === 'pickup'} onChange={() => set({ fulfillment: 'pickup' })}>{t.pickup}</Radio>
            <Radio name={`${kind}-fulfillment`} checked={form.fulfillment === 'delivery'} onChange={() => set({ fulfillment: 'delivery' })}>{t.delivery}</Radio>
            {errors.fulfillment && <p className="request-error" role="alert">{errors.fulfillment}</p>}
          </fieldset>
          {form.fulfillment === 'delivery' && (
            <TextField label={t.address} required autoComplete="street-address" value={form.address} error={errors.address} onChange={(e) => set({ address: e.target.value })} maxLength={300} />
          )}
        </>
      )}

      <div className="bt-field">
        <label className="bt-field__label" htmlFor={ids.dietary}>{t.dietary}</label>
        <textarea id={ids.dietary} className="bt-input" rows={2} maxLength={500} value={form.dietary} onChange={(e) => set({ dietary: e.target.value })} />
      </div>
      <div className="bt-field">
        <label className="bt-field__label" htmlFor={ids.notes}>{t.notes}</label>
        <textarea id={ids.notes} className="bt-input" rows={4} maxLength={2000} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
      </div>
      <input className="request-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => set({ website: e.target.value })} name="website" />

      <Turnstile key={captchaKey} onToken={setCaptcha} />
      {status === 'failed' && <Serif as="p" size="sm" tone="tomato" role="alert">{failure}</Serif>}
      <div>
        <Button type="submit" disabled={status === 'sending'}>{status === 'sending' ? t.sending : t.send}</Button>
      </div>
    </form>
  );
}
