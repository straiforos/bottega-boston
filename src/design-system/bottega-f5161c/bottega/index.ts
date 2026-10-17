/**
 * Bottega Design System — library entry point.
 *
 * Importing this module loads the theme and component styles. Brand fonts are
 * NOT bundled: the consuming app must load them once in its document head
 * (a <link> tag, never a CSS @import). In a TanStack Start app, add these to
 * the root route's head() links:
 *
 *   { rel: "preconnect", href: "https://fonts.googleapis.com" },
 *   { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
 *   { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Domine:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap" },
 *
 * Without them the type tokens fall back to system fonts.
 * See .lovable/system.md (attached with this library) for the same setup note.
 */
import "./styles/theme.css";
import "./styles/components.css";


export { Button, type ButtonProps } from "./components/Button";
export { Display, Serif, type DisplayProps, type SerifProps, type Tone } from "./components/Typography";
export { Stamp, type StampProps } from "./components/Stamp";
export { Marquee, type MarqueeProps } from "./components/Marquee";
export { Card, ArchFrame, type CardProps, type ArchFrameProps } from "./components/Card";
export { TextField, Checkbox, Radio, PillLabel, type TextFieldProps, type CheckboxProps, type RadioProps, type PillLabelProps } from "./components/Form";
export { WaveRibbon, type WaveRibbonProps } from "./components/WaveRibbon";
export { LinkAction, type LinkActionProps } from "./components/LinkAction";
export { SiteHeader, type SiteHeaderProps } from "./components/SiteHeader";
export { Logo, type LogoProps } from "./components/Logo";
export { ThemeToggle, type ThemeToggleProps, type Theme } from "./components/ThemeToggle";
export { MenuToggle, type MenuToggleProps } from "./components/MenuToggle";
export { MenuOverlay, type MenuOverlayProps } from "./components/MenuOverlay";
export { MenuLink, type MenuLinkProps } from "./components/MenuLink";
export { MenuSubmenu, type MenuSubmenuProps } from "./components/MenuSubmenu";
export { cx } from "./lib/cx";

export { FileUpload, type FileUploadProps } from "./components/FileUpload";
export { Confirmation, type ConfirmationProps } from "./components/Confirmation";
export { BottegaMap, bottegaMapStyles, type BottegaMapProps, type BottegaMapMarker } from "./components/BottegaMap";
export { BottegaMapCard, type BottegaMapCardProps } from "./components/BottegaMapCard";
