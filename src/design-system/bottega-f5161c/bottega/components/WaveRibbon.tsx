import { forwardRef, useId, type SVGAttributes } from "react";
import { cx } from "../lib/cx";

export interface WaveRibbonProps extends Omit<SVGAttributes<SVGSVGElement>, "children"> {
  /** Phrase repeated along the wave ("Follow us"). */
  text: string;
  separator?: string;
  variant?: "mustard" | "cream" | "terracotta" | "tomato";
}

const PATH = "M -20 200 C 150 40, 300 40, 450 160 S 750 280, 900 120 S 1150 0, 1220 60";

/** Wavy ribbon with text running along it — a playful section divider. */
export const WaveRibbon = forwardRef<SVGSVGElement, WaveRibbonProps>(function WaveRibbon(
  { text, separator = "*", variant = "mustard", className, ...props },
  ref,
) {
  const id = useId().replace(/:/g, "");
  const phrase = Array.from({ length: 16 }, () => `${text} ${separator} `).join("");
  return (
    <svg ref={ref} viewBox="0 0 1200 260" role="img" aria-label={text} className={cx("bt-wave", `bt-wave--${variant}`, className)} {...props}>
      <path id={`w${id}`} d={PATH} fill="none" />
      <path className="bt-wave__band" d={PATH} fill="none" strokeWidth="70" />
      <text fontSize="56" dy="20" aria-hidden="true">
        <textPath href={`#w${id}`} startOffset="-100%">
          {phrase}
          <animate attributeName="startOffset" from="-100%" to="0%" dur="14s" repeatCount="indefinite" />
        </textPath>
      </text>
    </svg>
  );
});
