import { forwardRef, useId, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { Logo } from "./Logo";
import { MenuOverlay } from "./MenuOverlay";
import { MenuToggle } from "./MenuToggle";

export interface SiteHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Navigation links rendered inside the semantic navigation landmark. */
  children: ReactNode;
  /** Optional controls displayed after the navigation links. */
  navigationFooter?: ReactNode;
  /** Destination used by the composite Bottega logo. */
  homeHref?: string;
  /** Accessible name for the linked logo. */
  homeLabel?: string;
  /** Alt text for the full Bottega wordmark. */
  logoAlt?: string;
  /** Accessible name for the navigation landmark. */
  navigationLabel?: string;
  /** Initial compact-menu state. */
  defaultMenuOpen?: boolean;
  /** Called whenever the compact menu opens or closes. */
  onMenuOpenChange?: (open: boolean) => void;
  /** Visible label used while the compact menu is closed. */
  menuLabel?: string;
  /** Visible label used while the compact menu is open. */
  closeLabel?: string;
  variant?: "cream" | "forest";
}

/**
 * Complete Bottega site header with the dual logo, semantic navigation, and a noodle menu below 1100px.
 *
 * @example
 * <SiteHeader navigationFooter={<Button size="sm">Order now</Button>}>
 *   <a className="bt-menu-overlay__link" href="/menu">Menu</a>
 *   <a className="bt-menu-overlay__link" href="/visit">Visit</a>
 * </SiteHeader>
 *
 * Use one SiteHeader per page. Do not add a second mobile navigation trigger beside it.
 */
export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader(
  {
    children,
    navigationFooter,
    homeHref = "/",
    homeLabel = "Bottega — home",
    logoAlt = "Bottega — Cucina & Mercato Italiano",
    navigationLabel = "Primary",
    defaultMenuOpen = false,
    onMenuOpenChange,
    menuLabel = "Menu",
    closeLabel = "Close",
    variant = "cream",
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const [menuOpen, setMenuOpen] = useState(defaultMenuOpen);
  const generatedId = useId();
  const navigationId = `bt-site-navigation-${generatedId.replace(/:/g, "")}`;

  const setOpen = (open: boolean) => {
    setMenuOpen(open);
    onMenuOpenChange?.(open);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Escape" && menuOpen) setOpen(false);
  };

  return (
    <header
      ref={ref}
      className={cx("bt-header", `bt-header--${variant}`, className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <a className="bt-header__home" href={homeHref} aria-label={homeLabel}>
        <Logo
          variant="lockup-wordmark"
          size="md"
          tone={variant === "forest" ? "cream" : "auto"}
          alt={logoAlt}
        />
      </a>
      <div className="bt-header__navigation">
        <MenuToggle
          className="bt-header__menu-toggle"
          open={menuOpen}
          openLabel={menuLabel}
          closeLabel={closeLabel}
          aria-controls={navigationId}
          onClick={() => setOpen(!menuOpen)}
        />
        <MenuOverlay
          id={navigationId}
          open={menuOpen}
          label={navigationLabel}
          footer={navigationFooter}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
          }}
        >
          {children}
        </MenuOverlay>
      </div>
    </header>
  );
});
