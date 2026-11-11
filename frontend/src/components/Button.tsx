import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'ghost' | 'subtle';
type Size = 'sm' | 'md';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    to?: undefined;
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<LinkProps, keyof BaseProps> & {
    to: string;
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
    to?: undefined;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    variant = 'primary',
    size = 'md',
    className = '',
    children,
  } = props;

  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variantClasses: Record<Variant, string> = {
    primary: 'bg-accent text-ink hover:bg-accent/90 font-medium',
    ghost:
      'bg-transparent border border-border text-text hover:border-textMuted hover:bg-surface2',
    subtle:
      'bg-transparent text-textMuted hover:text-text hover:bg-surface2',
  };

  const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  const combinedClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  if (typeof props.to === 'string') {
    const {
      to,
      variant: _v,
      size: _s,
      className: _c,
      children: _ch,
      ...linkRest
    } = props as ButtonAsLink;
    return (
      <Link to={to} className={combinedClassName} {...linkRest}>
        {children}
      </Link>
    );
  }

  if (typeof props.href === 'string') {
    const {
      href,
      variant: _v,
      size: _s,
      className: _c,
      children: _ch,
      ...anchorRest
    } = props as ButtonAsAnchor;
    const isExternal = href.startsWith('http');
    return (
      <a
        href={href}
        className={combinedClassName}
        target={isExternal ? '_blank' : anchorRest.target}
        rel={isExternal ? 'noreferrer' : anchorRest.rel}
        {...anchorRest}
      >
        {children}
      </a>
    );
  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    type = 'button',
    ...buttonRest
  } = props as ButtonAsButton;

  return (
    <button type={type} className={combinedClassName} {...buttonRest}>
      {children}
    </button>
  );
};

export default Button;