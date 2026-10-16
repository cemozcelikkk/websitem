import { guides, posts } from 'virtual:content';
import { CATEGORIES, categoryLabel } from '../content/categories';
import { TopicList } from '../components/GuideList';
import PostList from '../components/PostList';
import { PageHeader, SectionHeading } from '../components/ui';

function groupByYear(list: typeof posts) {
  const groups = new Map<string, typeof posts>();
  for (const post of list) {
    const key = post.date ? post.date.slice(0, 4) : 'Taslaklar';
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }
  return [...groups];
}

export default function BlogPage({ search }: { search: string }) {
  const requested = new URLSearchParams(search).get('kategori');
  const active = CATEGORIES.some((c) => c.id === requested) ? requested : null;
  const filtered = active ? posts.filter((p) => p.category === active) : posts;

  const filters = [
    { id: null, label: 'Tümü', count: posts.length },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, count: posts.filter((p) => p.category === c.id).length })),
  ];

  return (
    <>
      <PageHeader title="Yazılar">
        <p>Teknik çalışmalarımı, denemelerimi, kararlarımı ve öğrendiklerimi paylaştığım alan.</p>
      </PageHeader>

      {/* Rehber konuları (ör. Ubuntu) kategorilerden ayrı bir kavram: kendi sıralı bölümleri var. */}
      {guides.length > 0 && (
        <section aria-labelledby="topics-title" className="mt-14">
          <SectionHeading id="topics-title">Konular</SectionHeading>
          <TopicList topics={guides} />
        </section>
      )}

      <section aria-labelledby="all-posts-title" className={guides.length > 0 ? 'mt-20' : 'mt-14'}>
        <SectionHeading id="all-posts-title">Tüm yazılar</SectionHeading>

        <nav aria-label="Kategoriler">
          <ul className="flex flex-wrap gap-2 font-mono text-xs">
            {filters.map((f) => {
              const selected = f.id === active;
              return (
                <li key={f.label}>
                  <a
                    href={f.id ? `/blog?kategori=${f.id}` : '/blog'}
                    aria-current={selected ? 'true' : undefined}
                    className={`focus-ring inline-flex items-baseline gap-1.5 rounded-sm border px-2.5 py-1.5 transition-colors ${
                      selected ? 'border-ink bg-chip text-ink' : 'border-rule text-graphite hover:border-rule-strong hover:text-ink'
                    }`}
                  >
                    {f.label}
                    <span className="opacity-70">{f.count}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="sr-only" aria-live="polite">
          {active ? `${categoryLabel(active)} kategorisinde ${filtered.length} yazı` : `${filtered.length} yazı`}
        </p>

        <div className="mt-10">
          {posts.length === 0 ? (
            <div className="border-y border-rule py-8">
              <p className="max-w-[56ch] text-lg leading-[1.7] text-graphite">Henüz yayımlanmış bir yazı yok. İlk yazılar hazırlanıyor.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="border-y border-rule py-8">
              <p className="text-lg leading-[1.7] text-graphite">{categoryLabel(active!)} kategorisinde henüz yazı yok.</p>
              <a href="/blog" className="link-draw focus-ring mt-4 inline-block pb-0.5 font-mono text-xs text-ink [background-size:100%_1px]">
                Tüm yazıları göster
              </a>
            </div>
          ) : (
            <div className="space-y-12">
              {groupByYear(filtered).map(([year, list]) => (
                <section key={year} aria-labelledby={`year-${year}`}>
                  <h3 id={`year-${year}`} className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-graphite">
                    {year}
                  </h3>
                  <PostList posts={list} showYear={false} headingLevel={4} />
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
