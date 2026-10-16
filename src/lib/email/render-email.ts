import { isSafeLink, type EmailBlock, type EmailDraft } from './blocks';
import { emailTheme as t } from './email-theme';

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapes first, then turns the tiny markup (**bold**, _italic_, [label](url), newlines) into HTML. */
export function renderRichText(text: string) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) =>
      isSafeLink(url.replace(/&amp;/g, '&'))
        ? `<a href="${url}" style="color:${t.forest};text-decoration:underline;">${label}</a>`
        : label,
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_(?=$|[\s.,!?)])/g, '$1<em>$2</em>')
    .replace(/\n/g, '<br>');
}

function renderBlock(block: EmailBlock) {
  switch (block.type) {
    case 'headline':
      return `<tr><td style="padding:8px 32px;font-family:${t.display};font-size:40px;line-height:1;font-weight:800;text-transform:uppercase;color:${t.forest};">${escapeHtml(block.text)}</td></tr>`;
    case 'text':
      return `<tr><td style="padding:8px 32px;font-family:${t.sans};font-size:16px;line-height:1.6;color:${t.ink};">${renderRichText(block.text)}</td></tr>`;
    case 'photo':
      return isSafeLink(block.url)
        ? `<tr><td style="padding:12px 32px;"><img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt)}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:1px solid ${t.tomato};"></td></tr>`
        : '';
    case 'button':
      return isSafeLink(block.url)
        ? `<tr><td style="padding:16px 32px;"><a href="${escapeHtml(block.url)}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:${t.forest};color:${t.mustard};font-family:${t.sans};font-weight:700;font-size:15px;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;">${escapeHtml(block.label)}</a></td></tr>`
        : '';
    case 'marquee':
      return `<tr><td style="padding:16px 0;"><div style="background:${t.mustard};border-top:1px solid ${t.tomato};border-bottom:1px solid ${t.tomato};padding:12px 16px;text-align:center;font-family:${t.serif};font-size:20px;color:${t.forest};">✦ ${escapeHtml(block.text)} ✦ ${escapeHtml(block.text)} ✦</div></td></tr>`;
  }
}

export interface RenderOptions {
  logoUrl: string;
  siteUrl: string;
  unsubscribeUrl: string;
  address: string;
}

/** One renderer for the staff preview and the sent email, so what staff see is what guests get. */
export function renderEmail(draft: EmailDraft, options: RenderOptions) {
  const body = draft.blocks.map(renderBlock).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(draft.subject)}</title></head>
<body style="margin:0;padding:0;background:${t.parchment};">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(draft.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${t.parchment};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${t.cream};border:1px solid ${t.tomato};">
<tr><td align="center" style="background:${t.forest};padding:24px;"><a href="${escapeHtml(options.siteUrl)}"><img src="${escapeHtml(options.logoUrl)}" alt="Bottega" height="56" style="display:block;height:56px;width:auto;border:0;"></a></td></tr>
<tr><td style="height:16px;"></td></tr>
${body}
<tr><td style="height:24px;"></td></tr>
<tr><td style="background:${t.forest};padding:24px 32px;font-family:${t.sans};font-size:13px;line-height:1.6;color:${t.cream};">
<span style="font-family:${t.serif};color:${t.mustard};font-size:16px;">#PastaIsLife</span><br>${escapeHtml(options.address)}<br>
You’re receiving this because you joined the Bottega Pasta Club. <a href="${escapeHtml(options.unsubscribeUrl)}" style="color:${t.mustard};">Unsubscribe</a>
</td></tr></table></td></tr></table></body></html>`;
  return html;
}

export function renderPlainText(draft: EmailDraft, unsubscribeUrl: string) {
  const lines = draft.blocks.map((b) => {
    if (b.type === 'button') return `${b.label}: ${b.url}`;
    if (b.type === 'photo') return '';
    return b.text.replace(/\*\*|(^|\s)_|_(?=\s|$)/g, '$1');
  });
  return `${lines.filter(Boolean).join('\n\n')}\n\nUnsubscribe: ${unsubscribeUrl}`;
}
