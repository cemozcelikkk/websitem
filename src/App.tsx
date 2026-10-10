import Header from './components/Header';
import About from './components/About';
import Projects from './components/Projects';

function App() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 md:py-12 md:pl-[9vw] md:pr-[6vw]">
      <div className="max-w-5xl">
        <Header />
        <main>
          <About />
          <Projects />
        </main>
        <footer className="mt-32 flex flex-wrap justify-between gap-4 border-t border-rule pt-4 pb-8 font-mono text-xs text-graphite">
          <a
            href="mailto:cemozcelik295@gmail.com"
            className="link-draw pb-0.5 hover:text-ink"
          >
            cemozcelik295@gmail.com
          </a>
          <span>React + Tailwind CSS</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
