import React from 'react';

export interface TagProps {
  children: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

export function Tag({ children, highlight = false, className = '' }: TagProps) {
  const surfaceClasses = highlight
    ? 'border-accent/40 bg-surface2 text-text'
    : 'border-border bg-surface text-textMuted';

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 font-mono text-xs uppercase tracking-wider ${surfaceClasses} ${className}`.trim()}
    >
      {children}
    </span>
  );
}