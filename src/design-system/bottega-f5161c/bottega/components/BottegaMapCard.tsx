import { forwardRef, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { Button } from "./Button";
import { Card } from "./Card";
import { LinkAction } from "./LinkAction";

export interface BottegaMapCardProps extends Omit<React.ComponentPropsWithoutRef<typeof Card>, "title"> {
  /** Location name, rendered as a serif heading. */
  title: ReactNode;
  /** Heading level for the title. */
  headingLevel?: "h2" | "h3" | "h4";
  /** Small uppercase eyebrow above the title, e.g. "Visit us". */
  eyebrow?: ReactNode;
  /** Street address. */
  address?: ReactNode;
  /** Opening hours line. */
  hours?: ReactNode;
  /** Order URL (e.g. ChowNow); renders the card's primary CTA when set. */
  orderHref?: string;
  /** Label for the order CTA. */
  orderLabel?: string;
  /** Directions URL; renders a secondary "Get directions" link when set. */
  directionsHref?: string;
  /** Label for the directions link. */
  directionsLabel?: string;
  /** Card colorway (Card variants). */
  variant?: "cream" | "forest" | "mustard";
  /** Extra content (phone, notes, actions) below the details. */
  children?: ReactNode;
}

/** Inset location card for BottegaMap: the order button is the CTA, with address, hours and directions beneath. Built on the Card component. */
export const BottegaMapCard = forwardRef<HTMLDivElement, BottegaMapCardProps>(function BottegaMapCard(
  { title, headingLevel = "h3", eyebrow, address, hours, orderHref, orderLabel = "Order now", directionsHref, directionsLabel = "Get directions", variant = "cream", children, className, ...props },
  ref,
) {
  const H = headingLevel;
  return (
    <Card
      ref={ref}
      variant={variant}
      elevated
      className={cx("bt-map-card", className)}
      {...props}
    >
      {eyebrow && <p className="bt-map-card__eyebrow">{eyebrow}</p>}
      <H className="bt-map-card__title">{title}</H>
      {(address || hours) && (
        <dl className="bt-map-card__details">
          {address && <div><dt>Address</dt><dd>{address}</dd></div>}
          {hours && <div><dt>Hours</dt><dd>{hours}</dd></div>}
        </dl>
      )}
      {children}
      {orderHref && (
        <Button className="bt-map-card__order" variant="primary" size="sm" width="full" href={orderHref} target="_blank" aria-label={`${orderLabel} (opens in a new tab)`}>
          {orderLabel}
        </Button>
      )}
      {directionsHref && (
        <LinkAction className="bt-map-card__directions" tone={variant === "forest" ? "mustard" : "forest"} href={directionsHref} target="_blank" aria-label={`${directionsLabel} (opens in a new tab)`}>
          {directionsLabel}
        </LinkAction>
      )}
    </Card>
  );
});
