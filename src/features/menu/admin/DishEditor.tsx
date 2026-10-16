import { useId, useState, type FormEvent } from 'react';
import { Button, Card, TextField } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import { validateDishDraft } from '@/lib/menu/menu-api';
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
  const photoId = useId();
  const t = staffContent.fields;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validateDishDraft(draft);
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
        <div className="bt-field">
          <label className="bt-field__label" htmlFor={photoId}>
            {t.photo}
          </label>
          <input
            id={photoId}
            className="bt-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
          <span className="bt-field__hint">{t.photoHint}</span>
        </div>
        {error && (
          <p className="bt-field__hint bt-field__hint--error" role="alert">
            {error}
          </p>
        )}
        <div className="dish-editor-actions">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? staffContent.saving : staffContent.save}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            {staffContent.cancel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
