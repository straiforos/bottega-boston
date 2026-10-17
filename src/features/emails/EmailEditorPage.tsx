import { useEffect, useMemo, useState } from 'react';
import { createLink, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import {
  Button,
  Card,
  Confirmation,
  Display,
  LinkAction,
  PillLabel,
  Serif,
  TextField,
} from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import logoUrl from '@/design-system/bottega-f5161c/bottega/assets/logos/bottega-wordmark.png';
import { clubContent } from '@/content/en/club';
import { restaurantContent } from '@/content/en/restaurant';
import { useStaffSession } from '@/hooks/useStaffSession';
import {
  defaultWelcome,
  moveBlock,
  newBlock,
  validateDraft,
  type EmailBlock,
  type EmailBlockType,
  type EmailDraft,
} from '@/lib/email/blocks';
import {
  exportSubscribers,
  getClubOverview,
  getWelcomeTemplate,
  saveWelcomeTemplate,
  sendCampaign,
  sendTestEmail,
} from '@/lib/email/club.functions';
import { renderEmail } from '@/lib/email/render-email';
import { BlockEditor } from './BlockEditor';

const BackLink = createLink(LinkAction);
const EditorLink = createLink(LinkAction);
const t = clubContent.editor;
const blockTypes: EmailBlockType[] = ['headline', 'text', 'photo', 'button', 'marquee'];
const address = restaurantContent.addresses.map((a) => `${a.name}, ${a.lines.join(', ')}`).join(' · ');

const blankCampaign: EmailDraft = {
  subject: '',
  preheader: '',
  blocks: [newBlock('headline'), newBlock('text'), newBlock('button')],
};

type Overview = Awaited<ReturnType<typeof getClubOverview>>;

/** Full-page WYSIWYG editor for staff: block list on the left, the exact email on the right. */
export function EmailEditorPage({ mode }: { mode: 'compose' | 'welcome' }) {
  const { isAdmin, ready, user } = useStaffSession();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<EmailDraft>(mode === 'welcome' ? defaultWelcome : blankCampaign);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const loadOverview = useServerFn(getClubOverview);
  const loadWelcome = useServerFn(getWelcomeTemplate);
  const save = useServerFn(saveWelcomeTemplate);
  const test = useServerFn(sendTestEmail);
  const send = useServerFn(sendCampaign);
  const exportList = useServerFn(exportSubscribers);

  useEffect(() => {
    if (ready && !user) void navigate({ to: '/' });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadOverview()
      .then(setOverview)
      .catch(() => undefined);
    if (mode === 'welcome')
      void loadWelcome()
        .then(setDraft)
        .catch(() => undefined);
  }, [isAdmin, mode, loadOverview, loadWelcome]);

  const html = useMemo(() => renderEmail(draft, { logoUrl, siteUrl: '#', unsubscribeUrl: '#', address }), [draft]);

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

  const doSend = () => {
    setConfirming(false);
    return run(async () => {
      const result = await send({ data: draft });
      setOverview(await loadOverview());
      if (result.failed && !result.sent) throw new Error(result.error ?? 'Send failed');
      return t.sent(result.sent, result.failed);
    });
  };

  const doSave = () =>
    run(async () => {
      await save({ data: draft });
      return t.savedNote;
    });

  const download = async () => {
    const csv = await exportList();
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pasta-club.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <BottegaHeader />
      <main className="email-page">
        <div className="email-page-inner">
          <BackLink to="/" hash="club">
            {t.back}
          </BackLink>
          <Display as="h1" size="lg" tone="forest">
            {mode === 'welcome' ? t.welcomeTitle : t.composeTitle}
          </Display>
          {mode === 'welcome' && <Serif tone="ink">{t.welcomeNote}</Serif>}

          {isAdmin && (
            <div className="email-staff-bar">
              {overview && (
                <PillLabel variant="mustard">{clubContent.admin.subscribers(overview.subscribers)}</PillLabel>
              )}
              <EditorLink to={mode === 'compose' ? '/emails/welcome' : '/emails/compose'}>
                {mode === 'compose' ? clubContent.admin.welcome : clubContent.admin.compose}
              </EditorLink>
              <Button size="sm" variant="primary" onClick={() => void download()}>
                {clubContent.admin.download}
              </Button>
            </div>
          )}

          {!isAdmin ? (
            <p>{ready ? t.staffOnly : '…'}</p>
          ) : (
            <div className="email-workspace">
              <section className="email-controls" aria-label={t.blocks}>
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
                {draft.blocks.map((block, index) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    first={index === 0}
                    last={index === draft.blocks.length - 1}
                    onChange={updateBlock}
                    onMove={(dir) => setDraft((d) => ({ ...d, blocks: moveBlock(d.blocks, block.id, dir) }))}
                    onRemove={() => setDraft((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== block.id) }))}
                  />
                ))}
                <div className="email-add">
                  {blockTypes.map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant="outline"
                      onClick={() => setDraft((d) => ({ ...d, blocks: [...d.blocks, newBlock(type)] }))}
                    >
                      + {t.blockNames[type]}
                    </Button>
                  ))}
                </div>
                {error && (
                  <p className="bt-field__hint bt-field__hint--error" role="alert">
                    {error}
                  </p>
                )}
                {notice && <p role="status">{notice}</p>}
                <div className="email-send">
                  <Button variant="outline" disabled={busy} onClick={() => void doTest()}>
                    {busy ? t.working : t.sendTest}
                  </Button>
                  {mode === 'welcome' ? (
                    <Button disabled={busy} onClick={() => void doSave()}>
                      {t.save}
                    </Button>
                  ) : (
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
                  )}
                </div>
                <p className="bt-field__hint">{t.domainNote}</p>

                {mode === 'compose' && (
                  <Card variant="cream" shape="rect">
                    <div className="email-history">
                      <Serif as="h2" size="sm" tone="forest">
                        {t.history}
                      </Serif>
                      {overview?.campaigns.length ? (
                        <ul>
                          {overview.campaigns.map((c) => (
                            <li key={c.id}>
                              {new Date(c.sent_at).toLocaleDateString()} — {c.subject} ({c.recipient_count})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{t.noHistory}</p>
                      )}
                    </div>
                  </Card>
                )}
              </section>
              <section className="email-preview" aria-label={t.preview}>
                <Serif as="h2" size="sm" tone="forest">
                  {t.preview}
                </Serif>
                <iframe className="email-preview-frame" title={t.preview} srcDoc={html} sandbox="" />
              </section>
            </div>
          )}
        </div>
        <Confirmation
          open={confirming}
          title={t.confirmTitle}
          confirmLabel={t.send}
          cancelLabel="Cancel"
          pending={busy}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void doSend()}
        >
          {t.confirmBody(overview?.subscribers ?? 0)}
        </Confirmation>
      </main>
    </>
  );
}
