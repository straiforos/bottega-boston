import { renderToStaticMarkup, type TReaderDocument } from '@usewaypoint/email-builder';
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

export interface RenderOptions {
  logoUrl: string;
  siteUrl: string;
  unsubscribeUrl: string;
  locations: readonly EmailLocation[];
  /** Staff canvas only: adds block anchors and a selection script. Never set for sends. */
  editor?: boolean;
}

/** A shop's postal address. The footer links each one itself so mail clients never auto-link it in their own blue. */
export interface EmailLocation {
  name: string;
  lines: readonly string[];
}

type Doc = Record<string, unknown>;
const pad = (top: number, side: number) => ({ top, bottom: top, left: side, right: side });
const html = (contents: string, padding = pad(8, 32)) => ({
  type: 'Html',
  data: { style: { padding }, props: { contents } },
});
const image = (url: string, alt: string, padding = pad(12, 32)) => ({
  type: 'Image',
  data: { style: { padding }, props: { url, alt, contentAlignment: 'middle' } },
});

const fullAddress = (location: EmailLocation) => `${location.name}, ${location.lines.join(', ')}`;
const mapsUrl = (location: EmailLocation) =>
  `https://maps.google.com/?q=${encodeURIComponent(`${location.name} ${location.lines.join(' ')}`)}`;
/** An explicit anchor: clients only impose their blue underline on text they linkify themselves. */
const addressLink = (location: EmailLocation) =>
  `<a href="${escapeHtml(mapsUrl(location))}" style="color:${t.mustardDeep};text-decoration:none;">${escapeHtml(fullAddress(location))}</a>`;

/** Bottega blocks → Waypoint document blocks (one or more ids per block). */
function toWaypoint(block: EmailBlock, doc: Doc): string[] {
  const id = block.id;
  switch (block.type) {
    case 'headline':
      doc[id] = html(
        `<div style="font-family:${t.display};font-size:40px;line-height:1;font-weight:800;text-transform:uppercase;color:${t.forest};">${escapeHtml(block.text)}</div>`,
      );
      return [id];
    case 'text':
      doc[id] = html(
        `<div style="font-family:${t.sans};font-size:16px;line-height:1.6;color:${t.ink};">${renderRichText(block.text)}</div>`,
      );
      return [id];
    case 'photo':
      if (!isSafeLink(block.url)) return [];
      doc[id] = image(block.url, block.alt);
      return [id];
    case 'columns': {
      if (!isSafeLink(block.left.url) || !isSafeLink(block.right.url)) return [];
      doc[`${id}-l`] = image(block.left.url, block.left.alt, pad(0, 0));
      doc[`${id}-r`] = image(block.right.url, block.right.alt, pad(0, 0));
      doc[id] = {
        type: 'ColumnsContainer',
        data: {
          style: { padding: pad(12, 32) },
          props: {
            columnsCount: 2,
            columnsGap: 12,
            columns: [{ childrenIds: [`${id}-l`] }, { childrenIds: [`${id}-r`] }, { childrenIds: [] }],
          },
        },
      };
      return [id];
    }
    case 'button':
      if (!isSafeLink(block.url)) return [];
      doc[id] = {
        type: 'Button',
        data: {
          style: { padding: pad(16, 32), textAlign: 'left' },
          props: {
            text: block.label.toUpperCase(),
            url: block.url,
            buttonStyle: 'pill',
            size: 'large',
            buttonBackgroundColor: t.forest,
            buttonTextColor: t.mustard,
          },
        },
      };
      return [id];
    case 'marquee':
      doc[id] = html(
        `<div style="background:${t.mustard};border-top:1px solid ${t.terracotta};border-bottom:1px solid ${t.terracotta};padding:12px 16px;text-align:center;font-family:${t.serif};font-size:20px;color:${t.forest};">✦ ${escapeHtml(block.text)} ✦ ${escapeHtml(block.text)} ✦</div>`,
        pad(16, 0),
      );
      return [id];
    case 'divider':
      doc[id] = {
        type: 'Divider',
        data: { style: { padding: pad(16, 32) }, props: { lineColor: t.terracotta, lineHeight: 1 } },
      };
      return [id];
    case 'spacer':
      doc[id] = { type: 'Spacer', data: { props: { height: 24 } } };
      return [id];
  }
}

/** Builds the Waypoint document for a draft, wrapped in the Bottega header and footer. */
export function toWaypointDocument(draft: EmailDraft, options: RenderOptions): TReaderDocument {
  const doc: Doc = {};
  doc.header = html(
    `<div style="text-align:center;border-bottom:1px solid ${t.terracotta};padding-bottom:24px;"><a href="${escapeHtml(options.siteUrl)}"><img src="${escapeHtml(options.logoUrl)}" alt="Bottega" height="56" style="display:inline-block;height:56px;width:auto;border:0;"></a></div>`,
    pad(24, 24),
  );
  const anchor = (id: string) => {
    doc[`anchor-${id}`] = html(`<div data-bt-anchor="${escapeHtml(id)}"></div>`, pad(0, 0));
    return `anchor-${id}`;
  };
  const body = draft.blocks.flatMap((b) => {
    const ids = toWaypoint(b, doc);
    return options.editor ? [anchor(b.id), ...ids] : ids;
  });
  if (options.editor) body.push(anchor('__end'));
  doc.footer = html(
    `<div style="background:${t.forest};padding:24px 32px;font-family:${t.sans};font-size:13px;line-height:1.6;color:${t.cream};"><span style="font-family:${t.serif};color:${t.mustard};font-size:16px;">#PastaIsLife</span><br>${options.locations.map(addressLink).join('<br>')}<br>You’re receiving this because you joined the Bottega Pasta Club. <a href="${escapeHtml(options.unsubscribeUrl)}" style="color:${t.mustard};">Unsubscribe</a></div>`,
    pad(24, 0),
  );
  doc.root = {
    type: 'EmailLayout',
    data: {
      backdropColor: t.parchment,
      canvasColor: t.cream,
      borderColor: t.terracotta,
      borderRadius: 0,
      textColor: t.ink,
      fontFamily: 'MODERN_SANS',
      childrenIds: ['header', ...body, 'footer'],
    },
  };
  return doc as TReaderDocument;
}

const FONTS =
  '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Domine&family=DM+Sans:wght@400;700&display=swap" rel="stylesheet">';

/** One renderer for the staff preview and the sent email, so what staff see is what guests get. */
export function renderEmail(draft: EmailDraft, options: RenderOptions) {
  const markup = renderToStaticMarkup(toWaypointDocument(draft, options), { rootBlockId: 'root' });
  return markup
    .replace('<head>', `<head>${FONTS}<title>${escapeHtml(draft.subject)}</title>`)
    .replace(
      /<body([^>]*)>/,
      `<body$1 style="margin:0;"><div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(draft.preheader)}</div>`,
    )
    .replace('<html>', '<html lang="en">')
    .replace('</body>', options.editor ? `<script>${CANVAS_SCRIPT}</script></body>` : '</body>');
}

/** Runs inside the sandboxed preview iframe: reports block positions, hover, clicks and keys to the editor. */
const CANVAS_SCRIPT = `(function(){
var post=function(m){parent.postMessage(Object.assign({source:'bt-canvas'},m),'*')};
var anchors=function(){return Array.prototype.slice.call(document.querySelectorAll('[data-bt-anchor]'))};
var rects=function(){var a=anchors(),out=[];for(var i=0;i<a.length-1;i++){var t=a[i].getBoundingClientRect().top+scrollY,b=a[i+1].getBoundingClientRect().top+scrollY;out.push({id:a[i].getAttribute('data-bt-anchor'),top:t,height:Math.max(b-t,8)})}return out};
var report=function(){post({type:'rects',rects:rects(),scrollY:scrollY,width:document.documentElement.clientWidth})};
var at=function(y){var r=rects(),py=y+scrollY;for(var i=0;i<r.length;i++){if(py>=r[i].top&&py<r[i].top+r[i].height)return r[i].id}return null};
addEventListener('mousemove',function(e){post({type:'hover',id:at(e.clientY)})});
addEventListener('mouseleave',function(){post({type:'hover',id:null})});
addEventListener('click',function(e){e.preventDefault();post({type:'select',id:at(e.clientY)})},true);
addEventListener('keydown',function(e){if(['ArrowUp','ArrowDown','Delete','Backspace','Escape'].indexOf(e.key)>-1){e.preventDefault();post({type:'key',key:e.key})}});
addEventListener('scroll',report);addEventListener('resize',report);addEventListener('load',report);
Array.prototype.forEach.call(document.images,function(i){i.addEventListener('load',report)});
report();
})();`;

export function renderPlainText(draft: EmailDraft, unsubscribeUrl: string) {
  const lines = draft.blocks.map((b) => {
    if (b.type === 'button') return `${b.label}: ${b.url}`;
    if (b.type === 'headline' || b.type === 'text' || b.type === 'marquee')
      return b.text.replace(/\*\*|(^|\s)_|_(?=\s|$)/g, '$1');
    return '';
  });
  return `${lines.filter(Boolean).join('\n\n')}\n\nUnsubscribe: ${unsubscribeUrl}`;
}
