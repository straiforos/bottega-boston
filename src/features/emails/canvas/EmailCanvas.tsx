import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Button, PillLabel } from '@/design-system/bottega-f5161c';
import { ArrowIcon } from '@/components/ArrowIcon';
import { clubContent } from '@/content/en/club';
import type { EmailBlock } from '@/lib/email/blocks';

const t = clubContent.editor;

interface Rect {
  id: string;
  top: number;
  height: number;
}

interface Props {
  html: string;
  device: 'desktop' | 'phone';
  blocks: readonly EmailBlock[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (id: string | null) => void;
  onKey: (key: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onInsert: (index: number) => void;
}

/** The live email as an editing surface: the iframe reports block geometry, overlays draw Bottega controls on top. */
export function EmailCanvas({ html, device, blocks, selectedId, disabled, onSelect, onKey, onMove, onDuplicate, onRemove, onInsert }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    const listen = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || e.data?.source !== 'bt-canvas') return;
      const m = e.data;
      if (m.type === 'rects') {
        setRects(m.rects);
        setScrollY(m.scrollY);
      } else if (m.type === 'hover') setHoverId(m.id);
      else if (m.type === 'select' && !disabled) onSelect(m.id);
      else if (m.type === 'key' && !disabled) onKey(m.key);
    };
    window.addEventListener('message', listen);
    return () => window.removeEventListener('message', listen);
  }, [disabled, onSelect, onKey]);

  const place = (r: Rect): CSSProperties =>
    ({ '--canvas-top': `${r.top - scrollY}px`, '--canvas-height': `${r.height}px` }) as CSSProperties;
  const indexOf = (id: string) => blocks.findIndex((b) => b.id === id);
  const selected = rects.find((r) => r.id === selectedId);
  const hovered = hoverId !== selectedId ? rects.find((r) => r.id === hoverId) : undefined;
  const selectedBlock = blocks.find((b) => b.id === selectedId);

  return (
    <div className={`email-canvas email-canvas--${device}`}>
      {!disabled && selected && selectedBlock && (
              <div className="email-canvas-bar" aria-label={t.blocks} role="toolbar">
                <PillLabel variant="chip-forest">{t.blockNames[selectedBlock.type]}</PillLabel>
                <div className="email-canvas-tools">
                <Button size="sm" aria-label={t.moveUp} disabled={indexOf(selected.id) === 0} onClick={() => onMove(selected.id, -1)}>
                  <ArrowIcon direction="left" size="sm" />
                </Button>
                <Button
                  size="sm"
                  aria-label={t.moveDown}
                  disabled={indexOf(selected.id) === blocks.length - 1}
                  onClick={() => onMove(selected.id, 1)}
                >
                  <ArrowIcon direction="right" size="sm" />
                </Button>
                <Button size="sm" onClick={() => onDuplicate(selected.id)}>
                  {t.duplicate}
                </Button>
                <Button size="sm" onClick={() => onRemove(selected.id)}>
                  {t.removeShort}
                </Button>
                <Button size="sm" variant="accent" aria-label={t.insertAbove} onClick={() => onInsert(indexOf(selected.id))}>
                  + {t.above}
                </Button>
                </div>
              </div>
      )}
      <div className="email-canvas-stage">
      <iframe
        ref={frame}
        className={`email-preview-frame email-preview-frame--${device}`}
        title={t.preview}
        srcDoc={html}
        sandbox="allow-scripts"
      />
      {!disabled && (
        <div className="email-canvas-layer" aria-hidden={!selected}>
          {hovered && <div className="email-canvas-box email-canvas-box--hover" style={place(hovered)} />}
          {selected && selectedBlock && (
            <div className="email-canvas-box email-canvas-box--selected" style={place(selected)}>
              <div className="email-canvas-insert email-canvas-insert--below">
                <Button size="sm" variant="accent" aria-label={t.insertBelow} onClick={() => onInsert(indexOf(selected.id) + 1)}>
                  + {t.below}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
      <p className="email-canvas-live" role="status" aria-live="polite">
        {selectedBlock ? t.selected(t.blockNames[selectedBlock.type]) : ''}
      </p>
    </div>
  );
}
