import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readingMinutes, renderMarkdown, slugify } from '../build/markdown.ts';

test('slugify Türkçe karakterleri sadeleştirir', () => {
  assert.equal(slugify('Karşılaşılan Hatalar & Çözüm'), 'karsilasilan-hatalar-cozum');
  assert.equal(slugify('İçindekiler / Öğrendiklerim'), 'icindekiler-ogrendiklerim');
});

test('h2/h3 başlıkları id ve içindekiler üretir, tekrar eden id\'ler ayrışır', async () => {
  const { html, toc } = await renderMarkdown('## Sonuç\n\n### Alt başlık\n\n## Sonuç\n');
  assert.deepEqual(toc.map((t) => [t.id, t.depth]), [['sonuc', 2], ['alt-baslik', 3], ['sonuc-1', 2]]);
  assert.match(html, /<h2 id="sonuc"><a class="heading-anchor" href="#sonuc">Sonuç<\/a><\/h2>/);
});

test('gövdede h1 kullanımı reddedilir', async () => {
  await assert.rejects(renderMarkdown('# Başlık', 'x.md'), /x\.md: Gövdede "# " \(h1\) kullanma/);
});

test('kod blokları renklendirilir ve kopyalama butonu içerir', async () => {
  const { html } = await renderMarkdown('```ts title="a.ts"\nconst x: number = 1;\n```');
  assert.match(html, /<figure class="code-block">/);
  assert.match(html, /<span>a\.ts<\/span>/);
  assert.match(html, /data-copy-code/);
  assert.match(html, /--shiki-light:/);
  assert.match(html, /--shiki-dark:/);
});

test('terminal ve çıktı blokları ayrı görünüm alır, bilinmeyen dil düz metne düşer', async () => {
  const { html } = await renderMarkdown('```console\n$ ls\n```\n\n```output\nok\n```\n\n```yokboyledil\nx\n```');
  assert.equal(html.match(/code-block--terminal/g)?.length, 2);
  assert.match(html, /<span>terminal<\/span>/);
  assert.match(html, /<span>çıktı<\/span>/);
  assert.match(html, /<span>yokboyledil<\/span>/);
});

test('mermaid blokları istemcide işlenmek üzere işaretlenir ve kaçışlanır', async () => {
  const { html, hasMermaid } = await renderMarkdown('```mermaid\nflowchart LR\n  A --> B<script>\n```');
  assert.equal(hasMermaid, true);
  assert.match(html, /<pre class="mermaid">flowchart LR\n {2}A --&gt; B&lt;script&gt;<\/pre>/);
});

test('tablolar kaydırılabilir sarmalayıcı içinde', async () => {
  const { html } = await renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |');
  assert.match(html, /<div class="table-wrap" tabindex="0" role="region" aria-label="Tablo"><table>/);
});

test('tek başına görsel <p> içine değil figure olarak, lazy ve açıklamalı yazılır', async () => {
  const { html } = await renderMarkdown('![Alt metin](/a.png "Açıklama")');
  assert.equal(html.includes('<p>'), false);
  assert.match(html, /<figure class="article-figure"><img src="\/a\.png" alt="Alt metin" loading="lazy" decoding="async" \/><figcaption>Açıklama<\/figcaption><\/figure>/);
});

test('dış bağlantılar yeni sekmede, iç bağlantılar aynı sekmede açılır', async () => {
  const { html } = await renderMarkdown('[d](https://example.com) [i](/projeler)');
  assert.match(html, /<a target="_blank" rel="noopener noreferrer" href="https:\/\/example\.com">d<\/a>/);
  assert.match(html, /<a href="\/projeler">i<\/a>/);
});

test('okuma süresi metinden hesaplanır', () => {
  assert.equal(readingMinutes('kelime '.repeat(1000)), 5);
  assert.equal(readingMinutes('kısa'), 1);
});

test('teknik not kutuları (> [!NOT] vb.) aside olarak işlenir, düz alıntılar bozulmaz', async () => {
  const { html } = await renderMarkdown('> [!NOT]\n> Bir **not**.\n\n> [!WARNING]\n>\n> Birinci.\n>\n> İkinci.\n\n> Düz alıntı');
  assert.match(html, /<aside class="callout callout--note" role="note"><p class="callout-title">Not<\/p><p>Bir <strong>not<\/strong>\.<\/p>/);
  assert.match(html, /<aside class="callout callout--warning" role="note"><p class="callout-title">Uyarı<\/p><p>Birinci\.<\/p>\n<p>İkinci\.<\/p>/);
  assert.match(html, /<blockquote>\n<p>Düz alıntı<\/p>\n<\/blockquote>/);
});

test('error/hata blokları "hata çıktısı" etiketiyle terminal görünümü alır', async () => {
  const { html } = await renderMarkdown('```error\nPermission denied\n```');
  assert.match(html, /code-block code-block--terminal code-block--error/);
  assert.match(html, /<span>hata çıktısı<\/span>/);
});
