import { email, externalProps, github, instagram, isExternal, linkedin } from '../links';
import SocialIcon from './SocialIcon';

const nav = [
  { label: 'Yazılar', href: '/blog' },
  { label: 'Projeler', href: '/projeler' },
  { label: 'Hakkımda', href: '/hakkimda' },
];

const socials = [github, linkedin, instagram, email];

export default function Header({ pathname }: { pathname: string }) {
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-rule pb-4 font-mono text-xs">
      <a href="/" className="focus-ring mr-auto font-medium uppercase tracking-[0.2em] text-ink">
        Cem Özçelik
      </a>
      {/* Mobilde: 1. satır isim + ikonlar, 2. satır menü. Geniş ekranda tek satır. */}
      <nav aria-label="Ana menü" className="order-last w-full sm:order-none sm:w-auto">
        <ul className="flex items-center gap-5">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`link-draw focus-ring py-1 transition-colors ${active ? 'text-ink [background-size:100%_1px]' : 'text-graphite hover:text-ink'}`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <ul className="-mr-1.5 flex items-center gap-1 sm:border-l sm:border-rule sm:pl-4" aria-label="Sosyal bağlantılar">
        {socials.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              aria-label={link.label}
              title={link.label}
              {...(isExternal(link.href) && externalProps)}
              className="focus-ring block p-1.5 text-ink opacity-60 transition-[opacity,translate] duration-300 ease-out hover:-translate-y-0.5 hover:opacity-100 focus-visible:opacity-100"
            >
              <SocialIcon kind={link.kind} />
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}
