import { projects } from 'virtual:content';
import { email, externalProps, github, instagram, isExternal, linkedin } from '../links';
import { Code, PageHeader, SectionHeading } from '../components/ui';
import { CATEGORIES } from '../content/categories';
import { SITE } from '../site';

export default function AboutPage() {
  const topics = CATEGORIES.map((c) => c.label.toLocaleLowerCase('tr'));

  return (
    <>
      <PageHeader title="Hakkımda" />

      <div className="mt-10 max-w-[62ch] space-y-6 text-lg leading-[1.8] text-pretty text-body md:text-xl">
        <p>
          Okulda algoritmaları ve veri yapılarını öğreniyorum; geri kalan zamanda insanların
          kullandığı küçük ürünler yapıyorum — <Code>API</Code>'sini yazıp sunucusunu kendim
          kurduğum, <Code>DNS</Code> kaydını kendim girdiğim türden.
        </p>
        <p>
          Yazılım ve yapay zekâ üzerine çalışıyorum. Yaparak öğreniyorum; öğrendiklerimi de yazıyorum.
          Bu site o yüzden var: geliştirdiğim uygulamaların arkasındaki teknik kararları,
          karşılaştığım sorunları ve öğrendiklerimi burada belgeliyorum.
        </p>
        <p>
          Yazılar {topics.slice(0, -1).join(', ')} ve {topics.at(-1)} başlıkları altında toplanıyor.
          Projeler sayfasındaki liste ise bir yetenek tablosu değil, bir günlük: her işin altına neyi
          kullandığımı ve neden onu seçtiğimi not ettim.
        </p>
      </div>

      <section aria-labelledby="work-title" className="mt-20">
        <SectionHeading id="work-title" link={{ href: '/projeler', label: 'Projeler' }}>
          Üzerinde çalıştıklarım
        </SectionHeading>
        <ul className="max-w-[62ch] border-b border-rule">
          {projects.map((p) => (
            <li key={p.slug} className="grid gap-1 border-t border-rule py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <a href={`/projeler/${p.slug}`} className="link-draw focus-ring justify-self-start pb-0.5 font-mono text-sm text-ink">
                {p.title}
              </a>
              <span className="text-[1.05rem] leading-[1.6] text-graphite">{p.summary}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contact-title" className="mt-20">
        <SectionHeading id="contact-title">İletişim</SectionHeading>
        <p className="max-w-[62ch] text-lg leading-[1.75] text-body">
          Bir yazı ya da proje hakkında söylemek istediğin bir şey varsa bana{' '}
          <a href={`mailto:${SITE.email}`} className="link-draw focus-ring pb-0.5 text-ink [background-size:100%_1px]">
            {SITE.email}
          </a>{' '}
          adresinden ulaşabilirsin.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
          {[github, linkedin, instagram, email].map((link) => (
            <li key={link.label}>
              <a href={link.href} {...(isExternal(link.href) && externalProps)} className="link-draw focus-ring pb-0.5 text-graphite hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
