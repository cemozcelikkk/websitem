// content/blog ve content/projects altındaki Markdown dosyalarını okur, frontmatter'ı
// doğrular ve HTML'e çevirir. Hatalı metadata build'i anlaşılır bir mesajla durdurur.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { CATEGORY_IDS, type CategoryId } from '../src/content/categories.ts';
import type { ChapterMeta, GuideTopic, PostBody, PostMeta, Project } from '../src/content/types.ts';
import { readingMinutes, renderMarkdown } from './markdown.ts';

export interface LoadedPost {
  meta: PostMeta;
  body: PostBody;
  file: string;
}

export interface LoadedContent {
  /** Tarihe göre yeniden eskiye sıralı. `includeDrafts` false ise taslaklar yoktur. */
  posts: LoadedPost[];
  projects: Project[];
  /** Rehber konuları ve bölümleri; `includeDrafts` false ise taslaklar yoktur. */
  guides: LoadedGuide[];
}

export interface LoadedChapter {
  meta: ChapterMeta;
  body: PostBody;
  file: string;
}

export interface LoadedGuide {
  topic: GuideTopic;
  chapters: LoadedChapter[];
}

export class ContentError extends Error {}

const POST_KEYS = new Set([
  'title', 'slug', 'description', 'date', 'updatedAt', 'category', 'tags', 'featured', 'draft',
  'series', 'seriesOrder', 'relatedProject', 'repositoryUrl', 'coverImage',
]);
const PROJECT_KEYS = new Set([
  'title', 'slug', 'kind', 'summary', 'url', 'repositoryUrl', 'stack', 'notes', 'order',
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function splitFrontmatter(raw: string, file: string): { data: Record<string, unknown>; body: string } {
  const match = raw.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new ContentError(`${file}: Dosya "---" ile başlayan bir frontmatter bloğu içermiyor.`);
  // YAML tarihleri string olarak kalsın diye core şeması kullanılıyor.
  const data = parseYaml(match[1], { schema: 'core' }) ?? {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new ContentError(`${file}: Frontmatter bir anahtar/değer listesi olmalı.`);
  }
  return { data: data as Record<string, unknown>, body: match[2] };
}

/** Alan doğrulayıcıları: her biri hatayı `errors` dizisine ekler. */
class Validator {
  errors: string[] = [];
  private file: string;
  private data: Record<string, unknown>;

  constructor(file: string, data: Record<string, unknown>, allowed: Set<string>) {
    this.file = file;
    this.data = data;
    for (const key of Object.keys(data)) {
      if (!allowed.has(key)) this.fail(key, `bilinmeyen alan (izin verilenler: ${[...allowed].join(', ')})`);
    }
  }

  fail(key: string, message: string) {
    this.errors.push(`${this.file} → ${key}: ${message}`);
  }

  string(key: string, required: boolean): string | undefined {
    const value = this.data[key];
    if (value === undefined || value === null || value === '') {
      if (required) this.fail(key, 'zorunlu alan eksik');
      return undefined;
    }
    if (typeof value !== 'string') {
      this.fail(key, 'metin olmalı');
      return undefined;
    }
    return value.trim();
  }

  boolean(key: string, required: boolean): boolean | undefined {
    const value = this.data[key];
    if (value === undefined) {
      if (required) this.fail(key, 'zorunlu alan eksik (true veya false)');
      return undefined;
    }
    if (typeof value !== 'boolean') {
      this.fail(key, 'true veya false olmalı');
      return undefined;
    }
    return value;
  }

  integer(key: string): number | undefined {
    const value = this.data[key];
    if (value === undefined) return undefined;
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      this.fail(key, 'tam sayı olmalı');
      return undefined;
    }
    return value;
  }

  stringList(key: string): string[] {
    const value = this.data[key];
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value) || value.some((v) => typeof v !== 'string' || !v.trim())) {
      this.fail(key, 'metin listesi olmalı (ör. [docker, nginx])');
      return [];
    }
    return value.map((v: string) => v.trim());
  }

  date(key: string, required: boolean): string | undefined {
    const value = this.string(key, required);
    if (value === undefined) return undefined;
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
      && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);
    if (!valid) {
      this.fail(key, `geçerli bir YYYY-AA-GG tarihi olmalı ("${value}")`);
      return undefined;
    }
    return value;
  }

  url(key: string): string | undefined {
    const value = this.string(key, false);
    if (value === undefined) return undefined;
    if (!/^https:\/\/[^\s]+$/.test(value)) {
      this.fail(key, `https:// ile başlayan, boşluk içermeyen bir adres olmalı ("${value}")`);
      return undefined;
    }
    return value;
  }

  slug(fallback: string): string {
    const slug = this.string('slug', false) ?? fallback;
    if (!SLUG_RE.test(slug)) {
      this.fail('slug', `yalnızca küçük harf, rakam ve tire içermeli ("${slug}")`);
    }
    return slug;
  }
}

async function markdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => path.join(dir, e.name))
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function loadProjects(dir: string, root: string): Promise<{ projects: Project[]; errors: string[] }> {
  const projects: Project[] = [];
  const errors: string[] = [];

  for (const filePath of await markdownFiles(dir)) {
    const file = path.relative(root, filePath).replace(/\\/g, '/');
    try {
      const { data, body } = splitFrontmatter(await readFile(filePath, 'utf8'), file);
      const v = new Validator(file, data, PROJECT_KEYS);
      const slug = v.slug(path.basename(filePath, '.md'));
      const title = v.string('title', true);
      const kind = v.string('kind', true);
      const summary = v.string('summary', true);
      const url = v.url('url');
      const repositoryUrl = v.url('repositoryUrl');
      const stack = v.stringList('stack');
      const notes = v.stringList('notes');
      const order = v.integer('order') ?? 999;
      errors.push(...v.errors);
      if (v.errors.length || !title || !kind || !summary) continue;

      const rendered = await renderMarkdown(body, file);
      projects.push({
        slug, title, kind, summary, stack, notes, order,
        ...(url && { url }),
        ...(repositoryUrl && { repositoryUrl }),
        html: rendered.html,
        toc: rendered.toc,
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  projects.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'tr'));
  return { projects, errors };
}

async function loadPosts(dir: string, root: string, projectSlugs: Set<string>, includeDrafts: boolean) {
  const posts: LoadedPost[] = [];
  const errors: string[] = [];
  /** Taslaklar dahil tüm yazı slug'ları (konu slug'larıyla çakışma kontrolü için). */
  const allSlugs = new Set<string>();

  for (const filePath of await markdownFiles(dir)) {
    const file = path.relative(root, filePath).replace(/\\/g, '/');
    try {
      const { data, body } = splitFrontmatter(await readFile(filePath, 'utf8'), file);
      const v = new Validator(file, data, POST_KEYS);
      const draft = v.boolean('draft', true);
      const slug = v.slug(path.basename(filePath, '.md'));
      const title = v.string('title', true);
      const description = v.string('description', true);
      // Yayımlanan yazıda tarih zorunlu; taslakta isteğe bağlı.
      const date = v.date('date', draft === false);
      const updatedAt = v.date('updatedAt', false);
      const category = v.string('category', true);
      if (category && !CATEGORY_IDS.includes(category)) {
        v.fail('category', `"${category}" tanımlı değil. Geçerli değerler: ${CATEGORY_IDS.join(', ')} (src/content/categories.ts)`);
      }
      const tags = v.stringList('tags');
      const featured = v.boolean('featured', false) ?? false;
      const series = v.string('series', false);
      const seriesOrder = v.integer('seriesOrder');
      if (series && seriesOrder === undefined) v.fail('seriesOrder', 'series verildiğinde seriesOrder da gerekli');
      const relatedProject = v.string('relatedProject', false);
      if (relatedProject && !projectSlugs.has(relatedProject)) {
        v.fail('relatedProject', `"${relatedProject}" adlı proje yok. Mevcut projeler: ${[...projectSlugs].join(', ')}`);
      }
      const repositoryUrl = v.url('repositoryUrl');
      const coverImage = v.string('coverImage', false);
      if (coverImage && !/^(\/|https:\/\/)/.test(coverImage)) {
        v.fail('coverImage', '"/" ile başlayan yerel bir yol veya https:// adresi olmalı');
      }
      if (date && updatedAt && updatedAt < date) v.fail('updatedAt', 'yayın tarihinden önce olamaz');

      errors.push(...v.errors);
      if (v.errors.length || draft === undefined || !title || !description || !category) continue;
      allSlugs.add(slug);
      if (draft && !includeDrafts) continue;

      const rendered = await renderMarkdown(body, file);
      posts.push({
        file,
        meta: {
          slug, title, description,
          date: date ?? null,
          category: category as CategoryId,
          tags, featured, draft,
          ...(updatedAt && { updatedAt }),
          ...(series && { series, seriesOrder }),
          ...(relatedProject && { relatedProject }),
          ...(repositoryUrl && { repositoryUrl }),
          ...(coverImage && { coverImage }),
          readingMinutes: readingMinutes(body),
        },
        body: rendered,
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  const seen = new Map<string, string>();
  for (const post of posts) {
    const other = seen.get(post.meta.slug);
    if (other) errors.push(`${post.file}: "${post.meta.slug}" slug'ı ${other} ile çakışıyor.`);
    seen.set(post.meta.slug, post.file);
  }

  // Yeniden eskiye; tarihsiz taslaklar en üstte.
  posts.sort((a, b) => (b.meta.date ?? '9999').localeCompare(a.meta.date ?? '9999') || a.meta.title.localeCompare(b.meta.title, 'tr'));
  return { posts, errors, allSlugs };
}

const TOPIC_KEYS = new Set(['title', 'slug', 'description', 'order', 'draft']);
const CHAPTER_KEYS = new Set([
  'title', 'slug', 'shortTitle', 'description', 'topic', 'order', 'category', 'draft', 'date', 'updatedAt',
]);

/**
 * content/guides/<konu>/index.md  → konu bilgisi
 * content/guides/<konu>/<bölüm>.md → bölümler (sıra `order` alanından gelir, dosya adından değil)
 */
async function loadGuides(dir: string, root: string, includeDrafts: boolean) {
  const guides: LoadedGuide[] = [];
  const errors: string[] = [];

  let topicDirs: string[];
  try {
    topicDirs = (await readdir(dir, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { guides, errors };
    throw error;
  }

  for (const folder of topicDirs) {
    const topicDir = path.join(dir, folder);
    const rel = (p: string) => path.relative(root, p).replace(/\\/g, '/');
    const indexFile = rel(path.join(topicDir, 'index.md'));

    let topic: GuideTopic | undefined;
    try {
      const { data, body } = splitFrontmatter(await readFile(path.join(topicDir, 'index.md'), 'utf8'), indexFile);
      const v = new Validator(indexFile, data, TOPIC_KEYS);
      const slug = v.slug(folder);
      if (slug !== folder) v.fail('slug', `klasör adıyla ("${folder}") aynı olmalı`);
      const title = v.string('title', true);
      const description = v.string('description', true);
      const order = v.integer('order') ?? 999;
      const draft = v.boolean('draft', true);
      errors.push(...v.errors);
      if (!v.errors.length && title && description && draft !== undefined) {
        const rendered = await renderMarkdown(body, indexFile);
        topic = { slug, title, description, order, draft, html: rendered.html, chapters: [] };
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      errors.push(code === 'ENOENT' ? `${indexFile}: Her konu klasöründe konu bilgisini içeren bir index.md olmalı.` : (error as Error).message);
    }

    // Taslaklar dahil hepsi doğrulanır; yayımlanmayanlar sonra elenir.
    const valid: { meta: ChapterMeta; body: string; file: string }[] = [];
    for (const filePath of await markdownFiles(topicDir)) {
      if (path.basename(filePath) === 'index.md') continue;
      const file = rel(filePath);
      try {
        const { data, body } = splitFrontmatter(await readFile(filePath, 'utf8'), file);
        const v = new Validator(file, data, CHAPTER_KEYS);
        const draft = v.boolean('draft', true);
        const slug = v.slug(path.basename(filePath, '.md'));
        const title = v.string('title', true);
        const shortTitle = v.string('shortTitle', false);
        const description = v.string('description', true);
        const topicSlug = v.string('topic', true);
        if (topicSlug && topicSlug !== folder) v.fail('topic', `bulunduğu klasörle ("${folder}") aynı olmalı, "${topicSlug}" verilmiş`);
        const order = v.integer('order');
        if (order === undefined) v.fail('order', 'zorunlu alan eksik (bölüm sırası, ör. 1)');
        else if (order < 1) v.fail('order', '1 veya daha büyük olmalı');
        const category = v.string('category', true);
        if (category && !CATEGORY_IDS.includes(category)) {
          v.fail('category', `"${category}" tanımlı değil. Geçerli değerler: ${CATEGORY_IDS.join(', ')} (src/content/categories.ts)`);
        }
        const date = v.date('date', false);
        const updatedAt = v.date('updatedAt', false);
        if (date && updatedAt && updatedAt < date) v.fail('updatedAt', 'yayın tarihinden önce olamaz');

        errors.push(...v.errors);
        if (v.errors.length || draft === undefined || !title || !description || order === undefined || !category) continue;
        valid.push({
          file,
          body,
          meta: {
            slug, topic: folder, title, description, order, draft,
            category: category as CategoryId,
            ...(shortTitle && { shortTitle }),
            ...(date && { date }),
            ...(updatedAt && { updatedAt }),
            readingMinutes: readingMinutes(body),
          },
        });
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    for (const key of ['order', 'slug'] as const) {
      const seen = new Map<string | number, string>();
      for (const c of valid) {
        const other = seen.get(c.meta[key]);
        if (other) errors.push(`${c.file} → ${key}: "${c.meta[key]}" değeri ${other} dosyasında da kullanılıyor; aynı konuda tekrar edemez.`);
        seen.set(c.meta[key], c.file);
      }
    }

    if (!topic || (topic.draft && !includeDrafts)) continue;

    const chapters: LoadedChapter[] = [];
    for (const c of valid.sort((a, b) => a.meta.order - b.meta.order)) {
      if (c.meta.draft && !includeDrafts) continue;
      chapters.push({ meta: c.meta, file: c.file, body: await renderMarkdown(c.body, c.file) });
    }
    topic.chapters = chapters.map((c) => c.meta);
    guides.push({ topic, chapters });
  }

  guides.sort((a, b) => a.topic.order - b.topic.order || a.topic.title.localeCompare(b.topic.title, 'tr'));
  return { guides, errors };
}

export async function loadContent(contentDir: string, options: { includeDrafts?: boolean } = {}): Promise<LoadedContent> {
  const root = path.dirname(contentDir);
  const includeDrafts = options.includeDrafts ?? false;
  const { projects, errors: projectErrors } = await loadProjects(path.join(contentDir, 'projects'), root);
  const { posts, errors: postErrors, allSlugs } = await loadPosts(
    path.join(contentDir, 'blog'),
    root,
    new Set(projects.map((p) => p.slug)),
    includeDrafts,
  );
  const { guides, errors: guideErrors } = await loadGuides(path.join(contentDir, 'guides'), root, includeDrafts);

  // /blog/<x> hem yazı hem konu olamaz; mevcut yazı adresleri asla gölgelenmemeli.
  const topicDirs = await readdir(path.join(contentDir, 'guides')).catch(() => [] as string[]);
  for (const slug of topicDirs) {
    if (allSlugs.has(slug)) {
      guideErrors.push(`content/guides/${slug}: "${slug}" adında bir blog yazısı zaten var; /blog/${slug} adresi çakışır. Konu klasörünü yeniden adlandır.`);
    }
  }

  const errors = [...projectErrors, ...postErrors, ...guideErrors];
  if (errors.length) {
    throw new ContentError(`İçerik doğrulaması başarısız (${errors.length} hata):\n  - ${errors.join('\n  - ')}`);
  }
  return { posts, projects, guides };
}
