import { useId, useState, type FormEvent } from 'react';
import { Button, Card, Checkbox, FileUpload, TextField } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import { validateDishDraft } from '@/lib/menu/menu-api';
import { DIETARY_OPTIONS, toggleTag } from '@/lib/menu/dietary';
import { uploadSizeError } from '@/lib/menu/process-image';
import type { DishDraft } from '@/lib/menu/types';

interface DishEditorProps {
  initial: DishDraft;
  onSave: (draft: DishDraft, photo: File | null) => Promise<void>;
  onCancel: () => void;
}

/** Inline form used both to edit an existing dish and to add a new one. */
export function DishEditor({ initial, onSave, onCancel }: DishEditorProps) {
  const [draft, setDraft] = useState<DishDraft>(initial);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const descriptionId = useId();
  const t = staffContent.fields;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validateDishDraft(draft) ?? (photo ? uploadSizeError(photo.size) : null);
    if (problem) return setError(problem);
    setSaving(true);
    setError(null);
    try {
      await onSave(draft, photo);
    } catch {
      setError(staffContent.failed);
      setSaving(false);
    }
  };

  return (
    <Card variant="white" shape="rect">
      <form className="dish-editor" onSubmit={submit}>
        <TextField
          label={t.name}
          required
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <TextField
          label={t.price}
          hint={t.priceHint}
          value={draft.price}
          onChange={(e) => setDraft({ ...draft, price: e.target.value })}
        />
        <div className="bt-field">
          <label className="bt-field__label" htmlFor={descriptionId}>
            {t.description}
          </label>
          <textarea
            id={descriptionId}
            className="bt-input"
            rows={4}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </div>
        <fieldset className="menu-dietary-filter">
          <legend className="bt-field__label">Dietary</legend>
          {DIETARY_OPTIONS.map((option) => (
            <Checkbox
              key={option.tag}
              checked={draft.tags.includes(option.tag)}
              onChange={() => setDraft({ ...draft, tags: toggleTag(draft.tags, option.tag) })}
            >
              {option.label} ({option.tag})
            </Checkbox>
          ))}
        </fieldset>
        <FileUpload
          label={t.photo}
          accept="image/*"
          multiple={false}
          size="sm"
          browseLabel={t.browse}
          files={photo ? [photo] : []}
          onFilesChange={(files) => setPhoto(files[0] ?? null)}
          onReject={() => setError(t.photoRejected)}
          error={photo ? (uploadSizeError(photo.size) ?? undefined) : undefined}
        >
          {t.photoHint}
        </FileUpload>
        {error && (
          <p className="bt-field__hint bt-field__hint--error" role="alert">
            {error}
          </p>
        )}
        <div className="dish-editor-actions">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? (photo ? staffContent.processing : staffContent.saving) : staffContent.save}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            {staffContent.cancel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
