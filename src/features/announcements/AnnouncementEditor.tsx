import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, Checkbox, Display, FileUpload, TextField } from '@/design-system/bottega-f5161c';
import { useSnackbar } from '@/design-system/bottega-f5161c/bottega';
import { BottegaHeader } from '@/components/BottegaHeader';
import { EditorIcon } from '@/components/EditorIcon';
import { announcementsContent } from '@/content/en/announcements';
import { clubContent } from '@/content/en/club';
import { staffContent } from '@/content/en/staff';
import { useStaffSession } from '@/hooks/useStaffSession';
import { adminDraftKey, useAdminDraft } from '@/lib/events/form-draft';
import { useMediaDraft } from '@/lib/events/media-draft';
import { localDate, localTime, zonedToUtc } from '@/lib/events/occurrences';
import { uploadTileMedia } from '@/lib/gallery/gallery-api';
import {
  ANNOUNCEMENT_TZ,
  announcementsQueryOptions,
  saveAnnouncement,
  validateAnnouncement,
  type Announcement,
  type AnnouncementDraft,
} from '@/lib/announcements/announcements-api';

const t = announcementsContent.staff;
const f = t.fields;

function toDraft(a: Announcement | null): AnnouncementDraft {
  return a
    ? {
        title: a.title,
        body: a.body,
        imageUrl: a.imageUrl,
        href: a.href ?? '',
        linkLabel: a.linkLabel ?? '',
        startsAt: a.startsAt,
        endsAt: a.endsAt,
        published: a.published,
      }
    : {
        title: '',
        body: '',
        imageUrl: null,
        href: '',
        linkLabel: '',
        startsAt: '',
        endsAt: '',
        published: true,
      };
}

const toLocalInput = (iso: string) =>
  iso ? `${localDate(new Date(iso), ANNOUNCEMENT_TZ)}T${localTime(new Date(iso), ANNOUNCEMENT_TZ)}` : '';

/** Staff page for scheduling a guest announcement. */
export function AnnouncementEditorPage({ announcementId }: { announcementId: string }) {
  const { isAdmin, ready } = useStaffSession();
  const navigate = useNavigate();
  const { data, isPending } = useQuery({ ...announcementsQueryOptions, enabled: isAdmin });
  const isNew = announcementId === 'new';
  const item = isNew ? null : ((data ?? []).find((a) => a.id === announcementId) ?? null);
  const close = () => void navigate({ to: '/admin/announcements' });

  useEffect(() => {
    if (ready && !isAdmin) void navigate({ to: '/' });
  }, [ready, isAdmin, navigate]);

  return (
    <>
      <BottegaHeader />
      <main className="email-page">
        <div className="email-page-inner event-editor-page">
          <div>
            <Button variant="ghost" size="sm" onClick={close}>
              {t.back}
            </Button>
          </div>
          <Display as="h1" size="lg" tone="forest">
            {isNew ? t.add : t.edit}
          </Display>
          {!isAdmin || (!isNew && isPending) ? (
            <p>{ready && !isAdmin ? clubContent.editor.staffOnly : '…'}</p>
          ) : !isNew && !item ? (
            <p>{t.notFound}</p>
          ) : (
            <AnnouncementForm key={item?.id ?? 'new'} item={item} onClose={close} />
          )}
        </div>
      </main>
    </>
  );
}

function AnnouncementForm({ item, onClose }: { item: Announcement | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { show } = useSnackbar();
  const [draft, setDraft] = useState<AnnouncementDraft>(() => toDraft(item));
  const [starts, setStarts] = useState(() => toLocalInput(draft.startsAt));
  const [ends, setEnds] = useState(() => toLocalInput(draft.endsAt));
  const baseline = useMemo(
    () => ({
      draft: toDraft(item),
      starts: toLocalInput(toDraft(item).startsAt),
      ends: toLocalInput(toDraft(item).endsAt),
    }),
    [item],
  );
  const stored = useMemo(() => ({ draft, starts, ends }), [draft, starts, ends]);
  const clearDraft = useAdminDraft(adminDraftKey(`announcement:${item?.id ?? 'new'}`), stored, baseline, (saved) => {
    setDraft(saved.draft);
    setStarts(saved.starts);
    setEnds(saved.ends);
  });
  const { file, setFile, clearMedia, ready: mediaReady } = useMediaDraft(
    adminDraftKey(`announcement:${item?.id ?? 'new'}`),
    () => show({ message: staffContent.mediaDraftFailed, variant: 'danger' }),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const bodyId = useId();
  const set = (patch: Partial<AnnouncementDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const [startDate, startTime] = starts.split('T');
    const [endDate, endTime] = ends.split('T');
    const next: AnnouncementDraft = {
      ...draft,
      startsAt: startDate && startTime ? zonedToUtc(startDate, startTime, ANNOUNCEMENT_TZ).toISOString() : '',
      endsAt: endDate && endTime ? zonedToUtc(endDate, endTime, ANNOUNCEMENT_TZ).toISOString() : '',
    };
    const problem = validateAnnouncement(next);
    if (problem) {
      setError(problem);
      show({ message: problem, variant: 'danger' });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (file) {
        const { processMedia } = await import('@/lib/media/process-media');
        const processed = await processMedia(file, () => {});
        next.imageUrl = (await uploadTileMedia(`announcement-${Date.now()}`, processed)).media_url;
      }
      await saveAnnouncement(item?.id ?? null, next);
      await queryClient.invalidateQueries({ queryKey: announcementsQueryOptions.queryKey });
      await queryClient.invalidateQueries({ queryKey: ['announcements', 'live'] });
      clearDraft();
      await clearMedia();
      show({ message: staffContent.changesSaved, variant: 'success' });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Couldn’t save the announcement.';
      setError(message);
      show({ message, variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="event-editor" onSubmit={submit}>
      <TextField
        label={f.title}
        required
        value={draft.title}
        maxLength={80}
        onChange={(e) => set({ title: e.target.value })}
      />
      <div className="bt-field">
        <label className="bt-field__label" htmlFor={bodyId}>
          {f.body}
        </label>
        <textarea
          id={bodyId}
          className="bt-input"
          rows={3}
          maxLength={400}
          value={draft.body}
          onChange={(e) => set({ body: e.target.value })}
        />
      </div>
      <div className="request-grid">
        <TextField
          label={f.start}
          required
          type="datetime-local"
          value={starts}
          onChange={(e) => setStarts(e.target.value)}
        />
        <TextField
          label={f.end}
          required
          type="datetime-local"
          value={ends}
          onChange={(e) => setEnds(e.target.value)}
        />
      </div>
      <TextField
        label={f.href}
        hint={f.hrefHint}
        value={draft.href}
        onChange={(e) => set({ href: e.target.value })}
      />
      <TextField
        label={f.linkLabel}
        value={draft.linkLabel}
        onChange={(e) => set({ linkLabel: e.target.value })}
      />
      {draft.imageUrl && !file && (
        <div className="event-editor-photo">
          <img className="event-editor-photo-preview" src={draft.imageUrl} alt={draft.title} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={saving}
            aria-label={f.removePhoto}
            title={f.removePhoto}
            onClick={() => set({ imageUrl: null })}
          >
            <EditorIcon kind="trash" />
          </Button>
        </div>
      )}
      <FileUpload
        label={f.photo}
        browseLabel={f.browse}
        accept="image/*"
        multiple={false}
        size="sm"
        disabled={saving || !mediaReady}
        files={file ? [file] : []}
        onFilesChange={(files: File[]) => setFile(files[0] ?? null)}
      />
      <Checkbox checked={draft.published} onChange={(e) => set({ published: e.target.checked })}>
        {f.published}
      </Checkbox>
      {error && (
        <p className="request-error" role="alert">
          {error}
        </p>
      )}
      <div className="event-editor-actions">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            clearDraft();
            void clearMedia();
            onClose();
          }}
          disabled={saving}
        >
          {t.cancel}
        </Button>
        <Button type="submit" disabled={saving || !mediaReady}>
          {saving ? t.saving : t.save}
        </Button>
      </div>
    </form>
  );
}
