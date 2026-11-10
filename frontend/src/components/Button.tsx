import React from 'react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'ghost' | 'icon';

interface BaseProps {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    to?: undefined;
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, keyof BaseProps> & {
    to: string;
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
    to?: undefined;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-mono text-xs font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'border border-accent bg-accent px-4 py-2.5 text-ink hover:bg-accent/90',
  ghost:
    'border border-border bg-surface px-4 py-2.5 text-text hover:border-accent/50 hover:bg-surface2',
  icon: 'border border-border bg-surface p-2 text-textMuted hover:border-accent/50 hover:bg-surface2 hover:text-text',
};

export function Button(props: ButtonProps) {
  const { variant = 'primary', className = '', children } = props;
  const combinedClassName = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`.trim();

  if ('to' in props && props.to !== undefined) {
    const {
      to,
      variant: _variant,
      className: _className,
      children: _children,
      ...linkRest
    } = props;
    return (
      <Link to={to} className={combinedClassName} {...linkRest}>
        {children}
      </Link>
    );
  }

  if ('href' in props && props.href !== undefined) {
    const {
      href,
      variant: _variant,
      className: _className,
      children: _children,
      ...anchorRest
    } = props;
    const isExternal = href.startsWith('http');
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : anchorRest.target}
        rel={isExternal ? 'noreferrer' : anchorRest.rel}
        className={combinedClassName}
        {...anchorRest}
      >
        {children}
      </a>
    );
  }

  const {
    variant: _variant,
    className: _className,
    children: _children,
    type = 'button',
    ...buttonRest
  } = props;

  return (
    <button type={type} className={combinedClassName} {...buttonRest}>
      {children}
    </button>
  );
}