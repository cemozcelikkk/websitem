interface Project {
  kind: string;
  title: string;
  url?: string;
  summary: string;
  notes: string[];
  stack: string[];
}

const projects: Project[] = [
  {
    kind: 'web',
    title: 'Karavan',
    url: 'https://krvn.cemozcelik.dev',
    summary: "Türkiye'deki karavancıların gittikleri yerleri artıları, eksileri ve fotoğraflarıyla haritada işaretlediği uygulama.",
    notes: [
      'Konumlar PostgreSQL + PostGIS üzerinde tutuluyor; SQLAlchemy (async) ve GeoAlchemy2 ile mekânsal sorgular yapılıyor, şema değişiklikleri Alembic ile yönetiliyor.',
      'Yüklenen görseller Pillow ile işlenip aioboto3 üzerinden S3 uyumlu depolamaya gönderiliyor.',
      'Kimlik doğrulama JWT (python-jose) ve bcrypt ile; istek doğrulaması Pydantic ile yapılıyor.',
      'Harita MapLibre GL ile çiziliyor; istemci tarafında state Zustand, sunucu verisi TanStack Query ve Axios ile yönetiliyor.',
      'Backend, frontend ve veritabanı Docker Compose ile tek komutla ayağa kalkıyor.',
    ],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'PostGIS', 'React 19', 'TypeScript', 'Tailwind CSS', 'MapLibre GL', 'Docker Compose'],
  },
  {
    kind: 'web',
    title: 'Mooii',
    url: 'https://mooii-co-chi.vercel.app',
    summary: 'İşletmeler için masadaki QR koddan açılan dijital menü.',
    notes: [
      'Menü neredeyse her zaman telefonda açılıyor; arayüz mobil ekrandan başlanarak tasarlandı.',
      "Repo Vercel'e bağlı: main'e giden her push canlıya çıkıyor, ayrı bir yayın adımı yok.",
    ],
    stack: ['React', 'JavaScript', 'Vercel'],
  },
  {
    kind: 'web',
    title: 'cevhersonmez.com',
    url: 'https://cevhersonmez.com',
    summary: 'Bir klinik psikolog için kurumsal web sitesi.',
    notes: [
      'Alan adı, DNS kayıtları, yönlendirmeler ve SSL Cloudflare üzerinden yönetiliyor.',
    ],
    stack: ['Frontend', 'Cloudflare DNS', 'SSL'],
  },
  // TODO: Aşağıdaki şablonları kendi bilgilerinle doldurup yorumdan çıkar.
  // {
  //   kind: 'staj',
  //   title: '<Şirket> — <proje adı>',
  //   summary: '<Ne yaptın, tek cümle.>',
  //   notes: ['<Hangi teknolojiyi neden seçtin / hangi sorunu çözdün?>'],
  //   stack: ['FastAPI'],
  // },
  // {
  //   kind: 'masaüstü',
  //   title: '<Uygulama adı>',
  //   summary: '<Ne işe yarıyor?>',
  //   notes: ["Python'u kurulu olmayan makinelerde çalışsın diye PyInstaller ile tek .exe olarak paketlendi."],
  //   stack: ['Python', 'PyInstaller'],
  // },
  // {
  //   kind: 'harita',
  //   title: '<Uygulama adı>',
  //   summary: '<Ne gösteriyor?>',
  //   notes: ['<Harita kütüphanesini / veri kaynağını neden seçtin?>'],
  //   stack: ['Leaflet'],
  // },
];

export default function Projects() {
  return (
    <section id="projects" aria-label="Projeler" className="fade-up mt-24 md:mt-36 [animation-delay:240ms]">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink">
        Günlük / işler
      </h2>
      <p className="mt-3 mb-8 text-lg text-graphite">
        Geliştirdiğim projelerin detaylarını{' '}
        <a
          href="https://github.com/cemozcelikkk"
          target="_blank"
          rel="noreferrer noopener"
          className="link-draw pb-0.5 text-ink [background-size:100%_1px] hover:opacity-80"
        >
          GitHub
        </a>{' '}
        profilimde bulabilirsiniz.
      </p>

      <ol className="space-y-5">
        {projects.map((project, i) => (
          <li
            key={project.title}
            className="group grid gap-x-8 gap-y-4 rounded-md border border-rule bg-card px-5 py-8 transition-colors duration-300 ease-out hover:border-rule-strong hover:bg-card-hover sm:px-8 md:grid-cols-[8rem_1fr] md:py-10"
          >
            <div className="flex gap-4 font-mono text-xs text-graphite md:flex-col md:gap-1 md:pt-1.5">
              <span>№ {String(i + 1).padStart(2, '0')}</span>
              <span>{project.kind}</span>
            </div>

            <div className="max-w-[62ch]">
              <h3 className="font-mono text-xl font-medium leading-snug tracking-tight text-ink md:text-[1.4rem]">
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group/link inline-flex items-baseline gap-2 focus-visible:outline-none"
                  >
                    <span className="link-draw pb-0.5 group-hover/link:[background-size:100%_1px] group-focus-visible/link:[background-size:100%_1px]">
                      {project.title}
                    </span>
                    <span
                      className="inline-block text-sm text-graphite transition-[translate,color] duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                    <span className="sr-only"> (yeni sekmede açılır)</span>
                  </a>
                ) : (
                  project.title
                )}
              </h3>
              <p className="mt-2 text-lg leading-[1.6] text-pretty text-graphite">{project.summary}</p>

              <ul className="mt-6 max-w-[60ch] space-y-3 text-[1.05rem] leading-[1.75] text-pretty text-body">
                {project.notes.map((note) => (
                  <li key={note} className="grid grid-cols-[1.5rem_1fr]">
                    <span className="font-mono text-graphite transition-colors duration-300 group-hover:text-body" aria-hidden="true">→</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>

              <ul className="mt-7 flex flex-wrap gap-2 font-mono text-xs" aria-label="Kullanılan teknolojiler">
                {project.stack.map((tech) => (
                  <li key={tech} className="rounded-sm border border-rule px-2 py-1 text-graphite transition-colors duration-300 group-hover:border-rule-strong">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
