import { PageHeader } from '../components/ui';

export default function NotFoundPage() {
  return (
    <>
      <p className="mt-16 font-mono text-xs text-graphite md:mt-24">404</p>
      <PageHeader title="Sayfa bulunamadı">
        <p>Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.</p>
      </PageHeader>
      <p className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
        <a href="/" className="link-draw focus-ring pb-0.5 text-ink [background-size:100%_1px]">
          Ana sayfa
        </a>
        <a href="/blog" className="link-draw focus-ring pb-0.5 text-graphite hover:text-ink">
          Yazılar
        </a>
        <a href="/projeler" className="link-draw focus-ring pb-0.5 text-graphite hover:text-ink">
          Projeler
        </a>
      </p>
    </>
  );
}
