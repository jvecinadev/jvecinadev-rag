import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-ink">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-textFaint">
            <span className="text-textMuted">John Francis Vecina</span>
            <a
              href="mailto:contact@jvecina.dev"
              className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
            >
              contact@jvecina.dev
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
            >
              github
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
            >
              linkedin
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
            >
              resume.pdf
            </a>
          </div>

          <p className="font-mono text-xs text-textFaint">
            Answers on this site are grounded in my real content —{' '}
            <Link
              to="/chat"
              className="text-textMuted underline underline-offset-4 transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
            >
              see how it works.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}