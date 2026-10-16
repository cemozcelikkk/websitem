// Bağımlılıksız küçük router. Sayfalar build'de statik HTML olarak üretilir; istemcide
// aynı origin'deki <a> tıklamaları yakalanıp sayfa yenilenmeden geçiş yapılır.
import { useSyncExternalStore } from 'react';

export interface Location {
  pathname: string;
  search: string;
}

/** "/blog/" → "/blog". Kök "/" olarak kalır. */
export function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

const listeners = new Set<() => void>();
let snapshot: Location | undefined;
let serverLocation: Location = { pathname: '/', search: '' };

/** SSR/prerender sırasında render edilen adres. */
export function setServerLocation(url: string) {
  const parsed = new URL(url, 'http://localhost');
  serverLocation = { pathname: normalizePath(parsed.pathname), search: parsed.search };
}

function readLocation(): Location {
  const pathname = normalizePath(window.location.pathname);
  const search = window.location.search;
  if (!snapshot || snapshot.pathname !== pathname || snapshot.search !== search) {
    snapshot = { pathname, search };
  }
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

// Hydration sırasında statik HTML'in üretildiği adres (query'siz) kullanılır;
// ardından React gerçek adresle yeniden render eder. Böylece uyumsuzluk oluşmaz.
let hydrationLocation: Location | undefined;
function getServerSnapshot(): Location {
  if (typeof window === 'undefined') return serverLocation;
  hydrationLocation ??= { pathname: normalizePath(window.location.pathname), search: '' };
  return hydrationLocation;
}

export function useLocation(): Location {
  return useSyncExternalStore(subscribe, readLocation, getServerSnapshot);
}

export function navigate(href: string, options: { replace?: boolean } = {}) {
  const url = new URL(href, window.location.href);
  const samePath = normalizePath(url.pathname) === normalizePath(window.location.pathname);
  window.history[options.replace ? 'replaceState' : 'pushState'](null, '', url);
  listeners.forEach((l) => l());

  // Yeni sayfa render edildikten sonra kaydır.
  requestAnimationFrame(() => {
    if (url.hash) {
      document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
    } else if (!samePath) {
      // Yalnızca sayfa değişince başa dön; filtre gibi query değişimlerinde konum korunur.
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  });
}

/** Sayfa içi tüm iç bağlantıları istemci tarafı geçişe çevirir. */
export function interceptLinks() {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element | null)?.closest?.('a');
    if (!anchor || !anchor.href) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download') || anchor.getAttribute('rel')?.includes('external')) return;

    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin) return;
    // Dosyalar (rss.xml, görseller…) normal şekilde açılsın.
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith('.html')) return;
    // Aynı sayfadaki #bağlantılar tarayıcıya bırakılır.
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

    event.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  });
}
