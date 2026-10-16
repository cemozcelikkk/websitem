import type { TocItem } from '../content/types';

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ol className="space-y-2 font-mono text-xs leading-relaxed">
      {items.map((item) => (
        <li key={item.id} className={item.depth === 3 ? 'pl-4' : ''}>
          <a href={`#${item.id}`} className="link-draw focus-ring pb-0.5 text-graphite hover:text-ink">
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Mobilde açılır kapanır, geniş ekranda yan sütunda sabit içindekiler. */
export function TocMobile({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  return (
    <details className="mb-10 border-y border-rule py-3 lg:hidden">
      <summary className="focus-ring cursor-pointer font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink">
        İçindekiler
      </summary>
      <nav aria-label="İçindekiler" className="mt-4">
        <TocList items={items} />
      </nav>
    </details>
  );
}

export function TocSidebar({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="İçindekiler" className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink">İçindekiler</p>
      <TocList items={items} />
    </nav>
  );
}
