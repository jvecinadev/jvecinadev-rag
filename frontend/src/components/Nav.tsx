import { Link, NavLink } from 'react-router-dom';

export function Nav() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-ink/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-full max-w-300 items-center justify-between px-4 sm:px-6"
      >
        <Link
          to="/"
          className="font-mono text-sm font-medium tracking-tight text-text transition-colors duration-150 hover:text-textMuted focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg px-2 py-1 -ml-2"
        >
          jvecina.dev
        </Link>

        <div className="flex items-center gap-6">
          <NavLink
            to="/work"
            className={({ isActive }) =>
              `hidden sm:inline-block font-mono text-xs tracking-wider transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg px-2 py-1 ${
                isActive ? 'text-text' : 'text-textMuted hover:text-text'
              }`
            }
          >
            WORK
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `hidden sm:inline-block font-mono text-xs tracking-wider transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg px-2 py-1 ${
                isActive ? 'text-text' : 'text-textMuted hover:text-text'
              }`
            }
          >
            ABOUT
          </NavLink>

          <Link
            to="/chat"
            className="font-mono text-xs font-medium text-accent border border-accent/40 bg-surface px-3 py-1.5 rounded-lg transition-colors duration-150 hover:border-accent hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            Ask →
          </Link>
        </div>
      </nav>
    </header>
  );
}