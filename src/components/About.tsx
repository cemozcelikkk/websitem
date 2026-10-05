import type { ReactNode } from 'react';

// Metin içindeki anahtar kelimeler için hafif "kod" vurgusu
function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-[0.82em] text-ink">{children}</code>
  );
}

export default function About() {
  return (
    <section id="about" aria-label="Hakkımda" className="fade-up mt-20 md:mt-32 [animation-delay:120ms]">
      <h2 className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink">
        Hakkımda
      </h2>

      <div className="max-w-[62ch] space-y-6 text-lg leading-[1.75] text-pretty text-body md:text-xl">
        <p>
          <Code>Çukurova Üniversitesi</Code>'nde bilgisayar bilimleri okuyorum, son sınıftayım.
          Okulda algoritmaları ve veri yapılarını öğreniyorum; geri kalan zamanda insanların
          kullandığı küçük ürünler yapıyorum — <Code>API</Code>'sini yazıp sunucusunu kendim
          kurduğum, <Code>DNS</Code> kaydını kendim girdiğim türden.
        </p>
        <p>
          Aşağıdaki liste bir yetenek tablosu değil, bir günlük. Her işin altına neyi
          kullandığımı ve neden onu seçtiğimi not ettim.
        </p>
      </div>
    </section>
  );
}
