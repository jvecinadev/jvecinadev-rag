import { usePageTitle } from '../lib/usePageTitle';

export default function Work() {
  usePageTitle('Work');

  return (
    <section className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24">
      <p className="font-mono text-xs tracking-wider text-textFaint">01 / WORK</p>
      <h1 className="mt-3 font-sans text-2xl font-semibold text-text">
        Selected Projects
      </h1>
      <p className="mt-2 font-sans text-sm text-textMuted">
        Full project index ships in Phase 5.
      </p>
    </section>
  );
}