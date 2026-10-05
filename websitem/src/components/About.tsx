export default function About() {
  return (
    <section
      id="about"
      className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
      aria-label="Hakkımda"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          Hakkımda
        </h2>
      </div>
      <div>
        <p className="mb-4 text-slate-400 leading-relaxed">
          Çukurova Üniversitesi Bilgisayar Bilimleri 4. sınıf öğrencisiyim.
          Yazılım geliştirme süreçlerine olan ilgim, akademik eğitimimle birleşerek
          beni uçtan uca çözümler üretebilen bir geliştirici haline getirdi.
        </p>
        <p className="mb-4 text-slate-400 leading-relaxed">
          Odak alanım{' '}
          <span className="text-slate-200 font-medium">FastAPI</span>,{' '}
          <span className="text-slate-200 font-medium">Django</span>,{' '}
          <span className="text-slate-200 font-medium">Flask</span>,{' '}
          <span className="text-slate-200 font-medium">React</span> ve{' '}
          <span className="text-slate-200 font-medium">Python</span>{' '}
          ekosistemleri ile web platformları ve REST API geliştirme üzerine yoğunlaşmaktadır.
        </p>
        <p className="text-slate-400 leading-relaxed">
          Altyapı ve dağıtım tarafında{' '}
          <span className="text-slate-200 font-medium">AWS EC2</span>,{' '}
          <span className="text-slate-200 font-medium">Cloudflare</span> DNS/SSL,{' '}
          <span className="text-slate-200 font-medium">Vercel</span> ve{' '}
          <span className="text-slate-200 font-medium">Git/GitHub</span>{' '}
          CI/CD süreçlerinin bizzat yönetimi ve yapılandırması konularında deneyim sahibiyim.
        </p>
      </div>
    </section>
  );
}
