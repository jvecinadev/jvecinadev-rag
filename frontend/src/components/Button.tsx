import React from 'react';
import { Link } from 'react-router-dom';

export type Variant = 'primary' | 'ghost' | 'subtle' | 'icon';
export type Size = 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  to,
  href,
  target,
  rel,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variantClasses: Record<Variant, string> = {
    primary: 'bg-accent text-ink hover:bg-accent/90 font-medium',
    ghost:
      'bg-transparent border border-border text-text hover:border-textMuted hover:bg-surface2',
    subtle:
      'bg-transparent text-textMuted hover:text-text hover:bg-surface2',
    icon:
      'bg-transparent border border-transparent text-textMuted hover:text-text hover:bg-surface2 hover:border-border',
  };

  const sizeClasses: Record<Size, string> = {
    sm: variant === 'icon' ? 'p-1.5 text-xs' : 'px-3 py-1.5 text-xs',
    md: variant === 'icon' ? 'p-2 text-sm' : 'px-4 py-2 text-sm',
  };

  const combinedClassName =
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  if (typeof to === 'string') {
    return (
      <Link to={to} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  if (typeof href === 'string') {
    const isExternal = href.startsWith('http');
    return (
      <a
        href={href}
        className={combinedClassName}
        target={target ?? (isExternal ? '_blank' : undefined)}
        rel={rel ?? (isExternal ? 'noreferrer' : undefined)}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={combinedClassName} {...rest}>
      {children}
    </button>
  );
};

export default Button;