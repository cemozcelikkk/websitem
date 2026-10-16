import type { PostBody } from '../content/types';
import ArticleBody from './ArticleBody';
import { TocMobile, TocSidebar } from './Toc';

/** Okuma sütunu (~720px) + geniş ekranda sağda sabit içindekiler. Gövde yüklenene kadar durum metni. */
export default function ArticleColumns({ body }: { body: PostBody | undefined }) {
  return (
    <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,720px)_13rem] lg:gap-16">
      <div className="min-w-0">
        {body ? (
          <>
            <TocMobile items={body.toc} />
            <ArticleBody html={body.html} hasMermaid={body.hasMermaid} />
          </>
        ) : (
          <p className="font-mono text-xs text-graphite" role="status">
            Yükleniyor…
          </p>
        )}
      </div>
      <aside className="hidden lg:block">{body && <TocSidebar items={body.toc} />}</aside>
    </div>
  );
}
