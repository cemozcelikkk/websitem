import type { Project } from '../content/types';
import { ExternalLink, StackList } from './ui';

/** Ana sayfa için kompakt proje satırları. */
export function ProjectRows({ projects }: { projects: Project[] }) {
  return (
    <ol className="border-b border-rule">
      {projects.map((project, i) => (
        <li key={project.slug} className="border-t border-rule">
          <article className="relative grid gap-y-2 py-6 md:grid-cols-[8rem_1fr] md:gap-x-8">
            <div className="flex gap-4 font-mono text-xs text-graphite md:flex-col md:gap-1 md:pt-1">
              <span>№ {String(i + 1).padStart(2, '0')}</span>
              <span>{project.kind}</span>
            </div>
            <div className="min-w-0 max-w-[62ch]">
              <h3 className="font-mono text-lg font-medium tracking-tight text-ink md:text-xl">
                <a href={`/projeler/${project.slug}`} className="link-draw focus-ring pb-0.5 after:absolute after:inset-0 after:content-['']">
                  {project.title}
                </a>
              </h3>
              <p className="mt-2 text-[1.05rem] leading-[1.65] text-pretty text-graphite">{project.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs text-graphite" aria-label="Teknolojiler">
                {project.stack.slice(0, 5).map((tech, j) => (
                  <li key={tech} className="whitespace-nowrap">
                    {j > 0 && <span aria-hidden="true">· </span>}
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}

/** Projeler sayfası için ayrıntılı kartlar (sitenin önceki "günlük" görünümü). */
export function ProjectCards({ projects }: { projects: Project[] }) {
  return (
    <ol className="space-y-5">
      {projects.map((project, i) => (
        <li
          key={project.slug}
          className="group grid gap-x-8 gap-y-4 rounded-md border border-rule bg-card px-5 py-8 transition-colors duration-300 ease-out hover:border-rule-strong hover:bg-card-hover sm:px-8 md:grid-cols-[8rem_1fr] md:py-10"
        >
          <div className="flex gap-4 font-mono text-xs text-graphite md:flex-col md:gap-1 md:pt-1.5">
            <span>№ {String(i + 1).padStart(2, '0')}</span>
            <span>{project.kind}</span>
          </div>

          <div className="min-w-0 max-w-[62ch]">
            <h2 className="font-mono text-xl font-medium leading-snug tracking-tight text-ink md:text-[1.4rem]">
              <a href={`/projeler/${project.slug}`} className="link-draw focus-ring pb-0.5">
                {project.title}
              </a>
            </h2>
            <p className="mt-2 text-lg leading-[1.6] text-pretty text-graphite">{project.summary}</p>

            <ul className="mt-6 max-w-[60ch] space-y-3 text-[1.05rem] leading-[1.75] text-pretty text-body">
              {project.notes.map((note) => (
                <li key={note} className="grid grid-cols-[1.5rem_1fr]">
                  <span className="font-mono text-graphite transition-colors duration-300 group-hover:text-body" aria-hidden="true">→</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              <StackList items={project.stack} />
            </div>

            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-graphite">
              <a href={`/projeler/${project.slug}`} className="link-draw focus-ring pb-0.5 hover:text-ink">
                Proje detayı <span aria-hidden="true">→</span>
              </a>
              {project.url && (
                <ExternalLink href={project.url} className="hover:text-ink">
                  {new URL(project.url).host}
                </ExternalLink>
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
