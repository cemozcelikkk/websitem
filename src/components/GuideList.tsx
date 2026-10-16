import type { ChapterMeta, GuideTopic } from '../content/types';
import { formatDate, pad, readingLabel } from '../lib/format';
import { chapterPath, topicPath } from '../routes';

/** /blog sayfasındaki rehber konuları (ör. Ubuntu). */
export function TopicList({ topics }: { topics: GuideTopic[] }) {
  return (
    <ol className="border-b border-rule">
      {topics.map((topic) => {
        const count = topic.chapters.length;
        return (
          <li key={topic.slug} className="border-t border-rule">
            <article className="relative grid gap-y-2 py-6 md:grid-cols-[8rem_1fr] md:gap-x-8">
              <p className="flex gap-4 font-mono text-xs text-graphite md:flex-col md:gap-1 md:pt-1.5">
                <span>Rehber</span>
                <span>{count > 0 ? `${count} bölüm` : 'Hazırlanıyor'}</span>
              </p>
              <div className="min-w-0 max-w-[62ch]">
                <h3 className="text-2xl leading-snug font-medium text-balance text-ink md:text-[1.75rem]">
                  <a href={topicPath(topic.slug)} className="link-draw focus-ring pb-0.5 after:absolute after:inset-0 after:content-['']">
                    {topic.title}
                  </a>
                  {topic.draft && <span className="ml-3 align-middle font-mono text-xs text-ink">TASLAK</span>}
                </h3>
                <p className="mt-2 text-[1.05rem] leading-[1.65] text-pretty text-graphite">{topic.description}</p>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

/** Konu sayfasındaki bölüm listesi; sıra `order` alanından gelir. */
export function ChapterList({ chapters }: { chapters: ChapterMeta[] }) {
  return (
    <ol className="border-b border-rule">
      {chapters.map((chapter) => (
        <li key={chapter.slug} className="border-t border-rule">
          <article className="relative grid gap-y-2 py-6 md:grid-cols-[8rem_1fr] md:gap-x-8">
            <p className="font-mono text-xs text-graphite md:pt-1.5">
              Bölüm {pad(chapter.order)}
              {chapter.draft && <span className="ml-2 text-ink">TASLAK</span>}
            </p>
            <div className="min-w-0 max-w-[62ch]">
              <h3 className="text-xl leading-snug font-medium text-balance text-ink md:text-[1.4rem]">
                <a href={chapterPath(chapter)} className="link-draw focus-ring pb-0.5 after:absolute after:inset-0 after:content-['']">
                  {chapter.title}
                </a>
              </h3>
              <p className="mt-2 text-[1.05rem] leading-[1.65] text-pretty text-graphite">{chapter.description}</p>
              <p className="mt-3 flex flex-wrap gap-x-2 font-mono text-xs text-graphite">
                <span>{readingLabel(chapter.readingMinutes)}</span>
                {(chapter.updatedAt ?? chapter.date) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time dateTime={chapter.updatedAt ?? chapter.date}>
                      {chapter.updatedAt ? 'Güncellendi: ' : ''}
                      {formatDate((chapter.updatedAt ?? chapter.date)!)}
                    </time>
                  </>
                )}
              </p>
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
