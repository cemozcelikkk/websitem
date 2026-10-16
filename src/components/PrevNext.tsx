import type { ReactNode } from 'react';

interface Link {
  href: string;
  title: string;
  /** Başlığın üstündeki küçük etiket, ör. "← Önceki bölüm · 01" */
  label: string;
}

/** Seri / rehber içinde önceki-sonraki gezinmesi. */
export default function PrevNext({ label, caption, prev, next }: { label: string; caption?: ReactNode; prev?: Link; next?: Link }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label={label} className="border-t border-rule pt-6">
      {caption && <p className="font-mono text-xs text-graphite">{caption}</p>}
      <div className={`grid gap-4 sm:grid-cols-2 ${caption ? 'mt-4' : ''}`}>
        {prev && (
          <a href={prev.href} rel="prev" className="focus-ring block rounded-md border border-rule p-4 transition-colors hover:border-rule-strong">
            <span className="font-mono text-xs text-graphite">{prev.label}</span>
            <span className="mt-1 block text-lg leading-snug text-balance text-ink">{prev.title}</span>
          </a>
        )}
        {next && (
          <a href={next.href} rel="next" className="focus-ring block rounded-md border border-rule p-4 transition-colors hover:border-rule-strong sm:col-start-2 sm:text-right">
            <span className="font-mono text-xs text-graphite">{next.label}</span>
            <span className="mt-1 block text-lg leading-snug text-balance text-ink">{next.title}</span>
          </a>
        )}
      </div>
    </nav>
  );
}
