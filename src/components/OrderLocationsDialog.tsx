import { useEffect, useRef } from 'react';
import { Button, Display, LinkAction } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { orderLocations } from '@/content/links';

interface OrderLocationsDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Keyless Google Maps embed centered on the address with a pin. */
export function mapEmbedUrl(address: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
}

/** Lets guests pick which shop to order from before leaving for its ordering page. */
export function OrderLocationsDialog({ open, onClose }: OrderLocationsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const copy = restaurantContent.ordering;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="order-dialog bt-surface-light"
      aria-labelledby="order-dialog-title"
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
            <Display as="h2" size="md" tone="forest" id="order-dialog-title">
              {copy.title}
            </Display>
            <Button size="sm" variant="ghost" onClick={onClose}>
              {copy.close}
            </Button>
          </div>
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
                <LinkAction href={location.orderUrl} tone="forest">
                  {copy.orderFrom} {location.area} ↗
                </LinkAction>
              </article>
            ))}
          </div>
        </div>
      )}
    </dialog>
  );
}
