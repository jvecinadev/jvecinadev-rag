import { Link, NavLink } from 'react-router-dom';
import { Button } from './Button';

const NAV_ITEMS = [
  { to: '/work', label: 'Work', monoLabel: '01 / WORK' },
  { to: '/about', label: 'About', monoLabel: '02 / ABOUT' },
  { to: '/chat', label: 'Chat', monoLabel: '03 / CHAT' },
] as const;

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink/85 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-300 items-center justify-between px-4 sm:px-6"
      >
        <Link
          to="/"
          className="font-mono text-sm font-medium tracking-tight text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg px-1 py-0.5"
        >
          jvecina.dev
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-sans text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg px-2 py-1 ${
                  isActive
                    ? 'text-text font-medium'
                    : 'text-textMuted hover:text-text'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-textMuted">
            <span
              className="h-2 w-2 rounded-full bg-accent"
              aria-hidden="true"
            />
            <span>Available · Manila</span>
          </div>

          <Button variant="primary" to="/chat" className="px-3 py-1.5 text-xs">
            Ask →
          </Button>
        </div>
      </nav>

      <nav
        aria-label="Mobile navigation"
        className="grid grid-cols-3 border-t border-border bg-surface/90 md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-center border-r last:border-r-0 border-border py-2.5 font-mono text-[11px] tracking-wider transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/40 ${
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-textMuted hover:text-text'
              }`
            }
          >
            {item.monoLabel}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}