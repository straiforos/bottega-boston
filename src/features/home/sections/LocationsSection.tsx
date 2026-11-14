import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BottegaMap, BottegaMapCard, Button, Display, Serif, TextField } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { orderLocations } from '@/content/links';
import { useStaffSession } from '@/hooks/useStaffSession';
import { defaultHomeContent, homeContentQueryOptions } from '@/lib/home/home-content';
import {
  defaultOrderUrls,
  isValidOrderUrl,
  orderUrlsQueryOptions,
  saveOrderUrls,
  type OrderUrls,
} from '@/lib/home/order-locations';
import { buildRestaurantJsonLd } from '@/lib/seo/restaurant-json-ld';

/** Staff-only form to change each shop's ordering link. */
function OrderUrlsEditor({ urls, onDone }: { urls: OrderUrls; onDone: () => void }) {
  const [draft, setDraft] = useState(urls);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (Object.values(draft).some((u) => !isValidOrderUrl(u))) {
      return setError('Ordering links must be full web addresses starting with https://');
    }
    setSaving(true);
    setError(null);
    try {
      await saveOrderUrls(Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, v.trim()])));
      await queryClient.invalidateQueries({ queryKey: orderUrlsQueryOptions.queryKey });
      onDone();
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="locations-editor" onSubmit={submit}>
      {orderLocations.map((location) => (
        <TextField
          key={location.id}
          label={`${location.area} ordering link`}
          type="url"
          value={draft[location.id] ?? ''}
          disabled={saving}
          error={error && !isValidOrderUrl(draft[location.id] ?? '') ? error : undefined}
          onChange={(event) => setDraft({ ...draft, [location.id]: event.target.value })}
        />
      ))}
      <div className="locations-actions">
        <Button type="submit" variant="primary" size="sm" disabled={saving}>
          {saving ? 'Saving…' : 'Save links'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

type LocationsSectionProps = {
  /** Override the section heading (defaults to “Our locations”). */
  title?: string;
  lead?: string;
  headingAs?: 'h1' | 'h2';
};

/** Section listing both shops with a map pin and their ordering link. */
export function LocationsSection({ title, lead, headingAs = 'h2' }: LocationsSectionProps = {}) {
  const copy = restaurantContent.ordering;
  const { isAdmin } = useStaffSession();
  const [editing, setEditing] = useState(false);
  const { data: urls = defaultOrderUrls } = useQuery(orderUrlsQueryOptions);
  const { data: homeContent } = useQuery(homeContentQueryOptions);
  const heroImageUrl = homeContent?.hero.imageUrl ?? defaultHomeContent.hero.imageUrl;

  const structuredData = buildRestaurantJsonLd(urls, heroImageUrl);

  return (
    <section id="locations" className="locations-section bt-surface-light" aria-labelledby="locations-title">
      <div className="locations-head">
        <div className="locations-head-copy">
          <Display as={headingAs} size="lg" tone="forest" id="locations-title">
            {title ?? copy.title}
          </Display>
          {lead ? <Serif tone="ink">{lead}</Serif> : null}
        </div>
        {isAdmin && !editing && (
          <Button size="sm" variant="primary" onClick={() => setEditing(true)}>
            Edit links
          </Button>
        )}
      </div>
      {isAdmin && editing && <OrderUrlsEditor urls={urls} onDone={() => setEditing(false)} />}
      <div className="locations-grid">
        {orderLocations.map((location) => (
          <article key={location.id} className="order-location">
            <BottegaMap
              label={`${copy.mapLabel} ${location.name}`}
              center={location.coordinates}
              markers={[{ ...location.coordinates, title: location.name }]}
              size="lg"
              theme="dark"
            >
              <BottegaMapCard
                variant="cream"
                title={location.name}
                address={location.lines.join(', ')}
                orderHref={urls[location.id] ?? location.orderUrl}
                orderLabel={copy.orderNow}
              />
            </BottegaMap>
          </article>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </section>
  );
}
