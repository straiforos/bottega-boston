import { useState, type FormEvent } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button, Checkbox, Display, Serif, TextField } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { ClubPhoto } from '@/components/media/ClubPhoto';
import { clubContent } from '@/content/en/club';
import { useStaffSession } from '@/hooks/useStaffSession';
import { joinClub } from '@/lib/email/club.functions';
import { ClubAdminBar } from '@/features/emails/ClubAdminBar';

export function ClubSection() {
  const join = useServerFn(joinClub);
  const { isAdmin } = useStaffSession();
  const [state, setState] = useState<'idle' | 'busy' | 'joined' | 'already' | 'failed'>('idle');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email'));
    setState('busy');
    try {
      const result = await join({ data: { email, consent: true } });
      setState(result.status);
    } catch {
      setState('failed');
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
      {isAdmin && <ClubAdminBar />}
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
              <Checkbox surface="inverse" required>
                I’d like to receive news from Bottega.
              </Checkbox>
              <div>
                <Button type="submit" variant="cream" disabled={state === 'busy'}>
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
