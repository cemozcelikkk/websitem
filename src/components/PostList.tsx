import { categoryLabel } from '../content/categories';
import type { PostMeta } from '../content/types';
import { formatDate, formatShortDate, readingLabel } from '../lib/format';

function PostMetaLine({ post }: { post: PostMeta }) {
  return (
    <p className="flex flex-wrap gap-x-2 font-mono text-xs text-graphite">
      <span>{categoryLabel(post.category)}</span>
      <span aria-hidden="true">·</span>
      <span>{readingLabel(post.readingMinutes)}</span>
      {post.draft && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-ink">TASLAK</span>
        </>
      )}
    </p>
  );
}

/** Editoryal, kompakt yazı listesi. `headingLevel` sayfadaki başlık hiyerarşisine göre seçilir. */
export default function PostList({ posts, headingLevel = 3, showYear = true }: { posts: PostMeta[]; headingLevel?: 2 | 3 | 4; showYear?: boolean }) {
  const Heading = (['h2', 'h3', 'h4'] as const)[headingLevel - 2];
  return (
    <ol className="border-b border-rule">
      {posts.map((post) => (
        <li key={post.slug} className="border-t border-rule">
          <article className="group relative grid gap-y-2 py-6 md:grid-cols-[8rem_1fr] md:gap-x-8">
            <div className="font-mono text-xs text-graphite md:pt-1">
              {post.date ? (
                <time dateTime={post.date} title={formatDate(post.date)}>
                  {showYear ? formatDate(post.date) : formatShortDate(post.date)}
                </time>
              ) : (
                <span>Tarihsiz</span>
              )}
            </div>
            <div className="min-w-0 max-w-[62ch]">
              <PostMetaLine post={post} />
              <Heading className="mt-1.5 text-xl leading-snug font-medium text-balance text-ink md:text-[1.4rem]">
                <a href={`/blog/${post.slug}`} className="link-draw focus-ring pb-0.5 after:absolute after:inset-0 after:content-['']">
                  {post.title}
                </a>
              </Heading>
              <p className="mt-2 text-[1.05rem] leading-[1.65] text-pretty text-graphite">{post.description}</p>
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}

export function FeaturedPost({ post }: { post: PostMeta }) {
  return (
    <article className="relative rounded-md border border-rule bg-card px-5 py-8 transition-colors duration-300 ease-out hover:border-rule-strong hover:bg-card-hover sm:px-8 md:py-10">
      <PostMetaLine post={post} />
      <h3 className="mt-3 max-w-[30ch] text-2xl leading-tight font-medium text-balance text-ink md:text-[2rem]">
        <a href={`/blog/${post.slug}`} className="focus-ring after:absolute after:inset-0 after:content-['']">
          {post.title}
        </a>
      </h3>
      <p className="mt-4 max-w-[60ch] text-lg leading-[1.65] text-pretty text-body">{post.description}</p>
      <p className="mt-6 flex flex-wrap items-baseline justify-between gap-4 font-mono text-xs text-graphite">
        {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        <span className="text-ink" aria-hidden="true">
          Yazıyı oku →
        </span>
      </p>
    </article>
  );
}
