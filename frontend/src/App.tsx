import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Work = lazy(() => import('./pages/Work'));
const Project = lazy(() => import('./pages/Project'));
const About = lazy(() => import('./pages/About'));
const Chat = lazy(() => import('./pages/Chat/Chat'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteSkeleton() {
  return (
    <div className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-[72ch] space-y-4">
        <div className="h-3 w-28 rounded-lg bg-surface2 animate-pulse" />
        <div className="h-10 w-3/4 rounded-lg bg-surface2 animate-pulse" />
        <div className="h-4 w-1/2 rounded-lg bg-surface2 animate-pulse" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-ink text-text bg-[radial-gradient(circle,#27272A_1px,transparent_1px)] bg-size-[24px_24px]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-accent focus:bg-surface2 focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-text focus:outline-none"
      >
        Skip to main content
      </a>

      <Nav />

      <main id="main-content" className="flex-1">
        <Suspense fallback={<RouteSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<Project />} />
            <Route path="/about" element={<About />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
} 