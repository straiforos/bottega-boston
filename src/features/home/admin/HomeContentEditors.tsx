import { useState, type FormEvent, type ReactNode } from 'react';
import { useSnackbar } from '@/design-system/bottega-f5161c/bottega';
import { adminDraftKey, clearStoredDraft, isDirty, readDraft, useAdminDraft } from '@/lib/events/form-draft';
import { useMediaDraft } from '@/lib/events/media-draft';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  validateStory,
  type HeroContent,
  type OfferingCard,
  type StoryContent,
} from '@/lib/home/home-content';
import { menuSections as fallbackMenu } from '@/lib/menu-data';
import { menuQueryOptions } from '@/lib/menu/menu-api';
import { menuHrefForSelection, selectionForMenuHash } from '@/lib/menu/filter-menu';
import { GalleryEditorDialog } from './GalleryEditorDialog';
import { GalleryActionIcon } from './GalleryActionIcon';

async function uploadImage(key: string, file: File, onProgress: (f: number) => void) {
  const { processMedia } = await import('@/lib/media/process-media');
  const processed = await processMedia(file, onProgress);
  return (await uploadTileMedia(`home-${key}`, processed)).media_url;
}

async function uploadStoryMedia(file: File, onProgress: (f: number) => void) {
  const { processMedia } = await import('@/lib/media/process-media');
  const processed = await processMedia(file, onProgress);
  return uploadTileMedia('home-story', processed);
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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { show } = useSnackbar();
  const key = adminDraftKey(`home:${contentKey}`);
  const { file, setFile, clearMedia, ready: mediaReady } = useMediaDraft(key, () => show({ message: staffContent.mediaDraftFailed, variant: 'danger' }), open && Boolean(withImage));
  useAdminDraft(key, draft, initial, () => {}, open);

  const start = () => {
    const saved = readDraft<T>(key);
    setDraft(saved && isDirty(saved, initial) ? saved : initial);
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
      if (withImage) await clearMedia();
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
                disabled={saving || !mediaReady}
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
              <Button type="submit" size="sm" disabled={saving || (withImage && !mediaReady)}>
                {saving ? (progress !== null && progress < 100 ? `Preparing photo… ${progress}%` : staffContent.saving) : staffContent.save}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { clearStoredDraft(key); if (withImage) void clearMedia(); setOpen(false); }} disabled={saving}>
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

/** Staff switch About between video and image; uploads use the gallery media pipeline. */
export function StoryEditor({ story }: { story: StoryContent }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(story);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { show } = useSnackbar();
  const key = adminDraftKey('home:story');
  const { file, setFile, clearMedia, ready: mediaReady } = useMediaDraft(key, () => show({ message: staffContent.mediaDraftFailed, variant: 'danger' }), open);
  useAdminDraft(key, draft, story, () => {}, open);

  const start = () => {
    const saved = readDraft<StoryContent>(key);
    setDraft(saved && isDirty(saved, story) ? saved : story);
    setError(null);
    setOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: StoryContent = { ...draft };
    if (file) {
      next.mediaKind = file.type.startsWith('video/') ? 'video' : 'image';
    }
    const problem = validateStory(next) ?? (next.mediaKind === 'image' && !next.imageUrl && !file ? 'Add a photo.' : null);
    if (problem) {
      setError(problem);
      show({ message: problem, variant: 'danger' });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (file) {
        const uploaded = await uploadStoryMedia(file, (f) => setProgress(Math.round(f * 100)));
        if (uploaded.media_type === 'video') {
          next.mediaKind = 'video';
          next.videoUrl = uploaded.media_url;
          next.posterUrl = uploaded.poster_url ?? next.posterUrl;
        } else {
          next.mediaKind = 'image';
          next.imageUrl = uploaded.media_url;
        }
      }
      await saveHomeContent('story', next);
      await queryClient.invalidateQueries({ queryKey: homeContentQueryOptions.queryKey });
      clearStoredDraft(key);
      await clearMedia();
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
        <Button variant="primary" size="sm" onClick={start} aria-label={`${staffContent.edit} Edit about us`} title="Edit about us">
          <GalleryActionIcon action="edit" />
        </Button>
      </span>
      <GalleryEditorDialog open={open} label="Edit about us" onCancel={() => setOpen(false)}>
        <Card variant="white" shape="rect">
          <form className="gallery-editor" onSubmit={submit}>
            <fieldset className="home-edit-choices" disabled={saving}>
              <legend className="bt-field__label">Media</legend>
              <Radio name="story-kind" checked={draft.mediaKind === 'video'} onChange={() => setDraft({ ...draft, mediaKind: 'video' })}>
                Video
              </Radio>
              <Radio name="story-kind" checked={draft.mediaKind === 'image'} onChange={() => setDraft({ ...draft, mediaKind: 'image' })}>
                Photo
              </Radio>
            </fieldset>
            <FileUpload
              label={draft.mediaKind === 'video' ? 'Video' : 'Photo'}
              accept="image/*,video/*"
              multiple={false}
              size="sm"
              browseLabel="Choose file"
              files={file ? [file] : []}
              onFilesChange={(files) => {
                const next = files[0] ?? null;
                setFile(next);
                if (next?.type.startsWith('video/')) setDraft((d) => ({ ...d, mediaKind: 'video' }));
                else if (next?.type.startsWith('image/')) setDraft((d) => ({ ...d, mediaKind: 'image' }));
              }}
              onReject={() => setError('Choose an image or video file.')}
              disabled={saving || !mediaReady}
            >
              Leave empty to keep the current media. Choosing a file switches to that type.
            </FileUpload>
            {draft.mediaKind === 'image' && (
              <TextField
                label="Photo description"
                value={draft.imageAlt}
                disabled={saving}
                onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })}
              />
            )}
            {error && (
              <p className="bt-field__hint bt-field__hint--error" role="alert">
                {error}
              </p>
            )}
            <div className="gallery-editor-actions" aria-live="polite">
              <Button type="submit" size="sm" disabled={saving || !mediaReady}>
                {saving ? (progress !== null && progress < 100 ? `Preparing media… ${progress}%` : staffContent.saving) : staffContent.save}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearStoredDraft(key);
                  void clearMedia();
                  setOpen(false);
                }}
                disabled={saving}
              >
                {staffContent.cancel}
              </Button>
            </div>
          </form>
        </Card>
      </GalleryEditorDialog>
    </>
  );
}

const variantLabels: Record<(typeof CARD_VARIANTS)[number], string> = {
  cream: 'Cream',
  mustard: 'Mustard',
  cobalt: 'Cobalt',
  forest: 'Forest',
  white: 'White',
};

function isMenuHref(href: string) {
  const path = href.trim().split('#')[0] || '';
  return path === '/menu' || href.trim().startsWith('/menu#');
}

export function CardEditor({ index, card }: { index: number; card: OfferingCard }) {
  const n = index + 1;
  const { data: menuSections = fallbackMenu } = useQuery(menuQueryOptions);
  const diningSections = menuSections.filter((section) => !section.name.startsWith('Catering'));

  return (
    <EditShell
      label={`Edit card ${n}`}
      contentKey={`card-${n}`}
      initial={card}
      withImage
      validate={validateCard}
      toData={(d, url) => ({ ...d, imageUrl: url ?? d.imageUrl, linkHref: d.linkHref.trim() })}
      fields={(d, set, disabled) => {
        const menuLink = isMenuHref(d.linkHref);
        const selection = menuLink ? selectionForMenuHash(d.linkHref.split('#')[1] ?? '', menuSections) : 'all';
        return (
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
            <fieldset className="home-edit-choices" disabled={disabled}>
              <legend className="bt-field__label">Link destination</legend>
              <Radio
                name={`link-kind-${n}`}
                checked={menuLink}
                onChange={() => set({ ...d, linkHref: menuHrefForSelection('all', menuSections) })}
              >
                Menu section
              </Radio>
              <Radio
                name={`link-kind-${n}`}
                checked={!menuLink}
                onChange={() => set({ ...d, linkHref: d.linkHref.startsWith('/menu') ? `mailto:` : d.linkHref })}
              >
                Custom URL
              </Radio>
            </fieldset>
            {menuLink ? (
              <label className="bt-field">
                <span className="bt-field__label">Menu section</span>
                <select
                  className="bt-field__control"
                  disabled={disabled}
                  value={selection === 'catering' ? 'catering' : selection === 'all' ? 'all' : selection}
                  onChange={(e) => set({ ...d, linkHref: menuHrefForSelection(e.target.value, menuSections) })}
                >
                  <option value="all">All dishes</option>
                  <option value="catering">Catering</option>
                  {diningSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name.split(' (')[0]}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <TextField
                label="Custom URL"
                hint="e.g. /order, /events, https://… or mailto:…"
                value={d.linkHref}
                disabled={disabled}
                onChange={(e) => set({ ...d, linkHref: e.target.value })}
              />
            )}
            <TextField
              label="Stamp (optional)"
              hint="Leave empty for no stamp. Use | for a line break."
              value={toBar(d.stamp)}
              disabled={disabled}
              onChange={(e) => set({ ...d, stamp: fromBar(e.target.value) })}
            />
          </>
        );
      }}
    />
  );
}
