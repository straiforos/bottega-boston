import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from 'react';
import { Button, Display, Serif, Logo, SiteHeader, Marquee, WaveRibbon, LinkAction, TextField, Checkbox, PillLabel } from '@/design-system/bottega-f5161c';
import { RestaurantSketch } from '@/components/RestaurantSketch';
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

const orderingUrl = 'https://ciao724.wixstudio.com/my-site/online-ordering';
const dishes = {
  Starters: [['Pork Shumai', 11], ['Chicken Jiaozi', 11], ['Vegetarian Spring Rolls', 9]],
  Noodles: [['Beef Chow Fun', 18], ['Dan Dan Noodles', 18], ['Lo Mein', 18], ['Singapore Noodles', 18], ['Chop Suey', 18], ['Mei Fun', 18], ['Kung Po Noodles', 18], ['Chongqing', 18], ['Beijing Noodles', 18]],
  Drinks: [['Miantiao Ice Tea', 4], ['Peach Black Tea', 4], ['Raspberry Jasmine', 4], ['Strawberry Oolong', 4]],
} satisfies Record<string, [string, number][]>;
type MenuCategory = keyof typeof dishes;

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

function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<MenuCategory>('Starters');
  useEffect(() => {
    if (!menuOpen) return;
    const previouslyFocused = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
      if (event.key === 'Tab') {
        const controls = Array.from(document.querySelectorAll<HTMLElement>('.modal-panel button, .modal-panel a'));
        const first = controls[0]; const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', keydown); if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus(); };
  }, [menuOpen]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { videoRef.current?.pause(); setPlaying(false); }
  }, []);
  const openMenu = (tab: MenuCategory = 'Starters') => { setCategory(tab); setMenuOpen(true); };
  return (
    <>
      <Marquee text="Benvenuti" separator={<RestaurantSketch kind="pasta" small />} variant="cream" />
      <SiteHeader logo={<a href="#" aria-label="Bottega home"><span className="desktop-logo"><Logo variant="lockup-wordmark" size="md" /></span><span className="mobile-logo"><Logo variant="wordmark" size="sm" /></span></a>} action={<div className="header-actions"><nav aria-label="Main navigation" className="navigation"><a href="#about">Our story</a><a href="#menu">Menu</a><a href="#events">Come hang out</a></nav><Button variant="primary" onClick={() => window.location.assign(orderingUrl)}>Order now ↗</Button></div>} />
      <main>
        <section className="hero" aria-label="Welcome to Bottega">
          <img className="hero-photo" src={hero.url} alt="A woman in sunglasses enjoying Bottega fettuccine bolognese" fetchPriority="high" />
          <div className="hero-shade" />
          <div className="hero-copy"><p className="hero-tag">#pastaislife</p><div className="hero-headline"><div className="hero-title"><Display as="h1" size="xl" tone="cream">Buonissima.<br />Semplice.<br />Italian.</Display></div><div className="hero-note"><Serif size="sm" tone="cream">A little Italian.<br />A lot of amore.</Serif><LinkAction href="#menu" tone="cream">Menu</LinkAction></div></div></div>
        </section>
        <Marquee text="Benvenuti" separator={<RestaurantSketch kind="lemon" small />} />
        <section id="about" className="section story bt-surface-dark">
          <div className="section-inner story-grid">
            <div className="arch-video"><video ref={videoRef} src={clubVideo.url} poster={poster.url} autoPlay muted={muted} loop playsInline preload="metadata" aria-label="Making fresh pasta together at Bottega" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} /><div className="video-controls"><Button variant="cream" size="sm" aria-label={playing ? 'Pause video' : 'Play video'} title={playing ? 'Pause video' : 'Play video'} onClick={() => { if (playing) videoRef.current?.pause(); else void videoRef.current?.play(); }}>{playing ? 'Ⅱ' : '▶'}</Button><Button variant="cream" size="sm" aria-label={muted ? 'Turn sound on' : 'Turn sound off'} title={muted ? 'Turn sound on' : 'Turn sound off'} onClick={() => setMuted(!muted)}>{muted ? '♫ ×' : '♫'}</Button></div></div>
            <div><p className="eyebrow">A tavola, with love</p><div className="story-heading"><Display size="xl" tone="mustard">Bottega<br />Pasta Club.</Display></div><Serif size="lg" tone="cream">The place to meet, eat,<br />and celebrate life.</Serif><div className="story-copy"><p>Judgment-free and full of carbs. A haven where joy is served on a plate alongside a slice of bread.</p><p>With a cannolo in hand and an espresso in the other, we cin cin for a place that feels like home.</p></div><LinkAction href="#club" tone="mustard">Come join the club</LinkAction></div>
          </div>
        </section>
        <Marquee text="#pastaislife" separator={<RestaurantSketch small />} />
        <section id="menu" className="section menu-intro"><div className="section-inner"><p className="eyebrow">Made with amore. Served with joy.</p><div className="menu-title"><div className="big-sketch"><RestaurantSketch kind="pot" /></div><Display size="xl" tone="forest">Menu</Display></div><Serif size="md" tone="forest">Something delicious for every part of your day.</Serif><Button variant="primary" onClick={() => openMenu()}>View menu ↗</Button></div></section>
        <MovingRibbon text="#familyislife · #pastaislife" />
        <section className="offerings" aria-label="Discover Bottega">
          <article className="offering offering-coffee bt-surface-light"><div><p className="eyebrow">Caffè, house drinks & dolce</p><Display as="h3" size="lg" tone="forest">Sip. Smile.<br />Repeat.</Display></div><img className="offering-image" src={coffee.url} alt="A Bottega guest holding a cappuccino and iced coffee" loading="lazy" /><div><Serif size="sm">A little pick-me-up, Italian style.</Serif><LinkAction href="mailto:ciao@eatbottega.com?subject=Catering%20menu%20inquiry">Catering menu</LinkAction></div></article>
          <article className="offering offering-food bt-surface-dark"><div><p className="eyebrow">Breakfast. Lunch. Dinner.</p><Display as="h3" size="lg" tone="cream">Every day.<br />Every craving.</Display></div><img className="offering-image" src={pasta.url} alt="A woman holding a plate of Bottega pesto pasta" loading="lazy" /><div><Serif size="sm" tone="cream">And everything in between.</Serif><LinkAction href="#menu" tone="cream" onClick={(event) => { event.preventDefault(); openMenu('Noodles'); }}>Food menu</LinkAction></div></article>
          <article id="market" className="offering offering-market bt-surface-dark"><div><p className="eyebrow">Your little Italian market</p><Display as="h3" size="lg" tone="mustard">Il Mercatino</Display></div><div className="market-art"><RestaurantSketch kind="market" /></div><div><Serif size="lg" tone="cream">A little Bottega.<br />To take home.</Serif><LinkAction href="mailto:ciao@eatbottega.com?subject=Il%20Mercatino%20inquiry" tone="mustard">Explore the market</LinkAction></div></article>
        </section>
        <section id="events" className="section events"><div className="section-inner"><p className="eyebrow">Good food. Better company.</p><div className="events-heading"><Display size="xl" tone="forest">Come hang out<br />with us.</Display></div><div className="event-empty"><RestaurantSketch kind="lemon" /><Serif size="md" tone="forest">No events at the moment.</Serif><p>More good times are on the way. Ci vediamo presto!</p></div></div></section>
        <Marquee text="Pasta is life" separator={<RestaurantSketch small />} />
        <section className="social-section"><div className="social-heading"><Display size="md" tone="forest">Life, the Bottega way.</Display><LinkAction href="https://www.instagram.com/eatbottega/" target="_blank" rel="noreferrer">@eatbottega</LinkAction></div><div className="gallery"><figure className="gallery-item"><video src={socialVideo.url} controls loop muted playsInline preload="metadata" aria-label="A moment at Bottega" /></figure>{[social1, social2, social3].map((asset, i) => <figure className="gallery-item" key={asset.asset_id}><img src={asset.url} loading="lazy" alt={['Enjoying a sweet treat at Bottega', 'A Bottega guest sharing a plate of pasta', 'Coffee and a little work at Bottega'][i]} /><figcaption><PillLabel variant="mustard">{['La dolce vita', '#pastaislife', 'Caffè, always'][i]}</PillLabel></figcaption></figure>)}</div></section>
        <MovingRibbon text="Follow us" />
        <section id="club" className="section club bt-surface-light"><div className="section-inner club-grid"><div className="club-copy"><p className="eyebrow">Carbs. Community. Cin cin.</p><Display size="xl" tone="forest">You belong to<br />the Pasta Club.</Display><Serif size="md" tone="forest">A little more pasta in your inbox.</Serif><p>Be the first to hear about what’s cooking at Bottega.</p><form className="club-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); window.location.href = `mailto:ciao@eatbottega.com?subject=Pasta%20Club%20signup&body=${encodeURIComponent(`Please add me to the Pasta Club email list.\nEmail: ${String(data.get('email'))}`)}`; }}><TextField label="Email address" name="email" type="email" placeholder="Your email address" required /><Checkbox required>I’d like to receive news from Bottega.</Checkbox><div><Button type="submit" variant="primary">Count me in ↗</Button></div></form></div><img className="club-photo" src={pasta.url} alt="Pasta Club is always a good idea" loading="lazy" /></div></section>
      </main>
      <footer id="contact" className="footer bt-surface-dark"><div className="section-inner"><div className="footer-grid"><div><Logo variant="lockup-wordmark" tone="cream" size="md" /><p>Judgment-free.<br />Full of carbs.</p><div className="social-links"><a href="https://www.instagram.com/eatbottega/" target="_blank" rel="noreferrer">Instagram ↗</a></div></div><div><h3>Find us</h3><p><strong>Bottega Fioretina</strong><br />313B Harvard St.<br />Brookline, MA 02446</p><p><strong>Bottega Del Sud</strong><br />645 E 2nd St.<br />Boston, MA 02127</p></div><div><h3>Come on in</h3><p>Monday to Friday<br />7:30 am – 9:00 pm</p><p>Weekends<br />9:30 am – 9:00 pm</p></div><div><h3>Say ciao</h3><a href="mailto:ciao@eatbottega.com">ciao@eatbottega.com</a><p><LinkAction href="mailto:ciao@eatbottega.com" tone="mustard">Contact us</LinkAction></p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Bottega. Made with amore.</span><div className="legal-links">{[['Privacy policy', 'privecy-policy'], ['Accessibility', 'accessibility-statement'], ['Terms & conditions', 'terms-and-conditions'], ['Refund policy', 'refund-policy']].map(([text, path]) => <a href={`https://ciao724.wixstudio.com/my-site/${path}`} key={path}>{text}</a>)}</div></div></div></footer>
      {menuOpen && <div className="modal" onClick={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}><section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="menu-dialog-title"><div className="modal-heading"><Display id="menu-dialog-title" size="md" tone="forest">Bottega Menu</Display><Button ref={closeRef} variant="ghost" size="sm" aria-label="Close menu" onClick={() => setMenuOpen(false)}>✕</Button></div><div className="menu-tabs" role="tablist" aria-label="Menu categories">{(Object.keys(dishes) as MenuCategory[]).map(tab => <Button key={tab} role="tab" aria-selected={category === tab} aria-controls="menu-dishes" variant={category === tab ? 'primary' : 'ghost'} size="sm" onClick={() => setCategory(tab)}>{tab}</Button>)}</div><div id="menu-dishes" role="tabpanel" aria-label={category}>{dishes[category].map(([name, price]) => <div className="dish" key={name}><div><p>{name}</p>{name === 'Mei Fun' && <p className="dish-description">Seared fresh tuna, fresh herbs, and a touch of chili.</p>}</div><strong>${price}</strong></div>)}</div><p><LinkAction href={orderingUrl}>Order online</LinkAction></p></section></div>}
    </>
  );
}
