// Prerender (SSG) girişi: scripts/prerender.ts bu modülü kullanarak her adres için
// statik HTML üretir. Tarayıcıda çalışmaz.
import { createElement, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { setServerLocation } from './router';
import { allPaths, feedItems, matchRoute, preloadRoute, sitemapEntries } from './routes';
import { absoluteUrl, renderHead, seoForRoute } from './seo';
import { SITE } from './site';

export { allPaths, feedItems, sitemapEntries, SITE, absoluteUrl };
export { showDrafts } from 'virtual:content';

export async function render(url: string): Promise<{ html: string; head: string; status: number }> {
  setServerLocation(url);
  const pathname = new URL(url, 'http://localhost').pathname.replace(/\/+$/, '') || '/';
  const route = matchRoute(pathname);
  await preloadRoute(route);

  const html = renderToString(createElement(StrictMode, null, createElement(App)));
  return { html, head: renderHead(seoForRoute(route, pathname)), status: route.name === 'notFound' ? 404 : 200 };
}
