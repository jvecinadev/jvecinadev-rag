import { useParams } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';

export default function Project() {
  const { slug } = useParams<{ slug: string }>();
  usePageTitle(slug ? `Project: ${slug}` : 'Project');

  return (
    <section className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24">
      <p className="font-mono text-xs tracking-wider text-textFaint">
        01 / WORK / {slug}
      </p>
      <h1 className="mt-3 font-sans text-2xl font-semibold text-text">
        Project Case Study
      </h1>
      <p className="mt-2 font-sans text-sm text-textMuted">
        Case study view ships in Phase 5.
      </p>
    </section>
  );
}