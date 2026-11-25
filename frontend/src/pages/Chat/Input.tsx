import { type KeyboardEvent, useEffect, useRef } from 'react';

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAbort: () => void;
  isSending: boolean;
}

const MIN_LENGTH = 2;
const MAX_LENGTH = 1000;

export function Input({
  value,
  onChange,
  onSubmit,
  onAbort,
  isSending,
}: InputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const trimmedLength = value.trim().length;
  const isValid = trimmedLength >= MIN_LENGTH && trimmedLength <= MAX_LENGTH;

  // Auto-resize textarea up to 120px so it never takes over the viewport
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isValid && !isSending) {
        onSubmit();
      }
    }
  };

  return (
    <div className="border-t border-border bg-ink/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 transition-colors focus-within:border-accent/60">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Plinth, Bantay PH, Vouch, tech stack, or availability..."
            maxLength={MAX_LENGTH}
            aria-label="Ask a question about John Francis Vecina's work"
            className="max-h-30 min-h-6 flex-1 resize-none bg-transparent py-0.5 font-sans text-sm text-text placeholder:text-textFaint focus:outline-none"
          />

          <div className="flex shrink-0 items-center gap-2">
            {value.length > 700 && (
              <span
                className={`font-mono text-[11px] ${
                  trimmedLength > MAX_LENGTH ? 'text-red-400' : 'text-textFaint'
                }`}
              >
                {trimmedLength}/{MAX_LENGTH}
              </span>
            )}

            {isSending ? (
              <button
                type="button"
                onClick={onAbort}
                className="cursor-pointer rounded-lg border border-border bg-ink px-3 py-1.5 font-mono text-xs font-medium text-textMuted transition-colors hover:border-textMuted hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                Stop
              </button>
            ) : (
              <button
                type="button"
                disabled={!isValid}
                onClick={onSubmit}
                className="cursor-pointer rounded-lg bg-accent px-3.5 py-1.5 font-sans text-xs font-medium text-ink transition-opacity duration-150 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ask →
              </button>
            )}
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className="font-mono text-[11px] text-textFaint">
            Grounded strictly in documented projects &amp; experience
          </p>
          <p className="hidden font-mono text-[11px] text-textFaint sm:block">
            Enter to send · Shift+Enter for newline
          </p>
        </div>
      </div>
    </div>
  );
}