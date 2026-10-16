import { useEffect, useRef } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import ChapterPage from './pages/ChapterPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import PostPage from './pages/PostPage';
import ProjectPage from './pages/ProjectPage';
import ProjectsPage from './pages/ProjectsPage';
import TopicPage from './pages/TopicPage';
import { useLocation } from './router';
import { matchRoute, type Route } from './routes';
import { applySeo, seoForRoute } from './seo';

function Page({ route, search }: { route: Route; search: string }) {
  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'blog':
      return <BlogPage search={search} />;
    case 'post':
      return <PostPage key={route.slug} slug={route.slug} />;
    case 'topic':
      return <TopicPage key={route.topic} topic={route.topic} />;
    case 'chapter':
      return <ChapterPage key={`${route.topic}/${route.slug}`} topic={route.topic} slug={route.slug} />;
    case 'projects':
      return <ProjectsPage />;
    case 'project':
      return <ProjectPage key={route.slug} slug={route.slug} />;
    case 'about':
      return <AboutPage />;
    case 'notFound':
      return <NotFoundPage />;
  }
}

function App() {
  const { pathname, search } = useLocation();
  const route = matchRoute(pathname);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    applySeo(seoForRoute(matchRoute(pathname), pathname));
    // İlk yüklemede değil, sayfa geçişlerinde odağı içeriğe taşı (ekran okuyucular için).
    if (firstRender.current) {
      firstRender.current = false;
    } else if (!window.location.hash) {
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 md:py-12 md:pl-[9vw] md:pr-[6vw]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:bg-paper focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-ink focus:outline-1">
        İçeriğe geç
      </a>
      <div className="max-w-5xl">
        <Header pathname={pathname} />
        <main id="main" ref={mainRef} tabIndex={-1} className="outline-none">
          <Page route={route} search={search} />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
