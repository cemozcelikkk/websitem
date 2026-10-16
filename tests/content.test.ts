import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ContentError, loadContent } from '../build/content.ts';

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

test('taslaklar varsayılan olarak yüklenmez', async () => {
  const { posts } = await loadContent(path.join(fixtures, 'valid'));
  assert.deepEqual(posts.map((p) => p.meta.slug), ['yeni-yazi', 'eski-yazi']);
  assert.ok(posts.every((p) => !p.meta.draft));
});

test('taslak modu taslakları da yükler', async () => {
  const { posts } = await loadContent(path.join(fixtures, 'valid'), { includeDrafts: true });
  assert.ok(posts.some((p) => p.meta.slug === 'taslak' && p.meta.draft && p.meta.date === null));
});

test('yazılar tarihe göre yeniden eskiye sıralanır ve metadata eksiksiz okunur', async () => {
  const { posts, projects } = await loadContent(path.join(fixtures, 'valid'));
  const [newest] = posts;
  assert.equal(newest.meta.date, '2026-03-10');
  assert.equal(newest.meta.updatedAt, '2026-03-12');
  assert.equal(newest.meta.featured, true);
  assert.equal(newest.meta.relatedProject, 'demo');
  assert.deepEqual(newest.meta.tags, ['docker', 'api']);
  assert.equal(newest.meta.readingMinutes, 1);
  assert.deepEqual(newest.body.toc, [{ id: 'giris', text: 'Giriş', depth: 2 }]);
  assert.equal(projects[0].slug, 'demo');
});

test('hatalı metadata anlaşılır bir hata ile build\'i durdurur', async () => {
  await assert.rejects(loadContent(path.join(fixtures, 'invalid')), (error: unknown) => {
    assert.ok(error instanceof ContentError);
    const message = error.message;
    assert.match(message, /hatali\.md → categroy: bilinmeyen alan/);
    assert.match(message, /hatali\.md → date: zorunlu alan eksik/);
    assert.match(message, /hatali\.md → category: "bilinmeyen" tanımlı değil/);
    assert.match(message, /hatali\.md → relatedProject: "yok-boyle-proje" adlı proje yok/);
    assert.match(message, /hatali\.md → repositoryUrl: https:\/\//);
    assert.match(message, /kotu-tarih\.md → date: geçerli bir YYYY-AA-GG tarihi olmalı/);
    assert.match(message, /durumsuz\.md → draft: zorunlu alan eksik/);
    return true;
  });
});

test('rehber bölümleri dosya adına değil order alanına göre sıralanır; taslaklar elenir', async () => {
  const { guides } = await loadContent(path.join(fixtures, 'valid'));
  assert.deepEqual(guides.map((g) => g.topic.slug), ['demo-konu'], 'taslak konu (gizli-konu) yayımlanmamalı');
  const [demo] = guides;
  assert.deepEqual(demo.chapters.map((c) => [c.meta.order, c.meta.slug]), [[1, 'z-birinci'], [2, 'b-ikinci'], [3, 'a-ucuncu']]);
  assert.deepEqual(demo.topic.chapters.map((c) => c.slug), ['z-birinci', 'b-ikinci', 'a-ucuncu']);
  assert.equal(demo.topic.chapters[0].shortTitle, 'Birinci');
  assert.equal(demo.topic.chapters[1].updatedAt, '2026-04-09');
  assert.equal(demo.topic.chapters[2].date, undefined);
  assert.match(demo.topic.html, /Konu girişi/);
  assert.match(demo.chapters[0].body.html, /class="callout callout--warning"/);
  assert.deepEqual(demo.chapters[0].body.toc, [{ id: 'kurulum', text: 'Kurulum', depth: 2 }]);
});

test('taslak modunda taslak konu ve bölümler de yüklenir', async () => {
  const { guides } = await loadContent(path.join(fixtures, 'valid'), { includeDrafts: true });
  assert.deepEqual(guides.map((g) => g.topic.slug), ['demo-konu', 'gizli-konu']);
  assert.deepEqual(guides[0].chapters.map((c) => c.meta.slug), ['z-birinci', 'b-ikinci', 'a-ucuncu', 'taslak-bolum']);
});

test('hatalı rehber metadata\'sı ve /blog adres çakışması build\'i durdurur', async () => {
  await assert.rejects(loadContent(path.join(fixtures, 'invalid')), (error: unknown) => {
    const message = (error as Error).message;
    assert.match(message, /bozuk\/yanlis-konu\.md → topic: bulunduğu klasörle \("bozuk"\) aynı olmalı/);
    assert.match(message, /bozuk\/yanlis-konu\.md → order: zorunlu alan eksik/);
    assert.match(message, /bozuk\/yanlis-konu\.md → category: "bilinmeyen" tanımlı değil/);
    // Taslak bölüm de sıra çakışmasına dahil edilir.
    assert.match(message, /bozuk\/iki\.md → order: "1" değeri .*bir\.md dosyasında da kullanılıyor/);
    assert.match(message, /content\/guides\/gecerli-yazi: "gecerli-yazi" adında bir blog yazısı zaten var/);
    return true;
  });
});
