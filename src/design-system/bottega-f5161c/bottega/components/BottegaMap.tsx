import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { resolveMapTheme, type MapTheme } from "../lib/map-theme";

export interface BottegaMapMarker {
  lat: number;
  lng: number;
  /** Accessible marker title, e.g. the trattoria name. */
  title: string;
}

export interface BottegaMapProps extends HTMLAttributes<HTMLDivElement> {
  /** Map center. */
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: BottegaMapMarker[];
  /** Accessible name for the map region. */
  label: string;
  /** Browser key. Defaults to the Lovable Google Maps connector key. */
  apiKey?: string;
  size?: "sm" | "md" | "lg";
  /** Map-only theme override. Defaults to "auto" to follow the site theme. */
  theme?: MapTheme;
  /** Optional inset card (address, hours, directions link). */
  children?: ReactNode;
}

type GMap = { setOptions(o: object): void };
type GMaps = {
  Map: new (el: HTMLElement, o: object) => GMap;
  Marker: new (o: object) => { setMap(m: GMap | null): void };
};
declare global {
  interface Window { __bottegaMapsReady?: () => void; google?: { maps: GMaps } }
}

let loader: Promise<GMaps> | null = null;
function loadMaps(key: string, channel: string): Promise<GMaps> {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    window.__bottegaMapsReady = () => {
      const maps = window.google?.maps;
      if (maps) resolve(maps);
      else { loader = null; reject(new Error("Google Maps failed to initialize")); }
    };
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=__bottegaMapsReady&channel=${encodeURIComponent(channel)}`;
    s.onerror = () => { loader = null; reject(new Error("Google Maps failed to load")); };
    document.head.appendChild(s);
  });
  return loader;
}

/** Builds the vintage trattoria palette from the active Bottega tokens. */
export function bottegaMapStyles(el: Element = document.documentElement, theme: MapTheme = "auto") {
  const cs = getComputedStyle(el);
  const t = (n: string) => cs.getPropertyValue(n).trim();
  const dark = resolveMapTheme(theme, document.documentElement.dataset.theme) === "dark";
  const land = dark ? t("--bt-forest-deep") : t("--bt-parchment");
  const park = t("--bt-forest");
  const water = dark ? t("--bt-forest-dark") : t("--bt-cobalt");
  const road = dark ? t("--bt-forest-dark") : t("--bt-cream");
  const label = dark ? t("--bt-cream") : t("--bt-ink");
  const halo = land;
  return [
    { elementType: "geometry", stylers: [{ color: land }] },
    { elementType: "labels.text.fill", stylers: [{ color: label }] },
    { elementType: "labels.text.stroke", stylers: [{ color: halo }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: land }] },
    { featureType: "landscape", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: park }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: road }] },
    ...(!dark ? [
      { elementType: "labels.text.stroke", stylers: [{ color: t("--bt-cream") }, { weight: 3 }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: t("--bt-terracotta") }, { weight: 1 }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ visibility: "on" }, { color: t("--bt-ink") }] },
      { featureType: "road", elementType: "labels.text.stroke", stylers: [{ visibility: "on" }, { color: t("--bt-cream") }, { weight: 3 }] },
      { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: t("--bt-forest") }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: park }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ visibility: "on" }, { color: t("--bt-cream") }] },
      { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ visibility: "on" }, { color: park }, { weight: 3 }] },
    ] : []),
    { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: t("--bt-mustard") }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: t("--bt-terracotta") }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: t("--bt-terracotta") }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: water }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: t("--bt-cream") }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: water }] },
  ];
}

/** Google map styled as a vintage trattoria print, framed in Bottega style. Syncs with the light/dark theme. */
export const BottegaMap = forwardRef<HTMLDivElement, BottegaMapProps>(function BottegaMap(
  { center, zoom = 15, markers = [], label, apiKey, size = "md", theme = "auto", children, className, ...props },
  ref,
) {
  const canvas = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const key = apiKey ?? import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] ?? "";
  const markerKey = JSON.stringify(markers);

  useEffect(() => {
    if (!key || !canvas.current) { setStatus("unavailable"); return; }
    let cancelled = false;
    let observer: MutationObserver | undefined;
    const pins: { setMap(m: GMap | null): void }[] = [];
    loadMaps(key, channel).then((maps) => {
      if (cancelled || !canvas.current) return;
      const map = new maps.Map(canvas.current, {
        center, zoom, styles: bottegaMapStyles(canvas.current, theme), clickableIcons: false,
        disableDefaultUI: true, zoomControl: true, gestureHandling: "cooperative",
      });
      markers.forEach((m) => pins.push(new maps.Marker({ map, position: { lat: m.lat, lng: m.lng }, title: m.title })));
      if (theme === "auto") {
        observer = new MutationObserver(() => {
          if (canvas.current) map.setOptions({ styles: bottegaMapStyles(canvas.current, theme) });
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      }
      setStatus("ready");
    }).catch(() => !cancelled && setStatus("unavailable"));
    return () => { cancelled = true; observer?.disconnect(); pins.forEach((p) => p.setMap(null)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, channel, center.lat, center.lng, zoom, markerKey, theme]);

  return (
    <div ref={ref} className={cx("bt-map", `bt-map--${size}`, theme !== "auto" && `bt-surface-${theme}`, className)} {...props} data-theme={theme === "auto" ? undefined : theme}>
      <div ref={canvas} className="bt-map__canvas" role="region" aria-label={label} />
      {status !== "ready" && (
        <div className="bt-map__fallback bt-surface-light" role="status">
          <span className="bt-map__pin" aria-hidden="true" />
          <span>{status === "loading" ? "Loading map…" : "Map unavailable"}</span>
        </div>
      )}
      {children && <div className="bt-map__card">{children}</div>}
    </div>
  );
});
