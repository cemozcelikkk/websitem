import { useEffect, useRef, useState } from 'react';

function copyWithSelection(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

/**
 * Build'de üretilmiş HTML'i gösterir ve istemci davranışlarını ekler:
 * kod kopyalama butonları ve (varsa) Mermaid diyagramları.
 */
export default function ArticleBody({ html, hasMermaid = false }: { html: string; hasMermaid?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onClick = async (event: MouseEvent) => {
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-copy-code]');
      if (!button) return;
      const code = button.closest('figure')?.querySelector('pre')?.textContent ?? '';
      let message = 'Kopyalandı';
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        // Clipboard API yoksa (http, eski tarayıcı) eski yönteme düş.
        if (!copyWithSelection(code)) message = 'Kopyalanamadı';
      }
      button.textContent = message;
      setAnnouncement(message);
      window.setTimeout(() => {
        button.textContent = 'Kopyala';
        setAnnouncement('');
      }, 2000);
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [html]);

  useEffect(() => {
    const root = ref.current;
    if (!hasMermaid || !root) return;
    let cancelled = false;
    // Mermaid büyük bir paket; yalnızca diyagram içeren sayfada ve ihtiyaç anında yüklenir.
    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled) return;
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: dark ? 'dark' : 'neutral',
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
      });
      mermaid.run({ nodes: root.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])') });
    });
    return () => {
      cancelled = true;
    };
  }, [html, hasMermaid]);

  return (
    <>
      <div ref={ref} className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
