// `npm run build` sonrasında dist/ çıktısını doğrular: npm run test:dist
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const dist = path.resolve('dist');
const read = (file: string) => readFileSync(path.join(dist, file), 'utf8');

function allFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? allFiles(full) : [full];
  });
}

/** Bir klasördeki draft: true .md dosyalarının slug'ları (index.md hariç) */
function draftSlugsIn(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .filter((f) => /^draft:\s*true\s*$/m.test(readFileSync(path.join(dir, f), 'utf8')))
    .map((f) => readFileSync(path.join(dir, f), 'utf8').match(/^slug:\s*(\S+)/m)?.[1] ?? f.replace(/\.md$/, ''));
}

/** content/blog ve content/guides/<konu> içindeki taslakların slug'ları */
function draftSlugs(): string[] {
  const guides = path.resolve('content/guides');
  return [
    ...draftSlugsIn(path.resolve('content/blog')),
    ...readdirSync(guides).flatMap((topic) => draftSlugsIn(path.join(guides, topic))),
  ];
}

const pages: Record<string, { file: string; h1: RegExp; canonical: string | null }> = {
  '/': { file: 'index.html', h1: /Yaparak öğreniyorum\. Öğrendiklerimi yazıyorum\./, canonical: 'https://cemozcelik.dev/' },
  '/blog': { file: 'blog/index.html', h1: />Yazılar</, canonical: 'https://cemozcelik.dev/blog' },
  '/projeler': { file: 'projeler/index.html', h1: />Projeler</, canonical: 'https://cemozcelik.dev/projeler' },
  '/hakkimda': { file: 'hakkimda/index.html', h1: />Hakkımda</, canonical: 'https://cemozcelik.dev/hakkimda' },
  '/projeler/karavan': { file: 'projeler/karavan/index.html', h1: />Karavan</, canonical: 'https://cemozcelik.dev/projeler/karavan' },
  '/projeler/mooii': { file: 'projeler/mooii/index.html', h1: />Mooii</, canonical: 'https://cemozcelik.dev/projeler/mooii' },
  '/projeler/cevhersonmez': { file: 'projeler/cevhersonmez/index.html', h1: />cevhersonmez\.com</, canonical: 'https://cemozcelik.dev/projeler/cevhersonmez' },
  '/blog/ubuntu': { file: 'blog/ubuntu/index.html', h1: />Ubuntu</, canonical: 'https://cemozcelik.dev/blog/ubuntu' },
  '/blog/ubuntu/virtualbox-ubuntu-kurulum': { file: 'blog/ubuntu/virtualbox-ubuntu-kurulum/index.html', h1: /VirtualBox ile Ubuntu 24.04.4 LTS Kurulumu/, canonical: 'https://cemozcelik.dev/blog/ubuntu/virtualbox-ubuntu-kurulum' },
  '/404': { file: '404.html', h1: />Sayfa bulunamadı</, canonical: null },
};

test('dist mevcut', () => {
  assert.ok(existsSync(dist), 'Önce `npm run build` çalıştır.');
});

for (const [route, page] of Object.entries(pages)) {
  test(`${route}: statik HTML gerçek içerik ve SEO etiketleri içerir`, () => {
    const html = read(page.file);
    const root = html.match(/<div id="root">([\s\S]*)<\/div>\s*<\/body>/)?.[1] ?? '';
    assert.ok(root.length > 500, 'root boş: sayfa yalnızca istemcide render ediliyor');
    assert.equal(html.match(/<h1[\s>]/g)?.length, 1, 'tam olarak bir h1 olmalı');
    assert.match(root, page.h1);
    assert.equal(html.match(/<title/g)?.length, 1);
    assert.match(html, /<meta name="description" content="[^"]{20,}"/);
    assert.match(html, /<meta property="og:title"/);
    assert.match(html, /<meta name="twitter:card"/);
    if (page.canonical) {
      assert.ok(html.includes(`<link rel="canonical" href="${page.canonical}"`), 'canonical');
      assert.doesNotMatch(html, /name="robots" content="noindex"/);
    } else {
      assert.match(html, /<meta name="robots" content="noindex"/);
    }
    assert.ok(!html.includes('<!--app-'), 'yer tutucu kalmamalı');
  });
}

test('ana sayfa JSON-LD WebSite verisi içerir', () => {
  const json = read('index.html').match(/<script type="application\/ld\+json" data-seo>(.*?)<\/script>/)?.[1];
  assert.ok(json);
  const data = JSON.parse(json);
  assert.equal(data['@type'], 'WebSite');
  assert.equal(data.url, 'https://cemozcelik.dev');
});

test('mevcut sosyal bağlantılar ve projeler korunur', () => {
  const home = read('index.html');
  for (const href of ['https://github.com/cemozcelikkk', 'https://www.instagram.com/cemozcelik7/', 'mailto:cemozcelik295@gmail.com', 'https://linkedin.com/in/']) {
    assert.ok(home.includes(href), href);
  }
  for (const title of ['Karavan', 'Mooii', 'cevhersonmez.com']) assert.ok(home.includes(title), title);
  const projects = read('projeler/index.html');
  for (const url of ['https://krvn.cemozcelik.dev', 'https://mooii-co-chi.vercel.app', 'https://cevhersonmez.com']) {
    assert.ok(projects.includes(url), url);
  }
  assert.ok(read('projeler/karavan/index.html').includes('GeoAlchemy2'));
});

test('taslak yazılar hiçbir çıktı dosyasında yer almaz', () => {
  const slugs = draftSlugs();
  assert.ok(slugs.length > 0);
  const files = allFiles(dist);
  for (const slug of slugs) {
    assert.ok(!existsSync(path.join(dist, 'blog', slug)), `${slug} sayfası üretilmiş`);
    const leaked = files.filter((f) => /\.(html|js|xml|json)$/.test(f) && readFileSync(f, 'utf8').includes(slug));
    assert.deepEqual(leaked, [], `${slug} şu dosyalara sızmış`);
  }
});

test('/blog Ubuntu konusunu listeler; mevcut kategori filtreleri durur', () => {
  const blog = read('blog/index.html');
  assert.ok(blog.includes('href="/blog/ubuntu"'));
  assert.ok(blog.includes('Ubuntu kurulumu, Linux terminal komutları, dosya yönetimi, kullanıcı yetkileri ve sistem yönetimi üzerine uygulamalı rehberler.'));
  for (const id of ['yapay-zeka', 'backend', 'devops', 'guvenlik', 'mobil']) assert.ok(blog.includes(`href="/blog?kategori=${id}"`), id);
});

test('/blog/ubuntu breadcrumb ile CollectionPage + BreadcrumbList verisi içerir', () => {
  const html = read('blog/ubuntu/index.html');
  assert.match(html, /<nav aria-label="Sayfa konumu">/);
  const json = html.match(/<script type="application\/ld\+json" data-seo>(.*?)<\/script>/)?.[1];
  assert.ok(json);
  const types = JSON.parse(json)['@graph'].map((n: { '@type': string }) => n['@type']);
  assert.deepEqual(types, ['CollectionPage', 'BreadcrumbList']);
});

test('sitemap.xml, rss.xml ve robots.txt üretilir', () => {
  const sitemap = read('sitemap.xml');
  for (const route of Object.keys(pages).filter((r) => r !== '/404')) {
    const loc = route === '/' ? 'https://cemozcelik.dev/' : `https://cemozcelik.dev${route}`;
    assert.ok(sitemap.includes(`<loc>${loc}</loc>`), loc);
  }
  assert.ok(!sitemap.includes('/404'));
  assert.ok(sitemap.includes('/blog/ubuntu/virtualbox-ubuntu-kurulum'));
  const rss = read('rss.xml');
  assert.match(rss, /^<\?xml/);
  assert.match(rss, /<rss version="2.0"/);
  assert.match(read('robots.txt'), /Sitemap: https:\/\/cemozcelik\.dev\/sitemap\.xml/);
});


test('Ubuntu girişinde karşılaştırma ve erişilebilir kurulum bağlantısı bulunur', () => {
  const html = read('blog/ubuntu/index.html');
  for (const text of ['Ubuntu nedir?', 'VirtualBox', 'Dual Boot', 'doğrudan kurulum', 'WSL2']) {
    assert.ok(html.toLocaleLowerCase('tr').includes(text.toLocaleLowerCase('tr')), text);
  }
  assert.match(html, /aria-label="Ubuntu kurulumuna devam et"/);
  assert.match(html, /<a href="\/blog\/ubuntu\/virtualbox-ubuntu-kurulum" class="[^"]*focus-ring[^"]*underline[^"]*">VirtualBox üzerinde Ubuntu kur/);
});

test('kurulum rehberi gerçek denemeleri içerir ve taslak sonraki bölüme bağlanmaz', () => {
  const html = read('blog/ubuntu/virtualbox-ubuntu-kurulum/index.html');
  for (const text of ['4096 MB', '128 MB', 'VBoxSVGA', 'Safe Graphics', '/home/cem']) assert.ok(html.includes(text), text);
  assert.ok(!html.includes('rel="next"'), 'henüz yayımlanmış sonraki bölüm yok');
  assert.ok(read('rss.xml').includes('/blog/ubuntu/virtualbox-ubuntu-kurulum'));
});
