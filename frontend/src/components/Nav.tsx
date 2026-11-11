import { Link, NavLink } from 'react-router-dom';
import { Button } from './Button';

// Internal routes only. Chat is handled by the primary button.
const NAV_ITEMS = [
  { to: '/work', label: 'Work', monoLabel: '01 / WORK' },
  { to: '/about', label: 'About', monoLabel: '02 / ABOUT' },
] as const;

const EXTERNAL_LINKS = [
  { href: 'https://github.com/jvecinadev', label: 'GITHUB' },
  { href: 'https://linkedin.com/in/jvecinadev', label: 'LINKEDIN' },
  { href: '/resume.pdf', label: 'RESUME' }, // Assuming you put resume.pdf in public/
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink/85 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-300 items-center justify-between px-4 sm:px-6"
      >
        {/* LEFT: Wordmark */}
        <Link
          to="/"
          className="font-mono text-sm font-medium tracking-tight text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg px-1 py-0.5"
        >
          jvecina.dev
        </Link>

        {/* CENTER: Internal Links & External Links */}
        <div className="hidden md:flex items-center gap-8">
          
          {/* Internal Routes */}
          <div className="flex items-center gap-6">
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

          {/* Divider */}
          <div className="h-4 w-px bg-border" aria-hidden="true" />

          {/* External Links (Mono) */}
          <div className="flex items-center gap-5">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="font-mono text-[11px] tracking-wider text-textFaint transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* RIGHT: Status & CTA */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-textMuted tracking-wider">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
              aria-hidden="true"
            />
            <span>AVAILABLE · MANILA</span>
          </div>

          <Button variant="primary" to="/chat" className="px-3 py-1.5 text-xs">
            Ask →
          </Button>
        </div>
      </nav>

      {/* MOBILE: Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="grid grid-cols-3 border-t border-border bg-surface/90 md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-center border-r border-border py-2.5 font-mono text-[11px] tracking-wider transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/40 ${
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-textMuted hover:text-text'
              }`
            }
          >
            {item.monoLabel}
          </NavLink>
        ))}
        {/* Third slot for Mobile is the Chat/Ask button */}
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex items-center justify-center py-2.5 font-mono text-[11px] tracking-wider transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/40 ${
              isActive
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-textMuted hover:text-text'
            }`
          }
        >
          03 / ASK
        </NavLink>
      </nav>
    </header>
  );
}