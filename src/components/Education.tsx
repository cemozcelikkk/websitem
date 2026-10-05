export default function Education() {
  return (
    <section
      id="education"
      aria-label="Eğitim"
      className="fade-up mt-24 grid gap-x-8 gap-y-2 md:mt-32 md:grid-cols-[9rem_1fr] [animation-delay:360ms]"
    >
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-graphite md:pt-1">Okul</h2>
      <div className="max-w-[60ch]">
        <p className="text-lg text-ink">
          Çukurova Üniversitesi, Bilgisayar Bilimleri — 4. sınıf
          <span className="ml-3 font-mono text-xs text-graphite">2023 —</span>
        </p>
        <p className="mt-2 leading-relaxed text-graphite">
          Veri yapıları, algoritmalar, nesne yönelimli programlama, ilişkisel veritabanları.
        </p>
      </div>
    </section>
  );
}
