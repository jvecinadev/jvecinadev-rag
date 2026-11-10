import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';

export default function NotFound() {
  usePageTitle('404 Not Found');

  return (
    <section className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-[72ch] space-y-4">
        <p className="font-mono text-xs tracking-wider text-textFaint">
          404 / NOT FOUND
        </p>
        <h1 className="font-sans text-2xl font-semibold text-text">
          That page doesn&apos;t exist. But you can ask me about anything I&apos;ve built.
        </h1>
        <div>
          <Link
            to="/chat"
            className="inline-block rounded-lg border border-accent/40 bg-surface px-4 py-2 font-mono text-xs font-medium text-accent transition-colors duration-150 hover:border-accent hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            Ask me anything →
          </Link>
        </div>
      </div>
    </section>
  );
}