import { useCallback, useEffect, useMemo, useState } from 'react';
import { createLink, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button, Confirmation, Display, LinkAction, PillLabel, Serif, TextField } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import logoUrl from '@/design-system/bottega-f5161c/bottega/assets/logos/bottega-wordmark.png';
import { clubContent } from '@/content/en/club';
import { restaurantContent } from '@/content/en/restaurant';
import { useStaffSession } from '@/hooks/useStaffSession';
import {
  BLOCK_TYPES,
  duplicateBlock,
  insertBlockAt,
  moveBlock,
  newBlock,
  removeBlock,
  selectNeighbor,
  validateDraft, type EmailBlock, type EmailDraft } from '@/lib/email/blocks';
import {
  getCampaign,
  getTemplate,
  getWorkspace,
  saveCampaign,
  saveTemplate,
  sendCampaign,
  sendTestEmail,
} from '@/lib/email/club.functions';
import { renderEmail } from '@/lib/email/render-email';
import { BlockEditor } from './BlockEditor';
import { EmailCanvas } from './canvas/EmailCanvas';

const BackLink = createLink(LinkAction);
const t = clubContent.editor;
const w = clubContent.workspace;

const blankCampaign: EmailDraft = {
  subject: '',
  preheader: '',
  blocks: [newBlock('headline'), newBlock('text'), newBlock('button')],
};

type Workspace = Awaited<ReturnType<typeof getWorkspace>>;
type Props = { mode: 'compose'; campaignId?: string } | { mode: 'template'; templateKey: string };

/** Full-page WYSIWYG editor for staff: block list on the left, the exact email on the right. */
export function EmailEditorPage(props: Props) {
  const { isAdmin, ready } = useStaffSession();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<EmailDraft>(blankCampaign);
  const [campaignId, setCampaignId] = useState(props.mode === 'compose' ? props.campaignId : undefined);
  const [locked, setLocked] = useState(false);
  const [templateMeta, setTemplateMeta] = useState({ name: '', kind: '', variables: [] as string[] });
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [scheduleAt, setScheduleAt] = useState('');
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const loadWorkspace = useServerFn(getWorkspace);
  const loadCampaign = useServerFn(getCampaign);
  const loadTemplate = useServerFn(getTemplate);
  const saveTpl = useServerFn(saveTemplate);
  const saveDraftFn = useServerFn(saveCampaign);
  const test = useServerFn(sendTestEmail);
  const send = useServerFn(sendCampaign);

  const templateKey = props.mode === 'template' ? props.templateKey : null;
  const initialCampaign = props.mode === 'compose' ? props.campaignId : undefined;

  useEffect(() => {
    if (ready && !isAdmin) void navigate({ to: '/' });
  }, [ready, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadWorkspace().then(setWorkspace).catch(() => undefined);
    if (templateKey)
      void loadTemplate({ data: templateKey })
        .then((r) => {
          setDraft(r.draft);
          setTemplateMeta({ name: r.name, kind: r.kind, variables: r.variables });
        })
        .catch((e: Error) => setError(e.message));
    else if (initialCampaign)
      void loadCampaign({ data: initialCampaign })
        .then((r) => {
          setDraft(r.draft);
          setLocked(r.status !== 'draft' && r.status !== 'scheduled');
          if (r.scheduledFor) setScheduleAt(toLocalInput(r.scheduledFor));
        })
        .catch((e: Error) => setError(e.message));
  }, [isAdmin, templateKey, initialCampaign, loadWorkspace, loadTemplate, loadCampaign]);

  const html = useMemo(
    () =>
      renderEmail(draft, {
        logoUrl,
        siteUrl: '#',
        unsubscribeUrl: '#',
        locations: restaurantContent.addresses,
        editor: true,
      }),
    [draft],
  );

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
    setInsertAt(null);
  }, []);
  const move = (id: string, dir: -1 | 1) => setDraft((d) => ({ ...d, blocks: moveBlock(d.blocks, id, dir) }));
  const duplicate = (id: string) => {
    const r = duplicateBlock(draft.blocks, id);
    setDraft({ ...draft, blocks: r.blocks });
    select(r.id);
  };
  const insert = (type: EmailBlock['type']) => {
    const block = newBlock(type);
    setDraft((d) => ({ ...d, blocks: insertBlockAt(d.blocks, insertAt ?? d.blocks.length, block) }));
    select(block.id);
  };
  const confirmRemove = () => {
    if (!pendingRemove) return;
    setDraft((d) => ({ ...d, blocks: removeBlock(d.blocks, pendingRemove) }));
    if (selectedId === pendingRemove) select(null);
    setPendingRemove(null);
  };
  const onKey = useCallback(
    (key: string) => {
      if (key === 'Escape') select(null);
      else if (key === 'ArrowUp' || key === 'ArrowDown')
        setSelectedId((id) => selectNeighbor(draft.blocks, id, key === 'ArrowUp' ? -1 : 1));
      else if ((key === 'Delete' || key === 'Backspace') && selectedId) setPendingRemove(selectedId);
    },
    [draft.blocks, selectedId, select],
  );
  const selectedIndex = draft.blocks.findIndex((b) => b.id === selectedId);
  const selectedBlock = selectedIndex >= 0 ? draft.blocks[selectedIndex] : null;

  const updateBlock = (block: EmailBlock) =>
    setDraft((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === block.id ? block : b)) }));

  const run = async (action: () => Promise<string>) => {
    const problem = validateDraft(draft);
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      setNotice(await action());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const doTest = () =>
    run(async () => {
      const result = await test({ data: draft });
      if (!result.ok) throw new Error(`${result.error}`);
      return t.testSent(result.to);
    });

  const doSaveDraft = (scheduled?: string) =>
    run(async () => {
      const r = await saveDraftFn({ data: { id: campaignId, draft, scheduledFor: scheduled ?? null } });
      setCampaignId(r.id);
      return scheduled ? t.scheduled(new Date(scheduled).toLocaleString()) : t.draftSaved;
    });

  const doSend = () => {
    setConfirming(false);
    return run(async () => {
      const result = await send({ data: { id: campaignId, draft } });
      setCampaignId(result.id);
      setLocked(true);
      if (result.failed && !result.sent) throw new Error(result.error ?? 'Send failed');
      return t.sent(result.sent, result.failed);
    });
  };

  const doSaveTemplate = () =>
    run(async () => {
      await saveTpl({ data: { key: templateKey!, name: templateMeta.name || 'Template', draft } });
      return t.savedNote;
    });

  const starters = workspace?.templates.filter((tpl) => tpl.kind === 'newsletter') ?? [];
  const useStarter = async (key: string) => {
    const r = await loadTemplate({ data: key });
    setDraft(r.draft);
  };

  const title = props.mode === 'template' ? templateMeta.name || t.templateTitle : t.composeTitle;

  return (
    <>
      <BottegaHeader />
      <main className="email-page">
        <div className="email-page-inner">
          <BackLink to="/emails">{t.back}</BackLink>
          <Display as="h1" size="lg" tone="forest">
            {title}
          </Display>
          {templateMeta.kind === 'welcome' && <Serif tone="ink">{t.welcomeNote}</Serif>}
          {templateMeta.variables.length > 0 && <Serif tone="ink">{w.fields(templateMeta.variables)}</Serif>}
          {workspace && (
            <div className="email-staff-bar">
              <PillLabel variant="mustard">{clubContent.admin.subscribers(workspace.subscribers)}</PillLabel>
            </div>
          )}

          {!isAdmin ? (
            <p>{ready ? t.staffOnly : '…'}</p>
          ) : (
            <div className="email-workspace">
              <section className="email-controls" aria-label={t.blocks}>
                {locked && <p role="status">{t.alreadySent}</p>}
                <fieldset className="email-fieldset" disabled={locked}>
                  {props.mode === 'compose' && !campaignId && starters.length > 0 && (
                    <div className="email-add" aria-label={t.startFrom}>
                      <span className="bt-field__hint">{t.startFrom}</span>
                      {starters.map((s) => (
                        <Button key={s.key} size="sm" variant="cream" onClick={() => void useStarter(s.key)}>
                          {s.name}
                        </Button>
                      ))}
                    </div>
                  )}
                  <p className="bt-field__hint">{t.canvasHint}</p>
                  {insertAt !== null ? (
                    <>
                      <Serif as="h2" size="sm" tone="forest">
                        {t.insertTitle}
                      </Serif>
                      <div className="email-add">
                        {BLOCK_TYPES.map((type) => (
                          <Button key={type} size="sm" variant="ghost" onClick={() => insert(type)}>
                            <EditorIcon kind="plus" size="sm" />
                            {t.blockNames[type]}
                          </Button>
                        ))}
                      </div>
                      <div className="email-add">
                        <Button size="sm" variant="ghost" onClick={() => setInsertAt(null)}>
                          {t.cancelInsert}
                        </Button>
                      </div>
                    </>
                  ) : selectedBlock ? (
                    <>
                      <BlockEditor
                        key={selectedBlock.id}
                        block={selectedBlock}
                        first={selectedIndex === 0}
                        last={selectedIndex === draft.blocks.length - 1}
                        onChange={updateBlock}
                        onMove={(dir) => move(selectedBlock.id, dir)}
                        onRemove={() => setPendingRemove(selectedBlock.id)}
                      />
                      <div className="email-add">
                        <Button size="sm" variant="ghost" onClick={() => duplicate(selectedBlock.id)}>
                          <EditorIcon kind="copy" size="sm" />
                          {t.duplicate}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => select(null)}>
                          {t.deselect}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Serif as="h2" size="sm" tone="forest">
                        {t.emailSettings}
                      </Serif>
                  {props.mode === 'template' && (
                    <TextField
                      label={t.templateName}
                      value={templateMeta.name}
                      onChange={(e) => setTemplateMeta({ ...templateMeta, name: e.target.value })}
                    />
                  )}
                  <TextField
                    label={t.subject}
                    required
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  />
                  <TextField
                    label={t.preheader}
                    hint={t.preheaderHint}
                    value={draft.preheader}
                    onChange={(e) => setDraft({ ...draft, preheader: e.target.value })}
                  />
                      <div className="email-add">
                        {BLOCK_TYPES.map((type) => (
                          <Button
                            key={type}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              insert(type);
                            }}
                          >
                            + {t.blockNames[type]}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </fieldset>
                {error && (
                  <p className="bt-field__hint bt-field__hint--error" role="alert">
                    {error}
                  </p>
                )}
                {notice && <p role="status">{notice}</p>}
                {!locked && (
                  <div className="email-send">
                    <Button variant="outline" disabled={busy} onClick={() => void doTest()}>
                      {busy ? t.working : t.sendTest}
                    </Button>
                    {props.mode === 'template' ? (
                      <Button disabled={busy} onClick={() => void doSaveTemplate()}>
                        {t.save}
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" disabled={busy} onClick={() => void doSaveDraft()}>
                          {t.saveDraft}
                        </Button>
                        <Button
                          disabled={busy}
                          onClick={() => {
                            const problem = validateDraft(draft);
                            if (problem) setError(problem);
                            else setConfirming(true);
                          }}
                        >
                          {t.send}
                        </Button>
                      </>
                    )}
                  </div>
                )}
                {props.mode === 'compose' && !locked && (
                  <div className="email-send">
                    <TextField
                      label={t.scheduleAt}
                      type="datetime-local"
                      value={scheduleAt}
                      onChange={(e) => setScheduleAt(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      disabled={busy || !scheduleAt}
                      onClick={() => void doSaveDraft(new Date(scheduleAt).toISOString())}
                    >
                      {t.schedule}
                    </Button>
                  </div>
                )}
                <p className="bt-field__hint">{t.domainNote}</p>
              </section>
              <section className="email-preview" aria-label={t.preview}>
                <div className="email-block-head">
                  <Serif as="h2" size="sm" tone="forest">
                    {t.preview}
                  </Serif>
                  <div className="email-block-actions">
                    {(['desktop', 'phone'] as const).map((d) => (
                      <Button
                        key={d}
                        size="sm"
                        variant={device === d ? 'primary' : 'ghost'}
                        aria-pressed={device === d}
                        onClick={() => setDevice(d)}
                      >
                        {t[d]}
                      </Button>
                    ))}
                  </div>
                </div>
                <EmailCanvas
                  html={html}
                  device={device}
                  blocks={draft.blocks}
                  selectedId={selectedId}
                  disabled={locked}
                  onSelect={select}
                  onKey={onKey}
                  onMove={move}
                  onDuplicate={duplicate}
                  onRemove={setPendingRemove}
                  onInsert={setInsertAt}
                />
              </section>
            </div>
          )}
        </div>
        <Confirmation
          open={confirming}
          title={t.confirmTitle}
          confirmLabel={t.send}
          cancelLabel={w.cancel}
          pending={busy}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void doSend()}
        >
          {t.confirmBody(workspace?.subscribers ?? 0)}
        </Confirmation>
        <Confirmation
          open={pendingRemove !== null}
          variant="danger"
          title={t.removeTitle}
          confirmLabel={t.remove}
          cancelLabel={w.cancel}
          onCancel={() => setPendingRemove(null)}
          onConfirm={confirmRemove}
        >
          {t.removeBody}
        </Confirmation>
      </main>
    </>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}
