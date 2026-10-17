import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Display, LinkAction, TextField } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { links, orderLocations } from '@/content/links';
import { useStaffSession } from '@/hooks/useStaffSession';
import {
  defaultOrderUrls,
  isValidOrderUrl,
  orderUrlsQueryOptions,
  saveOrderUrls,
  type OrderUrls,
} from '@/lib/home/order-locations';

/** Keyless Google Maps embed centered on the address with a pin. */
export function mapEmbedUrl(address: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
}

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

/** Home-page section listing both shops with a map pin and their ordering link. */
export function LocationsSection() {
  const copy = restaurantContent.ordering;
  const { isAdmin } = useStaffSession();
  const [editing, setEditing] = useState(false);
  const { data: urls = defaultOrderUrls } = useQuery(orderUrlsQueryOptions);

  const structuredData = orderLocations.map((location) => ({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: location.name,
    servesCuisine: 'Italian',
    email: links.email,
    address: { '@type': 'PostalAddress', streetAddress: location.lines[0], addressLocality: location.area },
    potentialAction: { '@type': 'OrderAction', target: urls[location.id] ?? location.orderUrl },
  }));

  return (
    <section id="locations" className="locations-section bt-surface-light" aria-labelledby="locations-title">
      <div className="locations-head">
        <Display as="h2" size="lg" tone="forest" id="locations-title">
          {copy.title}
        </Display>
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
            <iframe
              className="order-location-map"
              title={`${copy.mapLabel} ${location.name}`}
              src={mapEmbedUrl(location.mapQuery)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <Display as="h3" size="sm" tone="forest">
              {location.name}
            </Display>
            <address>
              {location.lines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </address>
            <LinkAction href={urls[location.id] ?? location.orderUrl} tone="forest">
              {copy.orderFrom} {location.area}
            </LinkAction>
          </article>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </section>
  );
}
