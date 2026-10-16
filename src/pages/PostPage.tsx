import { useEffect, useReducer } from 'react';
import { posts, projects } from 'virtual:content';
import ArticleColumns from '../components/ArticleColumns';
import PostList from '../components/PostList';
import PrevNext from '../components/PrevNext';
import { BackLink, ExternalLink, SectionHeading } from '../components/ui';
import { categoryLabel } from '../content/categories';
import type { PostMeta } from '../content/types';
import { formatDate, readingLabel } from '../lib/format';
import { getLoadedPost, loadPost } from '../routes';

function relatedPosts(post: PostMeta): PostMeta[] {
  return posts
    .filter((p) => p.slug !== post.slug && !(post.series && p.series === post.series))
    .map((p) => ({
      p,
      score:
        (post.relatedProject && p.relatedProject === post.relatedProject ? 3 : 0) +
        (p.category === post.category ? 2 : 0) +
        p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);
}

function SeriesNav({ post }: { post: PostMeta }) {
  if (!post.series) return null;
  const series = posts.filter((p) => p.series === post.series).sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
  if (series.length < 2) return null;
  const index = series.findIndex((p) => p.slug === post.slug);
  const prev = series[index - 1];
  const next = series[index + 1];

  return (
    <PrevNext
      label="Seri"
      caption={`Seri: ${post.series} · ${index + 1}/${series.length}`}
      prev={prev && { href: `/blog/${prev.slug}`, title: prev.title, label: '← Önceki' }}
      next={next && { href: `/blog/${next.slug}`, title: next.title, label: 'Sonraki →' }}
    />
  );
}

export default function PostPage({ slug }: { slug: string }) {
  const post = posts.find((p) => p.slug === slug)!;
  const body = getLoadedPost(slug);
  const [, rerender] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (!body) loadPost(slug).then(rerender);
  }, [slug, body]);

  const project = post.relatedProject ? projects.find((p) => p.slug === post.relatedProject) : undefined;
  const related = relatedPosts(post);

  return (
    <article className="mt-12 md:mt-16">
      <BackLink href="/blog">Yazılar</BackLink>

      <header className="mt-10 max-w-[760px]">
        {post.draft && (
          <p className="mb-6 rounded-sm border border-rule-strong px-3 py-2 font-mono text-xs text-ink">
            TASLAK — bu sayfa yalnızca taslak modunda (npm run dev:drafts) görünür, yayımlanmaz.
          </p>
        )}
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em]">
          <a href={`/blog?kategori=${post.category}`} className="link-draw focus-ring pb-0.5 text-graphite hover:text-ink">
            {categoryLabel(post.category)}
          </a>
        </p>
        <h1 className="mt-4 text-4xl leading-[1.12] font-normal tracking-tight text-balance text-ink md:text-5xl">{post.title}</h1>
        <p className="mt-5 text-xl leading-[1.6] text-pretty text-graphite">{post.description}</p>

        <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y border-rule py-3 font-mono text-xs text-graphite">
          {post.date && (
            <div>
              <dt className="sr-only">Yayın tarihi</dt>
              <dd>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </dd>
            </div>
          )}
          {post.updatedAt && (
            <div className="flex gap-1">
              <dt>Güncellendi:</dt>
              <dd>
                <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
              </dd>
            </div>
          )}
          <div>
            <dt className="sr-only">Okuma süresi</dt>
            <dd>{readingLabel(post.readingMinutes)}</dd>
          </div>
        </dl>

        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-graphite" aria-label="Etiketler">
            {post.tags.map((tag) => (
              <li key={tag}>#{tag}</li>
            ))}
          </ul>
        )}
      </header>

      {post.coverImage && (
        <img src={post.coverImage} alt="" className="mt-10 w-full max-w-[760px] rounded-md border border-rule" fetchPriority="high" />
      )}

      <ArticleColumns body={body} />

      <footer className="mt-20 max-w-[720px] space-y-12">
        <SeriesNav post={post} />

        {(post.repositoryUrl || project) && (
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-rule pt-6 font-mono text-xs text-graphite">
            {post.repositoryUrl && (
              <ExternalLink href={post.repositoryUrl} className="text-ink">
                Kaynak kod
              </ExternalLink>
            )}
            {project && (
              <a href={`/projeler/${project.slug}`} className="link-draw focus-ring pb-0.5 text-ink">
                İlgili proje: {project.title} <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related-title">
            <SectionHeading id="related-title">İlgili yazılar</SectionHeading>
            <PostList posts={related} />
          </section>
        )}

        <BackLink href="/blog">Tüm yazılara dön</BackLink>
      </footer>
    </article>
  );
}
