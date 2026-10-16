# cemozcelik.dev

Kişisel site + teknik blog. Vite + React 19 + Tailwind CSS 4. Sayfalar build sırasında
statik HTML olarak üretilir (SSG), tarayıcıda React ile hydrate edilir.

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu (taslaklar görünmez) |
| `npm run dev:drafts` | Geliştirme sunucusu, taslaklar dahil |
| `npm run build` | Typecheck + istemci build + SSR build + prerender → `dist/` |
| `npm run build:drafts` | Taslaklı build — **yalnızca yerel önizleme, deploy etme** |
| `npm run preview` | `dist/` klasörünü yerelde sunar |
| `npm test` | İçerik doğrulama ve Markdown işleme testleri |
| `npm run test:dist` | `npm run build` sonrası `dist/` çıktısını doğrular |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc -b` |

## Yapı

```
content/
  blog/*.md          Blog yazıları (dosya adı = slug)
  projects/*.md      Projeler
build/               Build zamanı kodu (Node): Markdown → HTML, doğrulama, Vite eklentisi
scripts/prerender.ts Her adres için HTML, 404.html, sitemap.xml, rss.xml üretir
src/
  content/categories.ts   Blog kategorileri (tek kaynak)
  site.ts                 Site adresi ve sosyal bağlantılar
  router.ts, routes.ts    Bağımlılıksız router ve adresler
  seo.ts                  Sayfa başına title/description/canonical/OG/JSON-LD
  pages/, components/
tests/               node:test testleri ve örnek içerik (fixtures)
```

Adresler: `/`, `/blog`, `/blog/:slug` (yazı veya rehber konusu), `/blog/:konu/:bolum`, `/projeler`, `/projeler/:slug`, `/hakkimda`, diğerleri → 404.

## Blog yazısı eklemek

1. `content/blog/<slug>.md` oluştur:

   ```md
   ---
   title: Yazının başlığı
   description: Liste ve arama sonuçlarında görünen tek-iki cümlelik özet.
   date: 2026-10-14          # yayımlanan yazıda zorunlu (YYYY-AA-GG)
   updatedAt: 2026-10-20     # isteğe bağlı
   category: devops          # src/content/categories.ts içindeki id'lerden biri
   tags: [docker, nginx]     # isteğe bağlı
   featured: false           # true ise ana sayfada "Öne çıkan yazı"
   draft: true               # zorunlu; true iken hiçbir yerde yayımlanmaz
   series: oracle-cloud      # isteğe bağlı; seriesOrder ile birlikte
   seriesOrder: 1
   relatedProject: karavan   # content/projects içindeki bir proje slug'ı
   repositoryUrl: https://github.com/...
   coverImage: /images/kapak.png
   ---

   ## İlk bölüm
   ```

2. `npm run dev:drafts` ile önizle. Desteklenen öğelerin hepsi için
   `content/blog/yazim-rehberi.md` taslağına bak (kod blokları, `console`/`output`
   terminal blokları, tablolar, görseller, Mermaid).
3. Hazır olunca `draft: false` yap, `date` ver, `npm run build`.

Notlar:
- Gövdede `#` (h1) kullanma; `##` ve `###` otomatik içindekilere girer.
- Okuma süresi içerikten hesaplanır.
- Görselleri `public/` altına koy, `/images/x.png` gibi kök yoldan ver.
- Hatalı veya eksik metadata build'i dosya ve alan adıyla birlikte durdurur.
- Yeni kategori: `src/content/categories.ts` dosyasına bir satır ekle.

## Rehberler (hiyerarşik konular)

Yazılar → Konu → Bölüm: `/blog/ubuntu` → `/blog/ubuntu/virtualbox-ubuntu-kurulum`.
Konu, kategoriden ayrı bir kavramdır: kendi sıralı bölümleri olan bir koleksiyon.
Kategori filtreleri `/blog` sayfasındaki yazılar için çalışmaya devam eder.

```
content/guides/
  ubuntu/
    index.md                      konu bilgisi
    virtualbox-ubuntu-kurulum.md  bölüm (dosya adı = slug)
    ...
```

`index.md`:

```md
---
title: Ubuntu
description: Konu sayfasında ve /blog listesinde görünen açıklama.
order: 1        # /blog'daki konu sırası
draft: false    # true ise konu ve tüm bölümleri yayımlanmaz
---
İsteğe bağlı giriş metni.
```

Bölüm dosyası:

```md
---
title: VirtualBox ile Ubuntu 24.04 Kurulum Rehberi
shortTitle: Kurulum      # isteğe bağlı, breadcrumb'da görünür
description: ...
topic: ubuntu            # klasör adıyla aynı olmalı
order: 1                 # bölüm sırası (dosya adından bağımsız, konu içinde tekil)
category: devops         # src/content/categories.ts
date: 2026-10-20         # isteğe bağlı; verilirse RSS'e girer
updatedAt: 2026-10-25    # isteğe bağlı
draft: true
---
```

- **Yeni bölüm:** klasöre yeni bir `.md` ekle, `order` ver. Önceki/sonraki bağlantıları ve listeler otomatik.
- **Yeni konu (ör. Docker):** `content/guides/docker/index.md` ve bölümleri oluştur. Komponent değişikliği gerekmez.
- Konu klasör adı mevcut bir blog yazısının slug'ıyla aynı olamaz (build hata verir), böylece `/blog/<slug>` adresleri bozulmaz.
- Teknik not kutuları: `> [!NOT]`, `> [!IPUCU]`, `> [!ONEMLI]`, `> [!UYARI]`, `> [!DIKKAT]` (GitHub adları da geçerli).
- Hata çıktısı: ` ```error ` (veya ` ```hata `) kod bloğu.

## Proje eklemek

`content/projects/<slug>.md`:

```md
---
title: Offgrid AI
kind: mobil
order: 4
summary: Tek cümlelik açıklama.
url: https://...              # isteğe bağlı, canlı adres
repositoryUrl: https://...    # isteğe bağlı
stack: [Kotlin, llama.cpp]
notes:
  - Teknik not / karar
---

## Problem ve hedef
## Mimari
## Teknik zorluklar
## Sonuç
```

Gövde isteğe bağlıdır; yalnızca yazılan bölümler gösterilir. Bir yazıyı projeye bağlamak
için yazıda `relatedProject: <slug>` kullan.

## Deploy

`npm run build` sonrası `dist/` klasörü tamamen statiktir. Sunucunun şunları yapması gerekir:

- `/blog/x` isteğine `dist/blog/x/index.html` dönmek (sondaki `/` olmadan, yönlendirmesiz)
- Bulunmayan adreslerde `dist/404.html`'i **404 durum koduyla** dönmek

nginx örneği:

```nginx
root /var/www/cemozcelik.dev/dist;
location / {
  try_files $uri $uri/index.html =404;
}
error_page 404 /404.html;
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

Cloudflare Pages / Netlify / Vercel (statik) bu davranışı varsayılan olarak destekler;
build komutu `npm run build`, çıktı klasörü `dist`.
