import { useCallback, useEffect, useState } from 'react';
import { createLink, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button, Card, Confirmation, Display, LinkAction, PillLabel, Serif, TextField } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { clubContent } from '@/content/en/club';
import { useStaffSession } from '@/hooks/useStaffSession';
import {
  deleteCampaign,
  duplicateTemplate,
  exportSubscribers,
  getCampaignReport,
  getWorkspace,
  listSubscribers,
  removeSubscriber,
} from '@/lib/email/club.functions';

const ActionLink = createLink(LinkAction);
const w = clubContent.workspace;
type Tab = keyof typeof w.tabs;
type Workspace = Awaited<ReturnType<typeof getWorkspace>>;
type Report = Awaited<ReturnType<typeof getCampaignReport>>;
type Subscriber = Awaited<ReturnType<typeof listSubscribers>>[number];

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '');

/** Staff home for Pasta Club email: newsletters, templates, subscribers and results. */
export function EmailsWorkspace() {
  const { isAdmin, ready } = useStaffSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('newsletters');
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useServerFn(getWorkspace);
  const refresh = useCallback(
    () =>
      void load()
        .then(setData)
        .catch((e: Error) => setError(e.message)),
    [load],
  );

  useEffect(() => {
    if (ready && !isAdmin) void navigate({ to: '/' });
    if (isAdmin) refresh();
  }, [ready, isAdmin, navigate, refresh]);

  return (
    <>
      <BottegaHeader />
      <main className="email-page">
        <div className="email-page-inner">
          <Display as="h1" size="lg" tone="forest">
            {w.title}
          </Display>
          {!isAdmin ? (
            <p>{ready ? clubContent.editor.staffOnly : '…'}</p>
          ) : (
            <>
              <div className="email-staff-bar" role="tablist" aria-label={w.title}>
                {(Object.keys(w.tabs) as Tab[]).map((key) => (
                  <Button
                    key={key}
                    role="tab"
                    size="sm"
                    aria-selected={tab === key}
                    variant={tab === key ? 'primary' : 'outline'}
                    onClick={() => setTab(key)}
                  >
                    {w.tabs[key]}
                  </Button>
                ))}
                {data && <PillLabel variant="mustard">{clubContent.admin.subscribers(data.subscribers)}</PillLabel>}
              </div>
              {error && (
                <p className="bt-field__hint bt-field__hint--error" role="alert">
                  {error}
                </p>
              )}
              <div role="tabpanel">
                {tab === 'newsletters' && <Newsletters data={data} onChange={refresh} />}
                {tab === 'templates' && <Templates data={data} onChange={refresh} />}
                {tab === 'subscribers' && <Subscribers />}
                {tab === 'analytics' && <Analytics data={data} />}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function Newsletters({ data, onChange }: { data: Workspace | null; onChange: () => void }) {
  const remove = useServerFn(deleteCampaign);
  const [pending, setPending] = useState<string | null>(null);
  return (
    <div className="email-list">
      <div>
        <ActionLink to="/emails/compose">{w.newNewsletter}</ActionLink>
      </div>
      {!data?.campaigns.length ? (
        <p>{w.noNewsletters}</p>
      ) : (
        data.campaigns.map((c) => (
          <Card key={c.id} variant="white" shape="rect">
            <div className="email-row">
              <div className="email-row-main">
                <PillLabel variant={c.status === 'sent' ? 'chip-forest' : 'chip-terracotta'}>
                  {w.status[c.status] ?? c.status}
                </PillLabel>
                <Serif as="h2" size="sm" tone="forest">
                  {c.subject || '—'}
                </Serif>
                <span className="bt-field__hint">
                  {c.status === 'sent'
                    ? `${date(c.sent_at)} · ${c.recipient_count} ${w.metrics.sent.toLowerCase()}`
                    : c.status === 'scheduled'
                      ? date(c.scheduled_for)
                      : date(c.updated_at)}
                </span>
              </div>
              <div className="email-block-actions">
                <ActionLink to="/emails/compose" search={{ id: c.id }}>
                  {c.status === 'sent' ? w.report : w.edit}
                </ActionLink>
                {(c.status === 'draft' || c.status === 'scheduled') && (
                  <Button size="sm" variant="ghost" onClick={() => setPending(c.id)}>
                    {w.remove}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
      <Confirmation
        open={pending !== null}
        variant="danger"
        title={w.confirmDeleteTitle}
        confirmLabel={w.remove}
        cancelLabel={w.cancel}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          const id = pending!;
          setPending(null);
          void remove({ data: id }).then(onChange);
        }}
      >
        {w.confirmDeleteBody}
      </Confirmation>
    </div>
  );
}

function Templates({ data, onChange }: { data: Workspace | null; onChange: () => void }) {
  const duplicate = useServerFn(duplicateTemplate);
  return (
    <div className="email-list">
      {data?.templates.map((tpl) => (
        <Card key={tpl.key} variant="white" shape="rect">
          <div className="email-row">
            <div className="email-row-main">
              <PillLabel variant="chip-forest">{w.kinds[tpl.kind] ?? tpl.kind}</PillLabel>
              <Serif as="h2" size="sm" tone="forest">
                {tpl.name || tpl.key}
              </Serif>
              <span className="bt-field__hint">{tpl.subject}</span>
              {tpl.variables.length > 0 && <span className="bt-field__hint">{w.fields(tpl.variables)}</span>}
            </div>
            <div className="email-block-actions">
              <ActionLink to="/emails/template/$key" params={{ key: tpl.key }}>
                {w.edit}
              </ActionLink>
              <Button size="sm" variant="outline" onClick={() => void duplicate({ data: tpl.key }).then(onChange)}>
                {w.duplicate}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Subscribers() {
  const list = useServerFn(listSubscribers);
  const remove = useServerFn(removeSubscriber);
  const exportList = useServerFn(exportSubscribers);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [pending, setPending] = useState<Subscriber | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => void list({ data: search }).then(setRows), 250);
    return () => clearTimeout(timer);
  }, [search, list]);

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
    <div className="email-list">
      <div className="email-send">
        <TextField label={w.search} type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button size="sm" variant="outline" onClick={() => void download()}>
          {clubContent.admin.download}
        </Button>
      </div>
      {!rows.length ? (
        <p>{w.noSubscribers}</p>
      ) : (
        <ul className="email-subscribers">
          {rows.map((s) => (
            <li key={s.id} className="email-row">
              <div className="email-row-main">
                <span>{s.email}</span>
                <span className="bt-field__hint">{new Date(s.consent_at).toLocaleDateString()}</span>
              </div>
              <div className="email-block-actions">
                <PillLabel variant={s.status === 'active' ? 'chip-forest' : 'chip-terracotta'}>
                  {w.subscriberStatus[s.status] ?? s.status}
                </PillLabel>
                <Button size="sm" variant="ghost" onClick={() => setPending(s)}>
                  {w.removeSubscriber}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Confirmation
        open={pending !== null}
        variant="danger"
        title={w.confirmRemoveTitle}
        confirmLabel={w.removeSubscriber}
        cancelLabel={w.cancel}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          const s = pending!;
          setPending(null);
          void remove({ data: s.id }).then(() => setRows((r) => r.filter((x) => x.id !== s.id)));
        }}
      >
        {pending ? w.confirmRemoveBody(pending.email) : ''}
      </Confirmation>
    </div>
  );
}

function Analytics({ data }: { data: Workspace | null }) {
  const loadReport = useServerFn(getCampaignReport);
  const sent = data?.campaigns.filter((c) => c.status === 'sent') ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (selected) void loadReport({ data: selected }).then(setReport);
  }, [selected, loadReport]);

  return (
    <div className="email-list">
      <p className="bt-field__hint">{w.trackingNote}</p>
      <div className="email-add">
        {sent.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={selected === c.id ? 'primary' : 'outline'}
            aria-pressed={selected === c.id}
            onClick={() => setSelected(c.id)}
          >
            {c.subject}
          </Button>
        ))}
      </div>
      {!selected || !report ? (
        <p>{w.pickNewsletter}</p>
      ) : (
        <>
          <div className="email-metrics">
            {(Object.keys(w.metrics) as (keyof typeof w.metrics)[]).map((key) => (
              <Card key={key} variant="cream" shape="rect">
                <div className="email-metric">
                  <Display as="p" size="md" tone="forest">
                    {report[key]}
                  </Display>
                  <span>{w.metrics[key]}</span>
                </div>
              </Card>
            ))}
          </div>
          <Serif as="h2" size="sm" tone="forest">
            {w.topLinks}
          </Serif>
          {report.topLinks.length ? (
            <ul>
              {report.topLinks.map((l) => (
                <li key={l.url}>
                  {l.url} — {l.count}
                </li>
              ))}
            </ul>
          ) : (
            <p>{w.noClicks}</p>
          )}
        </>
      )}
    </div>
  );
}
