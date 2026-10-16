import { chapterLoaders, guides, postLoaders, posts, projects } from 'virtual:content';
import { categoryLabel } from './content/categories';
import type { ChapterMeta, GuideTopic, PostBody } from './content/types';

export type Route =
  | { name: 'home' }
  | { name: 'blog' }
  | { name: 'post'; slug: string }
  | { name: 'topic'; topic: string }
  | { name: 'chapter'; topic: string; slug: string }
  | { name: 'projects' }
  | { name: 'project'; slug: string }
  | { name: 'about' }
  | { name: 'notFound' };

export const topicPath = (topic: string) => `/blog/${topic}`;
export const chapterPath = (c: Pick<ChapterMeta, 'topic' | 'slug'>) => `/blog/${c.topic}/${c.slug}`;

export function findTopic(slug: string): GuideTopic | undefined {
  return guides.find((g) => g.slug === slug);
}

export function findChapter(topic: string, slug: string): { topic: GuideTopic; chapter: ChapterMeta; index: number } | undefined {
  const t = findTopic(topic);
  const index = t?.chapters.findIndex((c) => c.slug === slug) ?? -1;
  return t && index >= 0 ? { topic: t, chapter: t.chapters[index], index } : undefined;
}

export function matchRoute(pathname: string): Route {
  if (pathname === '/') return { name: 'home' };
  if (pathname === '/blog') return { name: 'blog' };
  if (pathname === '/projeler') return { name: 'projects' };
  if (pathname === '/hakkimda') return { name: 'about' };

  // /blog/<x>: önce yazı (eski adresler korunur), sonra rehber konusu. Build çakışmaya izin vermez.
  const single = pathname.match(/^\/blog\/([^/]+)$/);
  if (single) {
    if (posts.some((p) => p.slug === single[1])) return { name: 'post', slug: single[1] };
    if (findTopic(single[1])) return { name: 'topic', topic: single[1] };
  }

  const chapter = pathname.match(/^\/blog\/([^/]+)\/([^/]+)$/);
  if (chapter && findChapter(chapter[1], chapter[2])) return { name: 'chapter', topic: chapter[1], slug: chapter[2] };

  const project = pathname.match(/^\/projeler\/([^/]+)$/);
  if (project && projects.some((p) => p.slug === project[1])) return { name: 'project', slug: project[1] };

  return { name: 'notFound' };
}

/** Prerender edilecek tüm adresler (taslak modunda taslaklar dahil). */
export function allPaths(): string[] {
  return [
    '/',
    '/blog',
    '/projeler',
    '/hakkimda',
    ...posts.map((p) => `/blog/${p.slug}`),
    ...guides.flatMap((g) => [topicPath(g.slug), ...g.chapters.map(chapterPath)]),
    ...projects.map((p) => `/projeler/${p.slug}`),
  ];
}

/** sitemap.xml girdileri — taslaklar her durumda hariç. */
export function sitemapEntries(): { path: string; lastmod?: string }[] {
  const publicGuides = guides.filter((g) => !g.draft);
  return [
    { path: '/' },
    { path: '/blog' },
    { path: '/projeler' },
    { path: '/hakkimda' },
    ...posts.filter((p) => !p.draft).map((p) => ({ path: `/blog/${p.slug}`, lastmod: p.updatedAt ?? p.date! })),
    ...publicGuides.flatMap((g) => [
      { path: topicPath(g.slug) },
      ...g.chapters
        .filter((c) => !c.draft)
        .map((c) => ({ path: chapterPath(c), ...((c.updatedAt ?? c.date) && { lastmod: c.updatedAt ?? c.date }) })),
    ]),
    ...projects.map((p) => ({ path: `/projeler/${p.slug}` })),
  ];
}

/** rss.xml öğeleri — yayımlanmış yazılar ve tarihli rehber bölümleri, yeniden eskiye. */
export function feedItems(): { title: string; path: string; date: string; description: string; category: string }[] {
  const items = [
    ...posts.filter((p) => !p.draft && p.date).map((p) => ({
      title: p.title, path: `/blog/${p.slug}`, date: p.date!, description: p.description, category: categoryLabel(p.category),
    })),
    ...guides.filter((g) => !g.draft).flatMap((g) =>
      g.chapters.filter((c) => !c.draft && c.date).map((c) => ({
        title: `${g.title}: ${c.title}`, path: chapterPath(c), date: c.date!, description: c.description, category: categoryLabel(c.category),
      })),
    ),
  ];
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

// Yazı ve bölüm gövdeleri ayrı chunk'larda; bir kez yüklenince burada tutulur.
const bodies = new Map<string, PostBody>();

async function loadBody(key: string, loader: (() => Promise<{ default: PostBody }>) | undefined) {
  const cached = bodies.get(key);
  if (cached || !loader) return cached;
  const body = (await loader()).default;
  bodies.set(key, body);
  return body;
}

export const getLoadedPost = (slug: string) => bodies.get(`post:${slug}`);
export const loadPost = (slug: string) => loadBody(`post:${slug}`, postLoaders[slug]);

export const getLoadedChapter = (topic: string, slug: string) => bodies.get(`guide:${topic}/${slug}`);
export const loadChapter = (topic: string, slug: string) => loadBody(`guide:${topic}/${slug}`, chapterLoaders[`${topic}/${slug}`]);

/** Hydration/prerender öncesi, adresin ihtiyaç duyduğu gövdeyi yükler. */
export function preloadRoute(route: Route): Promise<unknown> {
  if (route.name === 'post') return loadPost(route.slug);
  if (route.name === 'chapter') return loadChapter(route.topic, route.slug);
  return Promise.resolve();
}
