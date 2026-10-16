import ArticleBody from '../components/ArticleBody';
import { ChapterList } from '../components/GuideList';
import { BackLink, Breadcrumb, SectionHeading } from '../components/ui';
import { findTopic } from '../routes';

export default function TopicPage({ topic: slug }: { topic: string }) {
  const topic = findTopic(slug)!;
  const minutes = topic.chapters.reduce((sum, c) => sum + c.readingMinutes, 0);

  return (
    <>
      <div className="mt-12 md:mt-16">
        <Breadcrumb items={[{ label: 'Yazılar', href: '/blog' }, { label: topic.title }]} />
      </div>

      <header className="mt-10 max-w-[760px]">
        {topic.draft && (
          <p className="mb-6 rounded-sm border border-rule-strong px-3 py-2 font-mono text-xs text-ink">
            TASLAK — bu konu yalnızca taslak modunda (npm run dev:drafts) görünür, yayımlanmaz.
          </p>
        )}
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-graphite">Rehber</p>
        <h1 className="mt-4 text-4xl leading-[1.12] font-normal tracking-tight text-balance text-ink md:text-5xl">{topic.title}</h1>
        <p className="mt-5 text-xl leading-[1.6] text-pretty text-graphite">{topic.description}</p>
        {topic.chapters.length > 0 && (
          <p className="mt-8 flex flex-wrap gap-x-2 border-y border-rule py-3 font-mono text-xs text-graphite">
            <span>{topic.chapters.length} bölüm</span>
            <span aria-hidden="true">·</span>
            <span>toplam ~{minutes} dk okuma</span>
          </p>
        )}
      </header>

      {topic.html.trim() && (
        <div className="mt-12 max-w-[720px]">
          <ArticleBody html={topic.html} />
        </div>
      )}

      <section aria-labelledby="chapters-title" className="mt-16">
        <SectionHeading id="chapters-title">Bölümler</SectionHeading>
        {topic.chapters.length > 0 ? (
          <ChapterList chapters={topic.chapters} />
        ) : (
          <div className="border-y border-rule py-8">
            <p className="max-w-[56ch] text-lg leading-[1.7] text-graphite">
              Bu rehberin bölümleri hazırlanıyor. Yayımlandıkça burada sırasıyla listelenecek.
            </p>
            <p className="mt-4 font-mono text-xs text-graphite">
              Haberdar olmak için{' '}
              <a href="/rss.xml" className="link-draw focus-ring pb-0.5 text-ink [background-size:100%_1px]">
                RSS
              </a>{' '}
              aboneliği kullanabilirsin.
            </p>
          </div>
        )}
      </section>

      <div className="mt-12">
        <BackLink href="/blog">Tüm yazılar</BackLink>
      </div>
    </>
  );
}
