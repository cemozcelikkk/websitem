import { posts, projects } from 'virtual:content';
import ArticleBody from '../components/ArticleBody';
import PostList from '../components/PostList';
import { BackLink, ExternalLink, SectionHeading, StackList } from '../components/ui';

export default function ProjectPage({ slug }: { slug: string }) {
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  const related = posts.filter((p) => p.relatedProject === slug);

  return (
    <article className="mt-12 md:mt-16">
      <BackLink href="/projeler">Projeler</BackLink>

      <header className="mt-10 max-w-[760px]">
        <p className="flex gap-4 font-mono text-xs text-graphite">
          <span>№ {String(index + 1).padStart(2, '0')}</span>
          <span>{project.kind}</span>
        </p>
        <h1 className="mt-4 font-mono text-3xl font-medium tracking-tight break-words text-ink md:text-4xl">{project.title}</h1>
        <p className="mt-5 text-xl leading-[1.6] text-pretty text-graphite">{project.summary}</p>

        {(project.url || project.repositoryUrl) && (
          <p className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-y border-rule py-3 font-mono text-xs">
            {project.url && (
              <ExternalLink href={project.url} className="text-ink">
                {new URL(project.url).host}
              </ExternalLink>
            )}
            {project.repositoryUrl && (
              <ExternalLink href={project.repositoryUrl} className="text-ink">
                Kaynak kod
              </ExternalLink>
            )}
          </p>
        )}
      </header>

      <div className="mt-14 max-w-[720px] space-y-14">
        {project.notes.length > 0 && (
          <section aria-labelledby="notes-title">
            <SectionHeading id="notes-title">Teknik notlar</SectionHeading>
            <ul className="space-y-3 text-[1.1rem] leading-[1.75] text-pretty text-body">
              {project.notes.map((note) => (
                <li key={note} className="grid grid-cols-[1.5rem_1fr]">
                  <span className="font-mono text-graphite" aria-hidden="true">→</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.html.trim() && <ArticleBody html={project.html} />}

        {project.stack.length > 0 && (
          <section aria-labelledby="stack-title">
            <SectionHeading id="stack-title">Kullanılan teknolojiler</SectionHeading>
            <StackList items={project.stack} />
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related-title">
            <SectionHeading id="related-title">İlgili yazılar</SectionHeading>
            <PostList posts={related} />
          </section>
        )}

        <BackLink href="/projeler">Tüm projeler</BackLink>
      </div>
    </article>
  );
}
