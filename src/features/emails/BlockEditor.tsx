import { useRef, useState } from 'react';
import { Button, Card, FileUpload, PillLabel, TextField } from '@/design-system/bottega-f5161c';
import { ArrowIcon } from '@/components/ArrowIcon';
import { clubContent } from '@/content/en/club';
import type { EmailBlock } from '@/lib/email/blocks';
import { uploadEmailPhoto } from './upload-email-photo';

const t = clubContent.editor;

interface BlockEditorProps {
  block: EmailBlock;
  first: boolean;
  last: boolean;
  onChange: (block: EmailBlock) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

function RichText({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (before: string, after: string, placeholder: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const picked = value.slice(s, e) || placeholder;
    onChange(`${value.slice(0, s)}${before}${picked}${after}${value.slice(e)}`);
    requestAnimationFrame(() => el.focus());
  };
  return (
    <div className="bt-field">
      <div className="email-toolbar" role="toolbar" aria-label="Text formatting">
        <Button size="sm" variant="outline" onClick={() => wrap('**', '**', 'bold text')}>
          {t.bold}
        </Button>
        <Button size="sm" variant="outline" onClick={() => wrap('_', '_', 'italic text')}>
          {t.italic}
        </Button>
        <Button size="sm" variant="outline" onClick={() => wrap('[', '](https://)', 'link text')}>
          {t.link}
        </Button>
      </div>
      <textarea
        ref={ref}
        className="bt-input email-textarea"
        aria-label={t.blockNames.text}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
      />
      <span className="bt-field__hint">{t.textHint}</span>
    </div>
  );
}

function PhotoFields({
  block,
  onChange,
}: {
  block: Extract<EmailBlock, { type: 'photo' }>;
  onChange: BlockEditorProps['onChange'];
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const pick = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(undefined);
    try {
      setStatus('0%');
      const url = await uploadEmailPhoto(file, (f) => setStatus(`${Math.round(f * 100)}%`));
      onChange({ ...block, url });
    } catch {
      setError('Couldn’t upload that photo.');
    } finally {
      setStatus(null);
    }
  };
  const hasPhoto = !block.url.includes('example.com');
  return (
    <>
      {hasPhoto && <img className="email-photo-thumb" src={block.url} alt="" />}
      <FileUpload
        label={t.blockNames.photo}
        multiple={false}
        size="sm"
        browseLabel={t.photoUpload}
        files={[]}
        onFilesChange={(files) => void pick(files)}
        onReject={() => setError('That file isn’t a photo.')}
        error={error}
        disabled={status !== null}
      >
        {status ? `Preparing photo… ${status}` : 'We resize it so it loads fast in inboxes'}
      </FileUpload>
      <TextField
        label={t.photoAlt}
        required
        value={block.alt}
        onChange={(e) => onChange({ ...block, alt: e.target.value })}
      />
    </>
  );
}

export function BlockEditor({ block, first, last, onChange, onMove, onRemove }: BlockEditorProps) {
  return (
    <Card variant="white" shape="rect">
      <div className="email-block">
        <div className="email-block-head">
          <PillLabel variant="chip-forest">{t.blockNames[block.type]}</PillLabel>
          <div className="email-block-actions">
            <Button size="sm" aria-label={t.moveUp} disabled={first} onClick={() => onMove(-1)}>
              <ArrowIcon direction="left" size="sm" />
            </Button>
            <Button size="sm" aria-label={t.moveDown} disabled={last} onClick={() => onMove(1)}>
              <ArrowIcon direction="right" size="sm" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onRemove}>
              {t.remove}
            </Button>
          </div>
        </div>
        {block.type === 'headline' && (
          <TextField
            label={t.blockNames.headline}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        )}
        {block.type === 'marquee' && (
          <TextField
            label={t.blockNames.marquee}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        )}
        {block.type === 'text' && <RichText value={block.text} onChange={(text) => onChange({ ...block, text })} />}
        {block.type === 'photo' && <PhotoFields block={block} onChange={onChange} />}
        {block.type === 'button' && (
          <>
            <TextField
              label={t.buttonLabel}
              value={block.label}
              onChange={(e) => onChange({ ...block, label: e.target.value })}
            />
            <TextField
              label={t.buttonUrl}
              type="url"
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
            />
          </>
        )}
      </div>
    </Card>
  );
}
