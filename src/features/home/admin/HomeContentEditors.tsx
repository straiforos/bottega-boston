import { useState, type FormEvent, type ReactNode } from 'react';
import { useSnackbar } from '@/design-system/bottega-f5161c/bottega';
import { adminDraftKey, clearStoredDraft, isDirty, readDraft, useAdminDraft } from '@/lib/events/form-draft';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Checkbox, FileUpload, Radio, TextField } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import { uploadTileMedia } from '@/lib/gallery/gallery-api';
import {
  CARD_SHAPES,
  CARD_VARIANTS,
  homeContentQueryOptions,
  saveHomeContent,
  validateCard,
  validateHero,
  validateRibbon,
  type HeroContent,
  type OfferingCard,
} from '@/lib/home/home-content';
import { GalleryEditorDialog } from './GalleryEditorDialog';
import { GalleryActionIcon } from './GalleryActionIcon';

async function uploadImage(key: string, file: File, onProgress: (f: number) => void) {
  const { processMedia } = await import('@/lib/media/process-media');
  const processed = await processMedia(file, onProgress);
  return (await uploadTileMedia(`home-${key}`, processed)).media_url;
}

interface ShellProps<T> {
  label: string;
  contentKey: string;
  initial: T;
  withImage?: boolean;
  validate: (draft: T) => string | null;
  toData: (draft: T, imageUrl: string | null) => object;
  fields: (draft: T, set: (next: T) => void, disabled: boolean) => ReactNode;
}

/** Floating staff edit button that opens a dialog form; saving refreshes the live page. */
function EditShell<T>({ label, contentKey, initial, withImage, validate, toData, fields }: ShellProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { show } = useSnackbar();
  const key = adminDraftKey(`home:${contentKey}`);
  useAdminDraft(key, draft, initial, () => {}, open);

  const start = () => {
    const saved = readDraft<T>(key);
    setDraft(saved && isDirty(saved, initial) ? saved : initial);
    setFile(null);
    setError(null);
    setOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validate(draft);
    if (problem) {
      setError(problem);
      show({ message: problem, variant: 'danger' });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = file ? await uploadImage(contentKey, file, (f) => setProgress(Math.round(f * 100))) : null;
      await saveHomeContent(contentKey, toData(draft, url));
      await queryClient.invalidateQueries({ queryKey: homeContentQueryOptions.queryKey });
      clearStoredDraft(key);
      show({ message: staffContent.changesSaved, variant: 'success' });
      setOpen(false);
    } catch {
      setError(staffContent.failed);
      show({ message: staffContent.failed, variant: 'danger' });
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  return (
    <>
      <span className="home-edit-trigger">
        <Button variant="primary" size="sm" onClick={start} aria-label={`${staffContent.edit} ${label}`} title={label}>
          <GalleryActionIcon action="edit" />
        </Button>
      </span>
      <GalleryEditorDialog open={open} label={label} onCancel={() => setOpen(false)}>
        <Card variant="white" shape="rect">
          <form className="gallery-editor" onSubmit={submit}>
            {withImage && (
              <FileUpload
                label="Photo"
                accept="image/*"
                multiple={false}
                size="sm"
                browseLabel="Choose photo"
                files={file ? [file] : []}
                onFilesChange={(files) => setFile(files[0] ?? null)}
                onReject={() => setError('Choose an image file.')}
                disabled={saving}
              >
                Leave empty to keep the current photo.
              </FileUpload>
            )}
            {fields(draft, setDraft, saving)}
            {error && (
              <p className="bt-field__hint bt-field__hint--error" role="alert">
                {error}
              </p>
            )}
            <div className="gallery-editor-actions" aria-live="polite">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? (progress !== null && progress < 100 ? `Preparing photo… ${progress}%` : staffContent.saving) : staffContent.save}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={saving}>
                {staffContent.cancel}
              </Button>
            </div>
          </form>
        </Card>
      </GalleryEditorDialog>
    </>
  );
}

const multiline = 'Use | where the text should break onto a new line.';
const toBar = (text: string) => text.replace(/\n/g, ' | ');
const fromBar = (text: string) => text.replace(/\s*\|\s*/g, '\n');

export function HeroEditor({ hero }: { hero: HeroContent }) {
  return (
    <EditShell
      label="Edit welcome banner"
      contentKey="hero"
      initial={hero}
      withImage
      validate={validateHero}
      toData={(d, url) => ({ ...d, imageUrl: url ?? d.imageUrl })}
      fields={(d, set, disabled) => (
        <>
          <TextField label="Headline" value={d.headline} disabled={disabled} onChange={(e) => set({ ...d, headline: e.target.value })} />
          <TextField label="Photo description" value={d.imageAlt} disabled={disabled} onChange={(e) => set({ ...d, imageAlt: e.target.value })} />
          <Checkbox checked={d.showStamp} disabled={disabled} onChange={(e) => set({ ...d, showStamp: e.target.checked })}>
            Show stamp
          </Checkbox>
          {d.showStamp && <StampField value={d.stamp} disabled={disabled} onChange={(stamp) => set({ ...d, stamp })} />}
        </>
      )}
    />
  );
}

function StampField({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <TextField label="Stamp text" hint={multiline} value={toBar(value)} disabled={disabled} onChange={(e) => onChange(fromBar(e.target.value))} />
  );
}

export function RibbonEditor({ text }: { text: string }) {
  return (
    <EditShell
      label="Edit ribbon"
      contentKey="ribbon"
      initial={{ text }}
      validate={(d) => validateRibbon(d.text)}
      toData={(d) => ({ text: d.text.trim() })}
      fields={(d, set, disabled) => (
        <TextField label="Ribbon text" value={d.text} disabled={disabled} onChange={(e) => set({ text: e.target.value })} />
      )}
    />
  );
}

const variantLabels: Record<(typeof CARD_VARIANTS)[number], string> = {
  cream: 'Cream',
  mustard: 'Mustard',
  cobalt: 'Cobalt',
  forest: 'Forest',
  white: 'White',
};

export function CardEditor({ index, card }: { index: number; card: OfferingCard }) {
  const n = index + 1;
  return (
    <EditShell
      label={`Edit card ${n}`}
      contentKey={`card-${n}`}
      initial={card}
      withImage
      validate={validateCard}
      toData={(d, url) => ({ ...d, imageUrl: url ?? d.imageUrl, linkHref: d.linkHref.trim() })}
      fields={(d, set, disabled) => (
        <>
          <fieldset className="home-edit-choices" disabled={disabled}>
            <legend className="bt-field__label">Shape</legend>
            {CARD_SHAPES.map((shape) => (
              <Radio key={shape} name={`shape-${n}`} checked={d.shape === shape} onChange={() => set({ ...d, shape })}>
                {shape === 'rect' ? 'Rectangle' : 'Arch'}
              </Radio>
            ))}
          </fieldset>
          <fieldset className="home-edit-choices" disabled={disabled}>
            <legend className="bt-field__label">Color</legend>
            {CARD_VARIANTS.map((variant) => (
              <Radio key={variant} name={`variant-${n}`} checked={d.variant === variant} onChange={() => set({ ...d, variant })}>
                {variantLabels[variant]}
              </Radio>
            ))}
          </fieldset>
          <fieldset className="home-edit-choices" disabled={disabled}>
            <legend className="bt-field__label">Title style</legend>
            <Radio name={`title-${n}`} checked={d.titleStyle === 'display'} onChange={() => set({ ...d, titleStyle: 'display' })}>
              Bold poster
            </Radio>
            <Radio name={`title-${n}`} checked={d.titleStyle === 'serif'} onChange={() => set({ ...d, titleStyle: 'serif' })}>
              Elegant serif
            </Radio>
          </fieldset>
          <TextField label="Title" value={d.title} disabled={disabled} onChange={(e) => set({ ...d, title: e.target.value })} />
          <TextField label="Label (optional)" value={d.badge} disabled={disabled} onChange={(e) => set({ ...d, badge: e.target.value })} />
          <TextField label="Text" hint={multiline} value={toBar(d.subtitle)} disabled={disabled} onChange={(e) => set({ ...d, subtitle: fromBar(e.target.value) })} />
          <TextField label="Photo description" value={d.imageAlt} disabled={disabled} onChange={(e) => set({ ...d, imageAlt: e.target.value })} />
          <TextField label="Link label" value={d.linkLabel} disabled={disabled} onChange={(e) => set({ ...d, linkLabel: e.target.value })} />
          <TextField
            label="Link destination"
            hint="e.g. /menu, /menu#category-8, https://… or mailto:…"
            value={d.linkHref}
            disabled={disabled}
            onChange={(e) => set({ ...d, linkHref: e.target.value })}
          />
          <TextField
            label="Stamp (optional)"
            hint="Leave empty for no stamp. Use | for a line break."
            value={toBar(d.stamp)}
            disabled={disabled}
            onChange={(e) => set({ ...d, stamp: fromBar(e.target.value) })}
          />
        </>
      )}
    />
  );
}
