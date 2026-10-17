import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Display, LinkAction, TextField } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { orderLocations } from '@/content/links';
import { useStaffSession } from '@/hooks/useStaffSession';
import {
  defaultOrderUrls,
  isValidOrderUrl,
  orderUrlsQueryOptions,
  saveOrderUrls,
  type OrderUrls,
} from '@/lib/home/order-locations';

interface OrderLocationsDialogProps {
  open: boolean;
  onClose: () => void;
}

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
    <form className="order-dialog-editor" onSubmit={submit}>
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
      <div className="order-dialog-editor-actions">
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

/** Lets guests pick which shop to order from before leaving for its ordering page. */
export function OrderLocationsDialog({ open, onClose }: OrderLocationsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const copy = restaurantContent.ordering;
  const { isAdmin } = useStaffSession();
  const [editing, setEditing] = useState(false);
  const { data: urls = defaultOrderUrls } = useQuery({ ...orderUrlsQueryOptions, enabled: open });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) setEditing(false);
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="order-dialog bt-surface-light"
      aria-label={copy.title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="order-dialog-body">
          <div className="order-dialog-head">
            <Display as="h2" size="md" tone="forest">
              {copy.title}
            </Display>
            <div className="order-dialog-editor-actions">
              {isAdmin && !editing && (
                <Button size="sm" variant="primary" onClick={() => setEditing(true)}>
                  Edit links
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={onClose}>
                {copy.close}
              </Button>
            </div>
          </div>
          {isAdmin && editing && <OrderUrlsEditor urls={urls} onDone={() => setEditing(false)} />}
          <div className="order-dialog-grid">
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
        </div>
      )}
    </dialog>
  );
}
