import { posts, projects } from 'virtual:content';
import PostList, { FeaturedPost } from '../components/PostList';
import { ProjectRows } from '../components/ProjectList';
import { SectionHeading } from '../components/ui';
import { useMagnetic } from '../effects/useMagnetic';

export default function HomePage() {
  const featured = posts.find((p) => p.featured && !p.draft) ?? posts.find((p) => p.featured);
  const recent = posts.filter((p) => p !== featured).slice(0, 5);
  // Hero başlığı çok hafif, ana bağlantı biraz daha belirgin şekilde imlece doğru esner.
  const titleRef = useMagnetic<HTMLHeadingElement>(0.035, 140, 6);
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.3, 90, 10);

  return (
    <>
      <section aria-labelledby="hero-title" className="fade-up mt-20 md:mt-32">
        <h1 ref={titleRef} id="hero-title" className="max-w-[20ch] text-4xl leading-[1.1] font-normal tracking-tight text-balance text-ink sm:text-5xl md:text-6xl">
          Yaparak öğreniyorum. Öğrendiklerimi yazıyorum.
        </h1>
        <p className="mt-8 max-w-[58ch] text-lg leading-[1.75] text-pretty text-body md:text-xl">
          Yazılım ve yapay zekâ üzerine çalışıyorum. Geliştirdiğim uygulamaların arkasındaki teknik
          kararları, karşılaştığım sorunları ve öğrendiklerimi burada belgeliyorum.
        </p>
        <p className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
          <a ref={ctaRef} href="/blog" className="link-draw focus-ring inline-block pb-0.5 text-action [--line:var(--action-line)] [background-size:100%_2px] hover:opacity-85">
            Yazılarımı keşfet <span aria-hidden="true">→</span>
          </a>
          <a href="/hakkimda" className="link-draw focus-ring pb-0.5 text-graphite hover:text-royal-text">
            Hakkımda
          </a>
        </p>
      </section>

      {featured && (
        <section aria-labelledby="featured-title" className="fade-up mt-24 md:mt-32 [animation-delay:120ms]">
          <SectionHeading id="featured-title">Öne çıkan yazı</SectionHeading>
          <FeaturedPost post={featured} />
        </section>
      )}

      <section aria-labelledby="recent-title" className="fade-up mt-24 md:mt-32 [animation-delay:160ms]">
        <SectionHeading id="recent-title" link={posts.length ? { href: '/blog', label: 'Tüm yazılar' } : undefined}>
          Son yazılar
        </SectionHeading>
        {recent.length > 0 ? (
          <PostList posts={recent} />
        ) : featured ? null : (
          <div className="border-y border-rule py-8">
            <p className="max-w-[56ch] text-lg leading-[1.7] text-graphite">
              Henüz yayımlanmış bir yazı yok. İlk yazılar hazırlanıyor.
            </p>
            <p className="mt-4 font-mono text-xs text-graphite">
              Yayımlandığında haberdar olmak için{' '}
              <a href="/rss.xml" className="link-draw focus-ring pb-0.5 text-ink [background-size:100%_1px] hover:text-royal-text">
                RSS
              </a>{' '}
              aboneliği kullanabilirsin.
            </p>
          </div>
        )}
      </section>

      <section id="projects" aria-labelledby="projects-title" className="fade-up mt-24 md:mt-32 [animation-delay:200ms]">
        <SectionHeading id="projects-title" link={{ href: '/projeler', label: 'Tüm projeler' }}>
          Projeler
        </SectionHeading>
        <ProjectRows projects={projects} />
      </section>
    </>
  );
}
