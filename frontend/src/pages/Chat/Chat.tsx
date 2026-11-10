import { usePageTitle } from '../../lib/usePageTitle';

export default function Chat() {
  usePageTitle('Ask');

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
      <p className="font-mono text-xs tracking-wider text-textFaint">03 / ASK</p>
      <h1 className="mt-3 font-sans text-2xl font-semibold text-text">
        Portfolio RAG Agent
      </h1>
      <p className="mt-2 max-w-[72ch] font-sans text-sm text-textMuted">
        Answers are drawn only from my projects, writing, and experience. Full
        agent interface ships in Phase 2.
      </p>
    </section>
  );
}