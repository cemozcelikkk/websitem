// Sayfalar arasında paylaşılan küçük yapı taşları.
import type { ReactNode } from 'react';

/** Metin içindeki anahtar kelimeler için hafif "kod" vurgusu */
export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-[0.82em] text-ink">{children}</code>;
}

/** Mono, büyük harfli bölüm etiketi; isteğe bağlı sağda "tümü" bağlantısı. */
export function SectionHeading({ id, children, link }: { id: string; children: ReactNode; link?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <h2 id={id} className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink">
        {children}
      </h2>
      {link && (
        <a href={link.href} className="link-draw focus-ring shrink-0 pb-0.5 font-mono text-xs text-graphite hover:text-ink">
          {link.label} <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mt-16 md:mt-24">
      <h1 className="text-4xl leading-[1.15] font-normal tracking-tight text-balance text-ink md:text-5xl">{title}</h1>
      {children && <div className="mt-5 max-w-[60ch] text-lg leading-[1.7] text-pretty text-graphite md:text-xl">{children}</div>}
    </header>
  );
}

/** Yazılar / Ubuntu / Kurulum — son öğe bulunulan sayfadır. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Sayfa konumu">
      <ol className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-xs text-graphite">
        {items.map((item, i) => (
          <li key={item.label} className="flex min-w-0 items-baseline gap-x-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <a href={item.href} className="link-draw focus-ring pb-0.5 hover:text-ink">
                {item.label}
              </a>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="link-draw focus-ring inline-block pb-0.5 font-mono text-xs text-graphite hover:text-ink">
      <span aria-hidden="true">← </span>
      {children}
    </a>
  );
}

export function StackList({ items, label = 'Kullanılan teknolojiler' }: { items: string[]; label?: string }) {
  return (
    <ul className="flex flex-wrap gap-2 font-mono text-xs" aria-label={label}>
      {items.map((tech) => (
        <li key={tech} className="rounded-sm border border-rule px-2 py-1 text-graphite">
          {tech}
        </li>
      ))}
    </ul>
  );
}

export function ExternalLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={`link-draw focus-ring pb-0.5 ${className}`}>
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (yeni sekmede açılır)</span>
    </a>
  );
}
