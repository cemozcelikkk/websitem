import { posts, projects } from 'virtual:content';
import { categoryLabel } from './content/categories';
import { chapterPath, findChapter, findTopic, topicPath, type Route } from './routes';
import { SITE } from './site';

export interface Seo {
  title: string;
  description: string;
  path: string;
  type: 'website' | 'article';
  noindex?: boolean;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  jsonLd?: Record<string, unknown>;
}

interface HeadTag {
  tag: 'title' | 'meta' | 'link' | 'script';
  attrs: Record<string, string>;
  content?: string;
}

const validUrl = (url: string) => /^https:\/\/\S+$/.test(url);

const person = {
  '@type': 'Person',
  name: SITE.name,
  url: SITE.url,
  sameAs: [SITE.github, SITE.linkedin, SITE.instagram].filter(validUrl),
};

export function absoluteUrl(path: string) {
  return path.startsWith('http') ? path : SITE.url + (path === '/' ? '/' : path);
}

function breadcrumbs(items: [name: string, path: string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absoluteUrl(path) })),
  };
}

export function seoForRoute(route: Route, pathname: string): Seo {
  switch (route.name) {
    case 'home':
      return {
        title: `${SITE.name} — Yaparak öğreniyorum. Öğrendiklerimi yazıyorum.`,
        description: SITE.description,
        path: '/',
        type: 'website',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE.name,
          url: SITE.url,
          inLanguage: 'tr',
          author: person,
        },
      };
    case 'blog':
      return {
        title: `Yazılar — ${SITE.name}`,
        description: 'Teknik çalışmalarımı, denemelerimi, kararlarımı ve öğrendiklerimi paylaştığım yazılar.',
        path: '/blog',
        type: 'website',
      };
    case 'post': {
      const post = posts.find((p) => p.slug === route.slug)!;
      const path = `/blog/${post.slug}`;
      return {
        title: `${post.title} — ${SITE.name}`,
        description: post.description,
        path,
        type: 'article',
        noindex: post.draft,
        image: post.coverImage,
        publishedTime: post.date ?? undefined,
        modifiedTime: post.updatedAt ?? post.date ?? undefined,
        section: categoryLabel(post.category),
        tags: post.tags,
        jsonLd: post.date
          ? {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.description,
              datePublished: post.date,
              dateModified: post.updatedAt ?? post.date,
              inLanguage: 'tr',
              articleSection: categoryLabel(post.category),
              ...(post.tags.length && { keywords: post.tags.join(', ') }),
              ...(post.coverImage && { image: absoluteUrl(post.coverImage) }),
              author: person,
              mainEntityOfPage: absoluteUrl(path),
              url: absoluteUrl(path),
            }
          : undefined,
      };
    }
    case 'topic': {
      const topic = findTopic(route.topic)!;
      const path = topicPath(topic.slug);
      return {
        title: `${topic.title} — Yazılar — ${SITE.name}`,
        description: topic.description,
        path,
        type: 'website',
        noindex: topic.draft,
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: topic.title,
              description: topic.description,
              url: absoluteUrl(path),
              inLanguage: 'tr',
              hasPart: topic.chapters
                .filter((c) => !c.draft)
                .map((c) => ({ '@type': 'TechArticle', headline: c.title, url: absoluteUrl(chapterPath(c)) })),
            },
            breadcrumbs([['Yazılar', '/blog'], [topic.title, path]]),
          ],
        },
      };
    }
    case 'chapter': {
      const { topic, chapter } = findChapter(route.topic, route.slug)!;
      const path = chapterPath(chapter);
      return {
        title: `${chapter.title} — ${topic.title} — ${SITE.name}`,
        description: chapter.description,
        path,
        type: 'article',
        noindex: chapter.draft || topic.draft,
        publishedTime: chapter.date,
        modifiedTime: chapter.updatedAt ?? chapter.date,
        section: categoryLabel(chapter.category),
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'TechArticle',
              headline: chapter.title,
              description: chapter.description,
              inLanguage: 'tr',
              articleSection: categoryLabel(chapter.category),
              position: chapter.order,
              isPartOf: { '@type': 'CollectionPage', name: topic.title, url: absoluteUrl(topicPath(topic.slug)) },
              ...(chapter.date && { datePublished: chapter.date }),
              ...((chapter.updatedAt ?? chapter.date) && { dateModified: chapter.updatedAt ?? chapter.date }),
              author: person,
              mainEntityOfPage: absoluteUrl(path),
              url: absoluteUrl(path),
            },
            breadcrumbs([['Yazılar', '/blog'], [topic.title, topicPath(topic.slug)], [chapter.shortTitle ?? chapter.title, path]]),
          ],
        },
      };
    }
    case 'projects':
      return {
        title: `Projeler — ${SITE.name}`,
        description: 'Geliştirdiğim projeler ve her birinde neyi neden kullandığıma dair notlar.',
        path: '/projeler',
        type: 'website',
      };
    case 'project': {
      const project = projects.find((p) => p.slug === route.slug)!;
      return {
        title: `${project.title} · Proje — ${SITE.name}`,
        description: project.summary,
        path: `/projeler/${project.slug}`,
        type: 'website',
      };
    }
    case 'about':
      return {
        title: `Hakkımda — ${SITE.name}`,
        description: 'Cem Özçelik kimdir, neler yapıyor ve bu sitede neden yazıyor.',
        path: '/hakkimda',
        type: 'website',
      };
    case 'notFound':
      return {
        title: `Sayfa bulunamadı — ${SITE.name}`,
        description: 'Aradığınız sayfa bulunamadı.',
        path: pathname,
        type: 'website',
        noindex: true,
      };
  }
}

function headTags(seo: Seo): HeadTag[] {
  const url = absoluteUrl(seo.path);
  const meta = (key: 'name' | 'property', name: string, content: string | undefined): HeadTag[] =>
    content ? [{ tag: 'meta', attrs: { [key]: name, content } }] : [];

  return [
    { tag: 'title', attrs: {}, content: seo.title },
    ...meta('name', 'description', seo.description),
    ...(seo.noindex ? meta('name', 'robots', 'noindex') : [{ tag: 'link' as const, attrs: { rel: 'canonical', href: url } }]),
    ...meta('property', 'og:type', seo.type),
    ...meta('property', 'og:site_name', SITE.name),
    ...meta('property', 'og:locale', SITE.locale),
    ...meta('property', 'og:title', seo.title),
    ...meta('property', 'og:description', seo.description),
    ...meta('property', 'og:url', url),
    ...meta('property', 'og:image', seo.image && absoluteUrl(seo.image)),
    ...meta('property', 'article:published_time', seo.publishedTime),
    ...meta('property', 'article:modified_time', seo.modifiedTime),
    ...meta('property', 'article:section', seo.section),
    ...(seo.tags ?? []).flatMap((tag) => meta('property', 'article:tag', tag)),
    ...meta('name', 'twitter:card', seo.image ? 'summary_large_image' : 'summary'),
    ...meta('name', 'twitter:title', seo.title),
    ...meta('name', 'twitter:description', seo.description),
    ...(seo.jsonLd
      ? [{ tag: 'script' as const, attrs: { type: 'application/ld+json' }, content: JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c') }]
      : []),
  ];
}

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Prerender için <head> içine yazılacak HTML. */
export function renderHead(seo: Seo): string {
  return headTags(seo)
    .map(({ tag, attrs, content }) => {
      const attrText = Object.entries({ ...attrs, 'data-seo': '' })
        .map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`))
        .join('');
      if (tag === 'meta' || tag === 'link') return `<${tag}${attrText} />`;
      const body = tag === 'script' ? content! : escapeAttr(content ?? '');
      return `<${tag}${attrText}>${body}</${tag}>`;
    })
    .join('\n    ');
}

/** İstemcide sayfa değişince <head>'i günceller. */
export function applySeo(seo: Seo) {
  document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove());
  for (const { tag, attrs, content } of headTags(seo)) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.setAttribute('data-seo', '');
    if (content !== undefined) el.textContent = content;
    document.head.appendChild(el);
  }
}
