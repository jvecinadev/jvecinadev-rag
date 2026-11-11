import { Link, NavLink } from 'react-router-dom';
import { Button } from './Button';

const NAV_LINKS = [
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
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
          className="font-mono text-sm font-medium tracking-tight text-text transition-colors duration-150 hover:text-textMuted focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-sm"
        >
          jvecina.dev
        </Link>

        <div className="flex items-center gap-5 sm:gap-6">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-sans text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-sm ${
                  isActive
                    ? 'text-text font-medium'
                    : 'text-textMuted hover:text-text'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <Button variant="primary" size="sm" to="/chat">
            Ask →
          </Button>
        </div>
      </nav>
    </header>
  );
}

export default Nav;