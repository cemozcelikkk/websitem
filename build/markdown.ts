// Markdown → HTML. Yalnızca build sırasında (Node) çalışır; tarayıcıya parser gönderilmez.
// İçerik yazarın kendi reposundan geldiği için ham HTML'e izin verilir; uzaktan içerik
// çekilmez ve hiçbir içerik kod olarak çalıştırılmaz.
import { Marked, Renderer, type Tokens } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';
import type { TocItem } from '../src/content/types.ts';

const LANGS = [
  'ts', 'tsx', 'js', 'jsx', 'json', 'jsonc', 'bash', 'sh', 'shellsession', 'powershell',
  'python', 'sql', 'yaml', 'toml', 'ini', 'dockerfile', 'nginx', 'html', 'css', 'xml',
  'markdown', 'diff', 'kotlin', 'swift', 'dart', 'go', 'rust', 'c', 'cpp', 'java', 'docker',
] as const;

/** Terminal/çıktı görünümü alacak dil etiketleri. */
const TERMINAL_LANGS = new Set(['console', 'terminal', 'shellsession', 'output', 'error', 'hata']);
const ERROR_LANGS = new Set(['error', 'hata']);

/** `> [!NOT]` gibi teknik not kutuları. GitHub adları ve Türkçe karşılıkları desteklenir. */
const CALLOUTS: Record<string, { kind: string; label: string }> = {
  NOTE: { kind: 'note', label: 'Not' },
  NOT: { kind: 'note', label: 'Not' },
  TIP: { kind: 'tip', label: 'İpucu' },
  IPUCU: { kind: 'tip', label: 'İpucu' },
  IMPORTANT: { kind: 'important', label: 'Önemli' },
  ONEMLI: { kind: 'important', label: 'Önemli' },
  WARNING: { kind: 'warning', label: 'Uyarı' },
  UYARI: { kind: 'warning', label: 'Uyarı' },
  CAUTION: { kind: 'caution', label: 'Dikkat' },
  DIKKAT: { kind: 'caution', label: 'Dikkat' },
};

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ['vitesse-light', 'vitesse-dark'],
    langs: [...LANGS],
  });
  return highlighterPromise;
}

const TR_MAP: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };

/** Türkçe karakterleri sadeleştirerek URL/id uyumlu slug üretir. */
export function slugify(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşüâîû]/g, (ch) => TR_MAP[ch] ?? ch)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/** Okuma süresi (dakika): düz metin 200 kelime/dk, kod satırları daha yavaş okunur sayılır. */
export function readingMinutes(markdown: string): number {
  let codeLines = 0;
  const prose = markdown.replace(/```[\s\S]*?```/g, (block) => {
    codeLines += block.split('\n').length - 2;
    return ' ';
  });
  const words = prose
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#>*_`[\]()!|-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200 + codeLines / 40));
}

export interface RenderedMarkdown {
  html: string;
  toc: TocItem[];
  hasMermaid: boolean;
}

export async function renderMarkdown(markdown: string, source = 'markdown'): Promise<RenderedMarkdown> {
  const highlighter = await getHighlighter();
  const loaded = new Set(highlighter.getLoadedLanguages());
  const toc: TocItem[] = [];
  const usedIds = new Map<string, number>();
  let hasMermaid = false;

  const renderer = new Renderer();

  renderer.heading = function ({ tokens, depth }: Tokens.Heading) {
    if (depth === 1) {
      throw new Error(`${source}: Gövdede "# " (h1) kullanma; sayfa başlığı title alanından gelir. "## " ile başla.`);
    }
    const inner = this.parser.parseInline(tokens);
    const text = stripTags(inner);
    const base = slugify(text) || 'baslik';
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;
    if (depth === 2 || depth === 3) toc.push({ id, text, depth });
    return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}">${inner}</a></h${depth}>\n`;
  };

  renderer.code = function ({ text, lang }: Tokens.Code) {
    const info = (lang ?? '').trim();
    const language = (info.match(/^\S*/)?.[0] ?? '').toLowerCase();
    const title = info.match(/title="([^"]+)"/)?.[1];

    if (language === 'mermaid') {
      hasMermaid = true;
      return `<figure class="mermaid-block"><pre class="mermaid">${escapeHtml(text)}</pre></figure>\n`;
    }

    const terminal = TERMINAL_LANGS.has(language);
    let shikiLang = language === 'console' || language === 'terminal' ? 'shellsession' : language;
    if (language === 'output' || ERROR_LANGS.has(language)) shikiLang = 'text';
    if (shikiLang && shikiLang !== 'text' && !loaded.has(shikiLang)) {
      console.warn(`[content] ${source}: "${language}" dili için vurgulama yok, düz metin kullanılıyor.`);
      shikiLang = 'text';
    }

    const highlighted = highlighter.codeToHtml(text, {
      lang: shikiLang || 'text',
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
      defaultColor: false,
    });

    const label = title ?? (language === 'output' ? 'çıktı' : ERROR_LANGS.has(language) ? 'hata çıktısı' : terminal ? 'terminal' : language || 'kod');
    return (
      `<figure class="code-block${terminal ? ' code-block--terminal' : ''}${ERROR_LANGS.has(language) ? ' code-block--error' : ''}">` +
      `<figcaption><span>${escapeHtml(label)}</span>` +
      `<button type="button" class="copy-button" data-copy-code>Kopyala</button></figcaption>` +
      `${highlighted}</figure>\n`
    );
  };

  renderer.blockquote = function (token: Tokens.Blockquote) {
    const inner = this.parser.parse(token.tokens);
    const match = inner.match(/^<p>\[!([A-Za-z]+)\]\s*/);
    const callout = match && CALLOUTS[match[1].toUpperCase()];
    if (!callout) return `<blockquote>\n${inner}</blockquote>\n`;
    // "[!NOT]" ayrı satırdaysa kalan metin aynı paragrafta devam eder; tek başınaysa paragraf kapanır.
    let rest = inner.slice(match[0].length);
    rest = rest.startsWith('</p>') ? rest.slice(4).trimStart() : `<p>${rest}`;
    return `<aside class="callout callout--${callout.kind}" role="note"><p class="callout-title">${callout.label}</p>${rest}</aside>\n`;
  };

  renderer.table = function (token: Tokens.Table) {
    return `<div class="table-wrap" tabindex="0" role="region" aria-label="Tablo">${Renderer.prototype.table.call(this, token)}</div>\n`;
  };

  renderer.image = function ({ href, title, text }: Tokens.Image) {
    const img = `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async" />`;
    const caption = title ? `<figcaption>${escapeHtml(title)}</figcaption>` : '';
    return `<figure class="article-figure">${img}${caption}</figure>`;
  };

  // Tek başına duran görseller <p> içine değil, doğrudan <figure> olarak yazılır.
  renderer.paragraph = function (token: Tokens.Paragraph) {
    const only = token.tokens.filter((t) => !(t.type === 'text' && !t.raw.trim()));
    if (only.length === 1 && only[0].type === 'image') {
      return this.parser.parseInline(token.tokens) + '\n';
    }
    return Renderer.prototype.paragraph.call(this, token);
  };

  renderer.link = function (token: Tokens.Link) {
    const html = Renderer.prototype.link.call(this, token);
    if (/^https?:\/\//.test(token.href)) {
      return html.replace('<a ', '<a target="_blank" rel="noopener noreferrer" ');
    }
    return html;
  };

  const marked = new Marked({ gfm: true, renderer });
  const html = await marked.parse(markdown);
  return { html, toc, hasMermaid };
}
