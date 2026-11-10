import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  label?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function EmptyState({
  label = 'EMPTY',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 max-w-[72ch]">
      <p className="font-mono text-xs uppercase tracking-wider text-textFaint">
        {label}
      </p>
      <h2 className="mt-2 font-sans text-base font-medium text-text">
        {title}
      </h2>
      {description && (
        <p className="mt-1 font-sans text-sm text-textMuted">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
      {actionLabel && (actionTo || onAction) && (
        <div className="mt-4">
          {actionTo ? (
            <Button variant="ghost" to={actionTo}>
              {actionLabel}
            </Button>
          ) : (
            <Button variant="ghost" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}