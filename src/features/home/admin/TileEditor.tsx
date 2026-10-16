import { useState, type FormEvent } from 'react';
import { Button, Card, FileUpload, TextField } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import { validateTileDraft } from '@/lib/gallery/gallery-api';
import type { TileDraft } from '@/lib/gallery/types';
import { mediaSizeError } from '@/lib/media/video-sources';

interface TileEditorProps {
  initial: TileDraft;
  requireFile?: boolean;
  onSave: (draft: TileDraft, file: File | null, onProgress: (fraction: number) => void) => Promise<void>;
  onCancel: () => void;
}

/** Inline form to edit or add a gallery tile; media is processed in the background before upload. */
export function TileEditor({ initial, requireFile = false, onSave, onCancel }: TileEditorProps) {
  const [draft, setDraft] = useState<TileDraft>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const t = staffContent.gallery;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem =
      validateTileDraft(draft) ?? (requireFile && !file ? t.mediaRequired : file ? mediaSizeError(file.size) : null);
    if (problem) return setError(problem);
    setSaving(true);
    setError(null);
    try {
      await onSave(draft, file, (fraction) => setProgress(Math.round(fraction * 100)));
    } catch {
      setError(staffContent.failed);
      setSaving(false);
      setProgress(null);
    }
  };

  const kind = file?.type.startsWith('video/') ? 'video' : 'photo';
  const status = !saving
    ? staffContent.save
    : !file
      ? staffContent.saving
      : progress !== null && progress < 100
        ? t.preparing(kind, progress)
        : t.uploading;

  return (
    <Card variant="white" shape="rect">
      <form className="gallery-editor" onSubmit={submit}>
        <FileUpload
          label={t.media}
          accept="image/*,video/*"
          multiple={false}
          size="sm"
          browseLabel={t.browse}
          files={file ? [file] : []}
          onFilesChange={(files) => setFile(files[0] ?? null)}
          onReject={() => setError(t.rejected)}
          error={file ? (mediaSizeError(file.size) ?? undefined) : undefined}
          disabled={saving}
        >
          {t.hint}
        </FileUpload>
        <TextField
          label={t.alt}
          hint={t.altHint}
          required
          value={draft.alt}
          onChange={(e) => setDraft({ ...draft, alt: e.target.value })}
        />
        <TextField
          label={t.caption}
          hint={t.captionHint}
          value={draft.caption}
          onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
        />
        {error && (
          <p className="bt-field__hint bt-field__hint--error" role="alert">
            {error}
          </p>
        )}
        <div className="gallery-editor-actions" aria-live="polite">
          <Button type="submit" size="sm" disabled={saving}>
            {status}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            {staffContent.cancel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
