import { usePageTitle } from '../lib/usePageTitle';

export default function About() {
  usePageTitle('About');

  return (
    <section className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24">
      <p className="font-mono text-xs tracking-wider text-textFaint">02 / ABOUT</p>
      <h1 className="mt-3 font-sans text-2xl font-semibold text-text">
        John Francis Vecina
      </h1>
      <p className="mt-2 max-w-[72ch] font-sans text-sm text-textMuted">
        Bio, experience timeline, and skills inventory ship in Phase 6.
      </p>
    </section>
  );
}