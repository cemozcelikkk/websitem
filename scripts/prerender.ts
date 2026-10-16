// `vite build` (istemci) ve `vite build --ssr` sonrasında çalışır:
// her adres için dist/<adres>/index.html, ayrıca 404.html, sitemap.xml ve rss.xml üretir.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

interface ServerEntry {
  render(url: string): Promise<{ html: string; head: string; status: number }>;
  allPaths(): string[];
  sitemapEntries(): { path: string; lastmod?: string }[];
  feedItems(): { title: string; path: string; date: string; description: string; category: string }[];
  absoluteUrl(path: string): string;
  showDrafts: boolean;
  SITE: { url: string; name: string; description: string; email: string };
}

const root = process.cwd();
const dist = path.join(root, 'dist');
const server: ServerEntry = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--app-head-->')) {
  throw new Error('dist/index.html içinde <!--app-html--> / <!--app-head--> yer tutucuları yok.');
}

const xml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

async function writePage(url: string, outFile: string, expectedStatus: number) {
  const { html, head, status } = await server.render(url);
  if (status !== expectedStatus) throw new Error(`${url} için beklenen durum ${expectedStatus}, gelen ${status}`);
  if (!html.trim()) throw new Error(`${url} boş HTML üretti`);
  const page = template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, page);
}

const paths = server.allPaths();
for (const url of paths) {
  const out = url === '/' ? path.join(dist, 'index.html') : path.join(dist, ...url.slice(1).split('/'), 'index.html');
  await writePage(url, out, 200);
}
await writePage('/404', path.join(dist, '404.html'), 404);

if (server.showDrafts) {
  console.warn("\n⚠  Bu build TASLAKLARI içeriyor (drafts modu). Production'a deploy ETME.\n");
}

// sitemap.xml — taslaklar hariç (yazılar, rehber konuları ve bölümleri)
const sitemapUrls = server.sitemapEntries().map(
  ({ path: p, lastmod }) => `  <url><loc>${xml(server.absoluteUrl(p))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
);
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`,
);

// rss.xml — yayımlanmış yazılar ve tarihli rehber bölümleri, yeniden eskiye
const { SITE } = server;
const feed = server.feedItems();
const items = feed.map((item) => {
  const link = server.absoluteUrl(item.path);
  return [
    '    <item>',
    `      <title>${xml(item.title)}</title>`,
    `      <link>${xml(link)}</link>`,
    `      <guid isPermaLink="true">${xml(link)}</guid>`,
    `      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>`,
    `      <description>${xml(item.description)}</description>`,
    `      <category>${xml(item.category)}</category>`,
    '    </item>',
  ].join('\n');
});
await writeFile(
  path.join(dist, 'rss.xml'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${xml(SITE.name)} — Yazılar</title>`,
    `    <link>${xml(SITE.url)}/blog</link>`,
    `    <description>${xml(SITE.description)}</description>`,
    '    <language>tr</language>',
    `    <atom:link href="${xml(SITE.url)}/rss.xml" rel="self" type="application/rss+xml" />`,
    ...(feed[0] ? [`    <lastBuildDate>${new Date(`${feed[0].date}T00:00:00Z`).toUTCString()}</lastBuildDate>`] : []),
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n'),
);

console.log(`prerender: ${paths.length} sayfa + 404.html, sitemap.xml (${sitemapUrls.length} adres), rss.xml (${items.length} öğe)`);
