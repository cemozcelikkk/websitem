import { useEffect, useReducer } from 'react';
import ArticleColumns from '../components/ArticleColumns';
import PrevNext from '../components/PrevNext';
import { BackLink, Breadcrumb } from '../components/ui';
import { categoryLabel } from '../content/categories';
import { formatDate, pad, readingLabel } from '../lib/format';
import { chapterPath, findChapter, getLoadedChapter, loadChapter, topicPath } from '../routes';

export default function ChapterPage({ topic: topicSlug, slug }: { topic: string; slug: string }) {
  const { topic, chapter, index } = findChapter(topicSlug, slug)!;
  const body = getLoadedChapter(topicSlug, slug);
  const [, rerender] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (!body) loadChapter(topicSlug, slug).then(rerender);
  }, [topicSlug, slug, body]);

  // Gerçek sıra: bölümler `order` değerine göre sıralı geliyor; yalnızca yayımlananlar listede.
  const prev = topic.chapters[index - 1];
  const next = topic.chapters[index + 1];

  return (
    <article className="mt-12 md:mt-16">
      <Breadcrumb
        items={[
          { label: 'Yazılar', href: '/blog' },
          { label: topic.title, href: topicPath(topic.slug) },
          { label: chapter.shortTitle ?? chapter.title },
        ]}
      />

      <header className="mt-10 max-w-[760px]">
        {chapter.draft && (
          <p className="mb-6 rounded-sm border border-rule-strong px-3 py-2 font-mono text-xs text-ink">
            TASLAK — bu bölüm yalnızca taslak modunda (npm run dev:drafts) görünür, yayımlanmaz.
          </p>
        )}
        <p className="flex flex-wrap gap-x-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-graphite">
          <span>Bölüm {pad(chapter.order)}</span>
          <span aria-hidden="true">·</span>
          <span>{categoryLabel(chapter.category)}</span>
        </p>
        <h1 className="mt-4 text-4xl leading-[1.12] font-normal tracking-tight text-balance text-ink md:text-5xl">{chapter.title}</h1>
        <p className="mt-5 text-xl leading-[1.6] text-pretty text-graphite">{chapter.description}</p>

        <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y border-rule py-3 font-mono text-xs text-graphite">
          {chapter.date && (
            <div>
              <dt className="sr-only">Yayın tarihi</dt>
              <dd>
                <time dateTime={chapter.date}>{formatDate(chapter.date)}</time>
              </dd>
            </div>
          )}
          {chapter.updatedAt && (
            <div className="flex gap-1">
              <dt>Güncellendi:</dt>
              <dd>
                <time dateTime={chapter.updatedAt}>{formatDate(chapter.updatedAt)}</time>
              </dd>
            </div>
          )}
          <div>
            <dt className="sr-only">Okuma süresi</dt>
            <dd>{readingLabel(chapter.readingMinutes)}</dd>
          </div>
          <div>
            <dt className="sr-only">Rehberdeki yeri</dt>
            <dd>
              {index + 1}/{topic.chapters.length}
            </dd>
          </div>
        </dl>
      </header>

      <ArticleColumns body={body} />

      <footer className="mt-20 max-w-[720px] space-y-10">
        <PrevNext
          label={`${topic.title} rehberi bölümleri`}
          prev={prev && { href: chapterPath(prev), title: prev.title, label: `← Önceki bölüm · ${pad(prev.order)}` }}
          next={next && { href: chapterPath(next), title: next.title, label: `Sonraki bölüm · ${pad(next.order)} →` }}
        />
        <BackLink href={topicPath(topic.slug)}>{topic.title} rehberine dön</BackLink>
      </footer>
    </article>
  );
}
