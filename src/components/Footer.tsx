import { SITE } from '../site';
import { email, externalProps, github, isExternal, linkedin } from '../links';

const links = [github, linkedin, email];

export default function Footer() {
  return (
    <footer className="mt-32 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-rule pt-4 pb-8 font-mono text-xs text-graphite">
      <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="İletişim">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} {...(isExternal(link.href) && externalProps)} className="link-draw focus-ring pb-0.5 hover:text-ink">
              {link.href.startsWith('mailto:') ? SITE.email : link.label}
            </a>
          </li>
        ))}
        <li>
          <a href="/rss.xml" className="link-draw focus-ring pb-0.5 hover:text-ink">RSS</a>
        </li>
      </ul>
      <span>© {__BUILD_YEAR__} {SITE.name}</span>
    </footer>
  );
}
