import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Spotlight from './components/Spotlight';
import About from './components/About';
import Education from './components/Education';
import Projects from './components/Projects';

function App() {
  const [activeSection, setActiveSection] = useState('about');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const sectionIds = ['about', 'education', 'projects'];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });
  }, []);

  useEffect(() => {
    setupObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupObserver]);

  return (
    <div className="relative">
      <Spotlight />
      <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
        <div className="lg:flex lg:justify-between lg:gap-4">
          <Sidebar activeSection={activeSection} />
          <main id="content" className="pt-24 lg:w-1/2 lg:py-24">
            <About />
            <Education />
            <Projects />
            <footer className="max-w-md pb-16 text-sm text-slate-500 sm:pb-0">
              <p>
                <a
                  href="https://brittanychiang.com"
                  className="font-medium text-slate-400 hover:text-teal-300 focus-visible:text-teal-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  Brittany Chiang
                </a>
                {' '}tasarımından ilham alınarak{' '}
                <span className="font-medium text-slate-400">Cem Özçelik</span> için oluşturuldu.
                {' '}
                <a
                  href="https://react.dev"
                  className="font-medium text-slate-400 hover:text-teal-300 focus-visible:text-teal-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  React
                </a>
                {' '}&{' '}
                <a
                  href="https://tailwindcss.com"
                  className="font-medium text-slate-400 hover:text-teal-300 focus-visible:text-teal-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tailwind CSS
                </a>
                {' '}ile geliştirildi.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
