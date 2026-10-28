import { useState, type FormEvent } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button, Checkbox, Display, Serif, TextField } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { ClubPhoto } from '@/components/media/ClubPhoto';
import { Turnstile } from '@/features/requests/Turnstile';
import { clubContent } from '@/content/en/club';
import { joinClub } from '@/lib/email/club.functions';

export function ClubSection() {
  const join = useServerFn(joinClub);
  const [state, setState] = useState<'idle' | 'busy' | 'joined' | 'already' | 'failed'>('idle');
  const [captcha, setCaptcha] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email'));
    const website = String(form.get('website') ?? '');
    setState('busy');
    try {
      const result = await join({
        data: { email, consent: true, turnstileToken: captcha || undefined, website: website || undefined },
      });
      setState(result.status);
    } catch {
      setState('failed');
      setCaptcha('');
      setCaptchaKey((k) => k + 1);
    }
  };

  const message =
    state === 'joined'
      ? clubContent.joined
      : state === 'already'
        ? clubContent.already
        : state === 'failed'
          ? clubContent.failed
          : null;

  return (
    <section id="club" className="club bt-surface-dark">
      <div className="club-ribbon">
        <MovingRibbon text="Follow us" />
      </div>
      <div className="club-grid">
        <div className="club-copy">
          <p className="eyebrow">Carbs. Community. Cin cin.</p>
          <Display size="lg" tone="mustard">
            Join the Bottega
            <br />
            Pasta Club.
          </Display>
          <Serif size="sm" tone="cream">
            Good pasta. Good people. Good news.
          </Serif>
          <p>Get early access to events, menu launches, special offers, and everything happening at Bottega.</p>
          {state === 'joined' || state === 'already' ? (
            <p role="status" className="club-status">
              {message}
            </p>
          ) : (
            <form className="club-form" onSubmit={submit}>
              <TextField
                surface="inverse"
                label="Email address"
                name="email"
                type="email"
                placeholder="Your email address"
                required
                error={state === 'failed' ? (message ?? undefined) : undefined}
              />
              <input
                className="club-hp"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <Checkbox surface="inverse" required>
                I’d like to receive news from Bottega.
              </Checkbox>
              <Turnstile key={captchaKey} onToken={setCaptcha} />
              <div>
                <Button type="submit" variant="cream" disabled={state === 'busy' || !captcha}>
                  {state === 'busy' ? clubContent.joining : 'Count me in ↗'}
                </Button>
              </div>
            </form>
          )}
        </div>
        <ClubPhoto />
      </div>
    </section>
  );
}
