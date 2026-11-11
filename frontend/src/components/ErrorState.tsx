import { Button } from './Button';

export interface ErrorStateProps {
  label?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  actionTo?: string;
  actionLabel?: string;
}

export function ErrorState({
  label = 'REQUEST FAILED',
  message,
  onRetry,
  retryLabel = 'Retry',
  actionTo,
  actionLabel = 'Ask my portfolio →',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-border bg-surface p-6 max-w-[72ch]"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-textFaint">
        {label}
      </p>
      <p className="mt-2 font-sans text-sm text-textMuted">{message}</p>

      {(onRetry || actionTo) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {onRetry && (
            <Button variant="ghost" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {actionTo && (
            <Button variant="ghost" to={actionTo}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}