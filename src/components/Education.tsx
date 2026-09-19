
const tags = [
  'Python', 'FastAPI', 'Django', 'Flask', 'React', 'TypeScript',
  'PostgreSQL', 'Supabase', 'MySQL', 'AWS EC2', 'Cloudflare',
  'Vercel', 'Git/GitHub', 'REST APIs', 'Tailwind CSS',
];

export default function Education() {
  return (
    <section
      id="education"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-label="Eğitim ve Yetkinlikler"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          Eğitim & Yetkinlikler
        </h2>
      </div>
      <div>
        <ol className="group/list">
          <li className="mb-12">
            <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
              <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
              <header
                className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2"
                aria-label="2023 — Günümüz"
              >
                2023 — Günümüz
              </header>
              <div className="z-10 sm:col-span-6">
                <h3 className="font-medium leading-snug text-slate-200">
                  <span>Çukurova Üniversitesi — Bilgisayar Bilimleri (Lisans)</span>
                  <span className="ml-2 text-sm text-slate-400">4. Sınıf</span>
                </h3>
                <p className="mt-2 text-sm leading-normal text-slate-400">
                  Veri Yapıları, Algoritmalar, OOP, SDLC prensipleri ve İlişkisel Veritabanı Mimarisi
                  konularında derinlemesine eğitim almaktayım.
                </p>
                <ul className="mt-4 flex flex-wrap" aria-label="Teknolojiler">
                  {tags.map((tag) => (
                    <li key={tag} className="mr-1.5 mt-2">
                      <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                        {tag}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
