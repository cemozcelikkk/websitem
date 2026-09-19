import { ExternalLink } from 'lucide-react';

interface Project {
  title: string;
  url: string;
  description: string;
  tags: string[];
}

const projects: Project[] = [
  {
    title: 'EduPortal — Öğrenci & Kurum Yönetim Sistemi',
    url: 'https://edu-portal-dusky.vercel.app',
    description:
      'Okul ve özel eğitim kurumlarının süreçlerini dijitalleştirmek amacıyla uçtan uca tasarlanan web tabanlı yönetim sistemi. Python ile ölçeklenebilir veritabanı mimarisi, AWS EC2 üzerinde sunucu yapılandırması ve bulut bütçe/güvenlik kurguları bizzat gerçekleştirildi.',
    tags: ['FastAPI', 'React', 'PostgreSQL', 'AWS EC2', 'Vercel'],
  },
  {
    title: 'Mooii — Dijital QR Menü Platformu',
    url: 'https://mooii-co-chi.vercel.app',
    description:
      'Gıda işletmeleri için geliştirilen mobil uyumlu dijital menü web platformu. CI/CD entegrasyonu Vercel üzerinden sağlanarak kesintisiz dağıtım kurgulandı.',
    tags: ['React', 'JavaScript', 'Vercel CI/CD', 'Responsive UI'],
  },
  {
    title: 'Cevher Sönmez — Kurumsal Web Sitesi',
    url: 'https://cevhersonmez.com',
    description:
      'Klinik psikolog için uçtan uca tasarlanan kurumsal web arayüzü. Alan adı yönlendirmeleri, SSL güvenliği ve DNS yönetim süreçleri Cloudflare altyapısı üzerinde yapılandırıldı.',
    tags: ['Frontend UI', 'Cloudflare DNS', 'SSL/Security'],
  },
];

export default function Projects() {
  return (
    <section
      id="projects"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-label="Projeler"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          Projeler
        </h2>
      </div>
      <div>
        <ol className="group/list">
          {projects.map((project) => (
            <li key={project.title} className="mb-12">
              <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                <div className="z-10 sm:col-span-full">
                  <h3 className="font-medium leading-snug text-slate-200">
                    <a
                      className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 group/link text-base"
                      href={project.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${project.title} (yeni sekmede açılır)`}
                    >
                      <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                      <span>
                        {project.title}
                        <ExternalLink
                          className="inline-block ml-1.5 h-4 w-4 shrink-0 translate-y-px transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 group-focus-visible/link:-translate-y-1 group-focus-visible/link:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </a>
                  </h3>
                  <p className="mt-2 text-sm leading-normal text-slate-400">
                    {project.description}
                  </p>
                  <ul className="mt-4 flex flex-wrap" aria-label="Teknolojiler">
                    {project.tags.map((tag) => (
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
          ))}
        </ol>
      </div>
    </section>
  );
}
