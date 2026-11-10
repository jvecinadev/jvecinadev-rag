import React, { useRef, useEffect } from 'react';
import { Button } from '../../components/Button';

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAbort: () => void;
  isSending: boolean;
}

const MAX_LENGTH = 1000;
const COUNTER_THRESHOLD = 850;

export function Input({
  value,
  onChange,
  onSubmit,
  onAbort,
  isSending,
}: InputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const prevSendingRef = useRef<boolean>(isSending);

  // Keep focus in the textarea after sending completes or is aborted
  useEffect(() => {
    if (prevSendingRef.current && !isSending) {
      textareaRef.current?.focus();
    }
    prevSendingRef.current = isSending;
  }, [isSending]);

  const trimmedLength = value.trim().length;
  const isValid = trimmedLength >= 2 && value.length <= MAX_LENGTH;
  const showCounter = value.length >= COUNTER_THRESHOLD;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isSending && isValid) {
        onSubmit();
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      }
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSending && isValid) {
      onSubmit();
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  };

  return (
    <div className="border-t border-border bg-ink/95 backdrop-blur">
      <form
        onSubmit={handleFormSubmit}
        className="mx-auto max-w-[72ch] px-4 py-4 sm:px-0"
      >
        <div className="flex items-end gap-3 rounded-lg border border-border bg-surface p-2.5 focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/40">
          <label htmlFor="chat-question-input" className="sr-only">
            Ask a question about my projects or experience
          </label>
          <textarea
            id="chat-question-input"
            ref={textareaRef}
            rows={2}
            value={value}
            disabled={isSending}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about my projects, stack, or experience…"
            className="w-full resize-none bg-transparent font-sans text-sm text-text placeholder:text-textFaint focus:outline-none disabled:opacity-50"
          />

          <div className="flex shrink-0 items-center gap-2">
            {isSending ? (
              <Button
                variant="ghost"
                type="button"
                onClick={onAbort}
                aria-label="Stop generating response"
              >
                Stop
              </Button>
            ) : (
              <Button
                variant="primary"
                type="submit"
                disabled={!isValid}
                aria-label="Send question"
              >
                Ask →
              </Button>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between font-mono text-xs text-textFaint">
          <span>Enter to send · Shift+Enter for newline</span>
          {showCounter && (
            <span
              className={
                value.length > MAX_LENGTH ? 'text-accent' : 'text-textFaint'
              }
            >
              {value.length}/{MAX_LENGTH}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}