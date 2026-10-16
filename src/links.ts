import { SITE } from './site';

export type SocialKind = 'github' | 'linkedin' | 'instagram' | 'email';

export interface SocialLink {
  kind: SocialKind;
  label: string;
  href: string;
}

export const github: SocialLink = { kind: 'github', label: 'GitHub', href: SITE.github };
export const linkedin: SocialLink = { kind: 'linkedin', label: 'LinkedIn', href: SITE.linkedin };
export const instagram: SocialLink = { kind: 'instagram', label: 'Instagram', href: SITE.instagram };
export const email: SocialLink = { kind: 'email', label: 'E-posta', href: `mailto:${SITE.email}` };

export const isExternal = (href: string) => href.startsWith('http');
export const externalProps = { target: '_blank', rel: 'noreferrer noopener' } as const;
