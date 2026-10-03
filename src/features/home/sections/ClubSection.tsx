import { Button, Checkbox, Display, Serif, TextField } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { links } from '@/content/links';
import pasta from '@/assets/pasta-club.asset.json';

export function ClubSection() {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email'));
    const body = encodeURIComponent(`Please add me to the Pasta Club email list.\nEmail: ${email}`);
    window.location.href = `mailto:${links.email}?subject=Pasta%20Club%20signup&body=${body}`;
  };

  return <section id="club" className="club bt-surface-dark"><div className="club-ribbon"><MovingRibbon text="Follow us" /></div><div className="club-grid"><div className="club-copy"><p className="eyebrow">Carbs. Community. Cin cin.</p><Display size="lg" tone="mustard">Join the Bottega<br />Pasta Club.</Display><Serif size="sm" tone="cream">Good pasta. Good people. Good news.</Serif><p>Get early access to events, menu launches, special offers, and everything happening at Bottega.</p><form className="club-form" onSubmit={submit}><TextField surface="inverse" label="Email address" name="email" type="email" placeholder="Your email address" required /><Checkbox surface="inverse" required>I’d like to receive news from Bottega.</Checkbox><div><Button type="submit" variant="cream">Count me in ↗</Button></div></form></div><img className="club-photo" src={pasta.url} alt="Pasta Club is always a good idea" loading="lazy" /></div></section>;
}