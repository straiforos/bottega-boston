import { createFileRoute, createLink } from "@tanstack/react-router";
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Stamp, Display, Serif, Logo, Marquee, WaveRibbon, LinkAction, TextField, Checkbox, PillLabel } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { RestaurantSketch } from '@/components/RestaurantSketch';
import mercatino from '@/assets/mercatino.jpg.asset.json';
import hero from '@/assets/hero.asset.json';
import coffee from '@/assets/coffee.asset.json';
import pasta from '@/assets/pasta-club.asset.json';
import poster from '@/assets/video-poster.asset.json';
import clubVideo from '@/assets/club-video.asset.json';
import socialVideo from '@/assets/social-video.asset.json';
import social1 from '@/assets/social-1.asset.json';
import social2 from '@/assets/social-2.asset.json';
import social3 from '@/assets/social-3.asset.json';

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Bottega — Buonissima. Semplice. Italian.' },
    { name: 'description', content: 'Welcome to Bottega Pasta Club. Meet, eat, and celebrate life with pasta, coffee, and a little Italian joy in Brookline and Boston.' },
    { property: 'og:title', content: 'Bottega — Buonissima. Semplice. Italian.' },
    { property: 'og:description', content: 'Judgment-free and full of carbs. Discover Bottega’s menu, Pasta Club, and Italian market.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

const MenuLink = createLink(LinkAction);

function MovingRibbon({ text }: { text: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { if (preference.matches) ref.current?.pauseAnimations(); else ref.current?.unpauseAnimations(); };
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return <WaveRibbon ref={ref} text={text} separator="✦" />;
}

function GalleryVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const togglePlayback = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  };
  const startOnHover = () => {
    if (ref.current?.paused) void ref.current.play().catch(() => setPlaying(false));
  };
  const stopOnLeave = () => ref.current?.pause();
  return (
    <div className="gallery-player" onMouseEnter={startOnHover} onMouseLeave={stopOnLeave} onFocus={startOnHover} onBlur={stopOnLeave}>
      <video ref={ref} src={src} loop muted playsInline preload="metadata" aria-label="A moment at Bottega" onClick={togglePlayback} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <div className="gallery-play-control" data-playing={playing ? 'true' : 'false'}><Button variant="cream" size="md" aria-label={playing ? 'Pause video' : 'Play video'} title={playing ? 'Pause video' : 'Play video'} onClick={togglePlayback}><svg className="gallery-play-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">{playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 3v18l15-9z" />}</svg></Button></div>
    </div>
  );
}


function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const offeringsRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  };
  useEffect(() => {
    const container = offeringsRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!container || preference.matches || !('IntersectionObserver' in window)) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.offering'));
    const travel = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bt-space-xl')) || 2;
    let frame = 0;
    const track = container.closest<HTMLElement>('.offerings-track');
    const desktop = window.matchMedia('(min-width: 768px)');
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      if (track && desktop.matches) {
        // Section is pinned; scroll through the tall track drives each card in turn.
        const rect = track.getBoundingClientRect();
        const distance = Math.max(1, rect.height - viewport);
        const overall = Math.max(0, Math.min(1, -rect.top / distance));
        cards.forEach((card, index) => {
          const raw = Math.max(0, Math.min(1, (overall - index * 0.27) / 0.3));
          const p = ease(raw);
          card.style.opacity = Math.min(1, raw * 1.6).toFixed(3);
          card.style.transform = `translateY(${((1 - p) * viewport * 0.75).toFixed(1)}px) rotate(${((1 - p) * (index % 2 ? -6 : 6)).toFixed(2)}deg)`;
        });
        return;
      }
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        let progress = (viewport - rect.top - index * viewport * 0.08) / (viewport * 0.35);
        progress = Math.max(0, Math.min(1, progress));
        card.style.opacity = progress.toFixed(3);
        card.style.transform = `translateY(${((1 - progress) * travel).toFixed(3)}rem)`;
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    const stop = () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
      cards.forEach((card) => { card.style.opacity = ''; card.style.transform = ''; });
    };
    preference.addEventListener('change', stop);
    return () => { preference.removeEventListener('change', stop); stop(); };
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    const sync = () => setPlaying(!video?.paused);
    const timer = window.setTimeout(sync, 300);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { video?.pause(); setPlaying(false); }
    return () => { window.clearTimeout(timer); };
  }, []);
  return (
    <>
      <Marquee text="Benvenuti" separator={<RestaurantSketch kind="pasta" small />} variant="cream" />
      <BottegaHeader />
      <main>
        <section className="hero" aria-label="Welcome to Bottega">
          <img className="hero-photo" src={hero.url} alt="A woman in sunglasses enjoying Bottega fettuccine bolognese" fetchPriority="high" />
          <div className="hero-copy bt-surface-light"><div className="hero-headline"><div className="hero-stamp"><span className="desktop-logo"><Stamp size="md" variant="light">Buona<br />Semplice<br />Italian.</Stamp></span><span className="mobile-logo"><Stamp size="sm" variant="light">Buona<br />Semplice<br />Italian.</Stamp></span></div><Display as="h1" size="xl" tone="forest" className="hero-hashtag">#PASTAISLIFE</Display></div></div>
        </section>
        <Marquee text="Benvenuti" separator={<RestaurantSketch kind="lemon" small />} />
        <section id="about" className="section story bt-surface-dark">
          <div className="section-inner story-grid">
            <div className="story-player"><div className="arch-video">
              <video ref={videoRef} src={clubVideo.url} poster={poster.url} muted={muted} autoPlay loop playsInline preload="metadata" aria-label="Making fresh pasta together at Bottega" onClick={togglePlayback} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
              <div className="video-play-control" data-playing={playing ? 'true' : 'false'}><Button variant="cream" size="lg" aria-label={playing ? 'Pause video' : 'Play video'} title={playing ? 'Pause video' : 'Play video'} onClick={togglePlayback}><svg className="video-play-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">{playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 3v18l15-9z" />}</svg></Button></div>
              <div className="video-sound-control"><Button variant="cream" size="sm" aria-pressed={!muted} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} title={muted ? 'Turn sound on' : 'Turn sound off'} onClick={() => setMuted(!muted)}><svg className="video-sound-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" />{muted ? <path d="m16 9 5 6m0-6-5 6" /> : <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></>}</svg></Button></div>
              <div className="video-caption"><PillLabel variant="mustard">About us</PillLabel></div>
            </div></div>
            <div><p className="eyebrow">A tavola, with love</p><div className="story-heading"><Display size="xl" tone="mustard">Bottega<br />Pasta Club.</Display></div><Serif size="lg" tone="cream">The place to meet, eat,<br />and celebrate life.</Serif><div className="story-copy"><p>Judgment-free and full of carbs. A haven where joy is served on a plate alongside a slice of bread.</p><p>With a cannolo in hand and an espresso in the other, we cin cin for a place that feels like home.</p></div><LinkAction href="#club" tone="mustard">Come join the club</LinkAction></div>
          </div>
        </section>
        <Marquee text="#pastaislife" separator={<RestaurantSketch small />} />
        <section id="menu" className="section menu-intro"><div className="section-inner"><p className="eyebrow">Made with amore. Served with joy.</p><div className="menu-title"><div className="big-sketch"><RestaurantSketch kind="pot" /></div><Display size="xl" tone="forest">Menu</Display></div><Serif size="md" tone="forest">Something delicious for every part of your day.</Serif><MenuLink to="/menu">View menu</MenuLink></div></section>
        <MovingRibbon text="#familyislife · #pastaislife" />
        <div className="offerings-track"><section className="offerings-section bt-surface-dark" aria-label="Discover Bottega"><div ref={offeringsRef} className="section-inner offerings">
          <article className="offering offering-coffee"><Card variant="cream" shape="rect"><div><Display as="h3" size="sm" tone="forest">Coffee + house drinks</Display><Serif size="lg" tone="forest">& dolci</Serif></div><img className="offering-image" src={coffee.url} alt="A Bottega guest holding a cappuccino and iced coffee" loading="lazy" /><MenuLink to="/menu" hash="category-8">Catering menu</MenuLink></Card><div className="catering-stamp"><Stamp size="sm">Catering<br />menu</Stamp></div></article>
          <article className="offering offering-food"><Card variant="mustard" shape="arch"><img className="offering-image" src={pasta.url} alt="A woman holding a plate of Bottega pesto pasta" loading="lazy" /><Display as="h3" size="md" tone="forest">The food</Display><Serif size="sm" tone="forest">Breakfast, lunch, dinner<br />& everything in between.</Serif><MenuLink to="/menu">Food menu</MenuLink></Card></article>
          <article id="market" className="offering offering-market"><Card variant="cobalt" shape="rect"><Serif as="h3" size="lg" tone="cream">Il Mercatino</Serif><PillLabel variant="mustard">The little market</PillLabel><img className="offering-image" src={mercatino.url} alt="Inside Il Mercatino at Bottega — shelves of pasta, pantry goods and totes" loading="lazy" /><Serif size="sm" tone="cream">A little Bottega.<br />To take home.</Serif><LinkAction href="mailto:ciao@eatbottega.com?subject=Il%20Mercatino%20inquiry" tone="mustard">Explore the market</LinkAction></Card></article>
        </div>
        </section></div>
        <section id="events" className="section events"><div className="section-inner"><p className="eyebrow">Good food. Better company.</p><div className="events-heading"><Display size="xl" tone="forest">Come hang out<br />with us.</Display></div><div className="event-empty"><RestaurantSketch kind="lemon" /><Serif size="md" tone="forest">No events at the moment.</Serif><p>More good times are on the way. Ci vediamo presto!</p></div></div></section>
        <Marquee text="Pasta is life" separator={<RestaurantSketch small />} />
        <section className="social-section"><div className="social-heading"><Display size="md" tone="forest">Life, the Bottega way.</Display><LinkAction href="https://www.instagram.com/eatbottega/" target="_blank" rel="noreferrer">@eatbottega</LinkAction></div><div className="gallery"><figure className="gallery-item"><GalleryVideo src={socialVideo.url} /></figure>{[social1, social2, social3].map((asset, i) => <figure className="gallery-item" key={asset.asset_id}><img src={asset.url} loading="lazy" alt={['Enjoying a sweet treat at Bottega', 'A Bottega guest sharing a plate of pasta', 'Coffee and a little work at Bottega'][i]} /><figcaption><PillLabel variant="mustard">{['La dolce vita', '#pastaislife', 'Caffè, always'][i]}</PillLabel></figcaption></figure>)}</div></section>
        <section id="club" className="club bt-surface-dark"><div className="club-ribbon"><MovingRibbon text="Follow us" /></div><div className="club-grid"><div className="club-copy"><p className="eyebrow">Carbs. Community. Cin cin.</p><Display size="lg" tone="mustard">Join the Bottega<br />Pasta Club.</Display><Serif size="sm" tone="cream">Good pasta. Good people. Good news.</Serif><p>Get early access to events, menu launches, special offers, and everything happening at Bottega.</p><form className="club-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); window.location.href = `mailto:ciao@eatbottega.com?subject=Pasta%20Club%20signup&body=${encodeURIComponent(`Please add me to the Pasta Club email list.\nEmail: ${String(data.get('email'))}`)}`; }}><TextField surface="inverse" label="Email address" name="email" type="email" placeholder="Your email address" required /><Checkbox surface="inverse" required>I’d like to receive news from Bottega.</Checkbox><div><Button type="submit" variant="cream">Count me in ↗</Button></div></form></div><img className="club-photo" src={pasta.url} alt="Pasta Club is always a good idea" loading="lazy" /></div></section>
      </main>
      <footer id="contact" className="footer bt-surface-dark"><div className="section-inner"><div className="footer-grid"><div><Logo variant="lockup-wordmark" tone="cream" size="md" /><p>Judgment-free.<br />Full of carbs.</p><address className="social-links"><a href="https://www.instagram.com/eatbottega/" target="_blank" rel="noreferrer">Instagram ↗</a></address></div><div><Display as="h3" size="sm">Find us</Display><address><strong>Bottega Fioretina</strong><br />313B Harvard St.<br />Brookline, MA 02446</address><address><strong>Bottega Del Sud</strong><br />645 E 2nd St.<br />Boston, MA 02127</address></div><div><Display as="h3" size="sm">Come on in</Display><p>Monday to Friday<br />7:30 am – 9:00 pm</p><p>Weekends<br />9:30 am – 9:00 pm</p></div><div><Display as="h3" size="sm">Say ciao</Display><address><a href="mailto:ciao@eatbottega.com">ciao@eatbottega.com</a><p><LinkAction href="mailto:ciao@eatbottega.com" tone="mustard">Contact us</LinkAction></p></address></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Bottega. Made with amore.</span><div className="legal-links">{[['Privacy policy', 'privecy-policy'], ['Accessibility', 'accessibility-statement'], ['Terms & conditions', 'terms-and-conditions'], ['Refund policy', 'refund-policy']].map(([text, path]) => <a href={`https://ciao724.wixstudio.com/my-site/${path}`} key={path}>{text}</a>)}</div></div></div></footer>

    </>
  );
}
