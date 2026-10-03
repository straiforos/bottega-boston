import { createFileRoute, createLink } from '@tanstack/react-router';
import { useState } from 'react';
import { Button, Card, Display, LinkAction, Logo, Marquee, PillLabel, Serif, SiteHeader, TextField } from '@/design-system/bottega-f5161c';
import { menuSections } from '@/lib/menu-data';
import { menuImages } from '@/lib/menu-images';

export const Route = createFileRoute('/menu')({
  head: () => ({ meta: [
    { title: 'Bottega Menu — Pasta, Panini, Dolci & Catering' },
    { name: 'description', content: 'Explore Bottega Fiorentina’s full menu: coffee, breakfast, antipasti, salads, panini, customizable pasta, Italian sweets and catering trays, with prices and dietary labels.' },
    { property: 'og:title', content: 'Bottega Menu — Pasta, Panini, Dolci & Catering' },
    { property: 'og:description', content: 'Find your next Bottega favorite. Browse the complete Italian menu and catering selection with illustrative dish images.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: MenuPage,
});

const PageLink = createLink(LinkAction);

function MenuPage() {
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState('all');
  const term = query.trim().toLowerCase();
  const sections = menuSections.map(section => ({ ...section, items: section.items.filter(item =>
    (!term || `${section.name} ${section.note} ${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(term)) &&
    (selection === 'all' || selection === section.id || (selection === 'catering' && section.name.startsWith('Catering')))
  ) })).filter(section => section.items.length > 0);
  const count = sections.reduce((total, section) => total + section.items.length, 0);

  return <>
    <SiteHeader variant="forest" logo={<PageLink to="/" tone="cream" aria-label="Bottega home"><Logo variant="wordmark" size="sm" tone="cream" /></PageLink>} action={<div className="menu-header-actions"><PageLink to="/" tone="cream">Home</PageLink><Button variant="accent" onClick={() => window.location.assign('https://ciao724.wixstudio.com/my-site/online-ordering')}>Order now ↗</Button></div>} />
    <main className="real-menu">
      <header className="menu-page-heading section-inner">
        <p className="eyebrow">Buon appetito</p>
        <Display as="h1" size="xl" tone="forest">Bottega menu</Display>
        <Serif as="p" size="md" tone="forest">Pasta, panini & a little dolce vita.</Serif>
        <p className="menu-photo-note">Illustrative images — not photographs of Bottega’s actual dishes. Presentation and portions may vary.</p>
        <div className="menu-legend"><PillLabel variant="chip-forest">GF · Gluten free</PillLabel><PillLabel variant="chip-forest">V · Vegetarian</PillLabel><PillLabel variant="chip-forest">VG · Vegan</PillLabel></div>
      </header>
      <Marquee text="#pastaislife · #familyislife" variant="forest" />
      <div className="menu-browse section-inner">
        <aside className="menu-filter" aria-label="Browse menu">
          <TextField label="Search the menu" type="search" placeholder="Pasta, cappuccino, cannoli…" value={query} onChange={event => setQuery(event.target.value)} />
          <nav className="menu-category-list" aria-label="Menu categories">
            <Button variant={selection === 'all' ? 'primary' : 'ghost'} size="sm" aria-pressed={selection === 'all'} onClick={() => setSelection('all')}>All dishes</Button>
            {menuSections.filter(section => !section.name.startsWith('Catering')).map(section => <Button key={section.id} variant={selection === section.id ? 'primary' : 'ghost'} size="sm" aria-pressed={selection === section.id} onClick={() => setSelection(section.id)}>{section.name.split(' (')[0]}</Button>)}
            <Button variant={selection === 'catering' ? 'primary' : 'ghost'} size="sm" aria-pressed={selection === 'catering'} onClick={() => setSelection('catering')}>Catering</Button>
          </nav>
          <p className="menu-results" role="status">{count} {count === 1 ? 'item' : 'items'}</p>
        </aside>
        <div className="menu-content">
          {sections.map(section => <section key={section.id} id={section.id} className="menu-category-section" aria-labelledby={`${section.id}-title`}>
            <div className="menu-category-heading"><Display as="h2" size="sm" tone="forest" id={`${section.id}-title`}>{section.name}</Display>{section.note && <p>{section.note}</p>}</div>
            <div className="menu-dish-grid">{section.items.map(item => <article key={item.id} className="menu-dish-item">
              <img src={menuImages[item.id]} alt={`Illustrative ${item.name}`} loading="lazy" width={480} height={480} />
              <Card variant="cream" shape="rect">
                <div className="menu-dish-heading"><Serif as="h3" size="sm" tone="forest">{item.name}</Serif>{item.price && <strong className="menu-item-price">{item.price}</strong>}</div>
                {item.tags.length > 0 && <div className="menu-dietary-tags">{item.tags.map(tag => <PillLabel key={tag} variant="chip-forest">{tag}</PillLabel>)}</div>}
                {item.description && <div className="menu-item-description">{item.description.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}
              </Card>
            </article>)}</div>
          </section>)}
          {count === 0 && <div className="menu-no-results"><Serif size="md" tone="forest">No dishes found.</Serif><Button variant="outline" onClick={() => { setQuery(''); setSelection('all'); }}>Clear filters</Button></div>}
        </div>
      </div>
    </main>
    <Marquee text="Made with amore" />
    <footer className="footer bt-surface-dark"><div className="section-inner menu-page-footer"><div><Logo variant="wordmark" tone="cream" size="sm" /><p>313B Harvard St. · Brookline, MA 02446<br />645 E 2nd St. · South Boston, MA 02127</p></div><div><LinkAction href="tel:+16172322661" tone="mustard">(617) 232-2661</LinkAction><p><LinkAction href="mailto:ciao@eatbottega.com" tone="cream">ciao@eatbottega.com</LinkAction></p><PageLink to="/" tone="cream">Back to Bottega</PageLink></div></div></footer>
  </>;
}