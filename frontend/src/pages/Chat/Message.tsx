import ReactMarkdown from 'react-markdown';
import type { ChatResponse } from '../../types/api';
import { Button } from '../../components/Button';
import { ErrorState } from '../../components/ErrorState';
import { Citation } from './Citation';
import { NoMatchCard } from './NoMatchCard';

export type AssistantStatus =
  | 'sending'
  | 'success'
  | 'no_match'
  | 'error'
  | 'aborted';

export interface ChatTurn {
  id: string;
  question: string;
  status: AssistantStatus;
  response?: ChatResponse;
  errorMessage?: string;
  feedback?: 1 | -1 | null;
}

export interface MessageProps {
  turn: ChatTurn;
  onRetry: (turnId: string) => void;
  onFeedback: (turnId: string, logId: number, value: 1 | -1) => void;
  onSelectQuestion: (question: string) => void;
  isBusy: boolean;
}

/**
 * Converts standalone inline citation markers like [1], [2] into inline code tokens
 * so ReactMarkdown renders them with our monospace emerald citation styling.
 */
function formatInlineCitations(markdown: string): string {
  return markdown.replace(/(?<!`)\[(\d+)\](?!\()/g, '`[$1]`');
}

export function Message({
  turn,
  onRetry,
  onFeedback,
  onSelectQuestion,
  isBusy,
}: MessageProps) {
  const { id, question, status, response, errorMessage, feedback } = turn;
  const feedbackSubmitted = feedback === 1 || feedback === -1;

  return (
    <div className="space-y-6">
      {/* User Bubble */}
      <div
        data-role="user"
        className="ml-auto w-fit max-w-[85%] sm:max-w-[75%] rounded-lg border border-border bg-surface2 px-4 py-3 font-sans text-sm leading-relaxed text-text wrap-break-word"
      >
        {question}
      </div>

      {/* Assistant Bubble */}
      <div data-role="assistant" className="w-full space-y-4">
        {status === 'sending' && (
          <div className="inline-flex items-center gap-2.5 py-1 font-mono text-xs text-textMuted">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span>Searching my portfolio…</span>
          </div>
        )}

        {status === 'aborted' && (
          <p className="font-mono text-xs text-textFaint">cancelled</p>
        )}

        {status === 'error' && (
          <ErrorState
            label="REQUEST FAILED"
            message={
              errorMessage ?? 'Something went wrong while generating an answer.'
            }
            onRetry={() => onRetry(id)}
          />
        )}

        {status === 'no_match' && response && (
          <NoMatchCard
            answer={response.answer}
            onSelectQuestion={onSelectQuestion}
            disabled={isBusy}
          />
        )}

        {status === 'success' && response && (
          <div className="space-y-4">
            <div className="space-y-3 font-sans text-sm sm:text-base leading-relaxed text-text">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="leading-relaxed text-text">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1.5 text-text">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1.5 text-text">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-text">
                      {children}
                    </strong>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noreferrer' : undefined}
                      className="text-accent underline underline-offset-4 hover:text-accent/80"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children }) => {
                    const text = String(children).trim();
                    if (/^\[\d+\]$/.test(text)) {
                      return (
                        <span className="font-mono text-xs font-medium text-accent px-0.5">
                          {text}
                        </span>
                      );
                    }
                    return (
                      <code className="rounded-lg border border-border bg-surface2 px-1.5 py-0.5 font-mono text-xs text-text">
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {formatInlineCitations(response.answer)}
              </ReactMarkdown>
            </div>

            {response.sources.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {response.sources.map((source) => (
                  <Citation
                    key={`${source.id}-${source.chunk_id}`}
                    source={source}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-3">
              <p className="font-mono text-xs text-textFaint">
                {(response.latency_ms / 1000).toFixed(2)}s ·{' '}
                {response.sources.length}{' '}
                {response.sources.length === 1 ? 'source' : 'sources'} · grounded
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="icon"
                  aria-label="Mark answer as helpful"
                  aria-pressed={feedback === 1}
                  disabled={feedbackSubmitted}
                  onClick={() => onFeedback(id, response.log_id, 1)}
                  className={
                    feedback === 1 ? 'border-accent text-accent' : ''
                  }
                >
                  <span aria-hidden="true">↑</span>
                </Button>

                <Button
                  variant="icon"
                  aria-label="Mark answer as unhelpful"
                  aria-pressed={feedback === -1}
                  disabled={feedbackSubmitted}
                  onClick={() => onFeedback(id, response.log_id, -1)}
                  className={
                    feedback === -1 ? 'border-accent text-accent' : ''
                  }
                >
                  <span aria-hidden="true">↓</span>
                </Button>

                {feedbackSubmitted && (
                  <span className="font-mono text-xs text-textFaint pl-1">
                    thanks
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}