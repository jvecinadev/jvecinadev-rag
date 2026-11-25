import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../api';
import type {
  ChatFeedbackRequest,
  ChatFeedbackResponse,
  ChatRequest,
  ChatResponse,
  HealthResponse,
} from '../../types/api';
import { usePageTitle } from '../../lib/usePageTitle';
import { type ChatTurn, Message } from './Message';
import { SuggestedQuestions } from './SuggestedQuestions';
import { Input } from './Input';

interface ValidationErrorResponse {
  message?: string;
  errors?: {
    question?: string[];
  };
  error?: string;
}

const QUICK_TOPICS: ReadonlyArray<{ label: string; question: string }> = [
  {
    label: 'Plinth SaaS',
    question: 'How does Plinth enforce tenant isolation and 4-tier RBAC?',
  },
  {
    label: 'Bantay PH',
    question:
      'How does Bantay PH prevent race conditions and stale JWT permissions?',
  },
  {
    label: 'Vouch AI',
    question: 'How does Vouch review git diffs locally and verify patches?',
  },
  {
    label: 'Availability & Fit',
    question:
      'What roles and freelance client projects are you currently available for?',
  },
];

const FOLLOW_UP_QUESTIONS = [
  'How does Plinth enforce tenant isolation and 4-tier RBAC?',
  'How does Bantay PH prevent race conditions and stale JWT permissions?',
  'How does Vouch review git diffs locally and verify patches?',
  'What is your experience with FastAPI, PostgreSQL, and pgvector?',
  'What roles and freelance client projects are you currently available for?',
] as const;

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ValidationErrorResponse>(err)) {
    const status = err.response?.status;
    const data = err.response?.data;

    if (status === 422) {
      const firstValidationError = data?.errors?.question?.[0];
      if (firstValidationError) return firstValidationError;
      if (data?.message) return data.message;
    }

    if (status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (data?.message) {
      return data.message;
    }
  }
  return 'Could not reach the server. Please try again.';
}

export default function Chat() {
  usePageTitle('Ask');

  const location = useLocation();

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSlowRequest, setIsSlowRequest] = useState<boolean>(false);
  const [serverReady, setServerReady] = useState<boolean | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);

  const hasAutoSentRef = useRef<boolean>(false);
  const isSendingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeTurnIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Lock outer document scroll while on /chat so the global footer never pulls in or shakes the screen
  useEffect(() => {
    window.scrollTo(0, 0);
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // Scroll ONLY the internal chat container
  const scrollChatToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const container = scrollContainerRef.current;
      if (!container) return;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
      });
    },
    []
  );

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || turns.length === 0) {
      setShowScrollBottom(false);
      return;
    }
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBottom(distanceFromBottom > 140);
  }, [turns.length]);

  const lastTurnStatus = turns[turns.length - 1]?.status;

  useEffect(() => {
    if (turns.length > 0) {
      scrollChatToBottom('smooth');
    }
  }, [turns.length, lastTurnStatus, scrollChatToBottom]);

  // Pre-warm the Render backend on mount and check health
  useEffect(() => {
    let active = true;
    api
      .get<HealthResponse>('/health')
      .then((res) => {
        if (active) setServerReady(Boolean(res.data?.ok));
      })
      .catch(() => {
        if (active) setServerReady(false);
      });

    return () => {
      active = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Show a calm note if the request takes > 5s (Render cold start)
  useEffect(() => {
    if (!isSending) {
      setIsSlowRequest(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setIsSlowRequest(true);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [isSending]);

  const executeQuestion = useCallback(
    async (questionText: string, existingTurnId?: string) => {
      const trimmed = questionText.trim();
      if (trimmed.length < 2 || trimmed.length > 1000 || isSendingRef.current) {
        return;
      }

      const turnId =
        existingTurnId ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const controller = new AbortController();
      abortControllerRef.current = controller;
      activeTurnIdRef.current = turnId;
      isSendingRef.current = true;
      setIsSending(true);

      if (existingTurnId) {
        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === existingTurnId
              ? { ...turn, status: 'sending', errorMessage: undefined }
              : turn
          )
        );
      } else {
        const newTurn: ChatTurn = {
          id: turnId,
          question: trimmed,
          status: 'sending',
          feedback: null,
        };
        setTurns((prev) => [...prev, newTurn]);
      }

      try {
        const payload: ChatRequest = { question: trimmed };
        const response = await api.post<ChatResponse>('/chat', payload, {
          signal: controller.signal,
        });

        const data = response.data;
        setServerReady(true);
        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === turnId
              ? {
                  ...turn,
                  status: data.no_match ? 'no_match' : 'success',
                  response: data,
                  errorMessage: undefined,
                }
              : turn
          )
        );
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          setTurns((prev) =>
            prev.map((turn) =>
              turn.id === turnId ? { ...turn, status: 'aborted' } : turn
            )
          );
        } else {
          const message = extractErrorMessage(err);
          setTurns((prev) =>
            prev.map((turn) =>
              turn.id === turnId
                ? { ...turn, status: 'error', errorMessage: message }
                : turn
            )
          );
        }
      } finally {
        if (activeTurnIdRef.current === turnId) {
          abortControllerRef.current = null;
          activeTurnIdRef.current = null;
          isSendingRef.current = false;
          setIsSending(false);
        }
      }
    },
    []
  );

  // Pre-seed & auto-send ?q=<text> once on mount
  useEffect(() => {
    if (hasAutoSentRef.current) {
      return;
    }

    const searchParams = new URLSearchParams(
      location.search || window.location.search
    );
    const rawQuery = searchParams.get('q');
    if (rawQuery === null) {
      return;
    }

    const trimmedQuery = rawQuery.trim();

    const timerId = window.setTimeout(() => {
      if (hasAutoSentRef.current) {
        return;
      }
      hasAutoSentRef.current = true;

      window.history.replaceState({}, '', window.location.pathname);

      if (trimmedQuery.length >= 2 && trimmedQuery.length <= 1000) {
        void executeQuestion(trimmedQuery);
      } else if (trimmedQuery.length > 0) {
        setInputValue(trimmedQuery.slice(0, 1000));
      }
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [location.search, executeQuestion]);

  const handleSendFromInput = useCallback(() => {
    const question = inputValue.trim();
    if (question.length < 2 || question.length > 1000 || isSending) {
      return;
    }
    setInputValue('');
    void executeQuestion(question);
  }, [inputValue, isSending, executeQuestion]);

  const handleSelectSuggested = useCallback(
    (question: string) => {
      if (isSending) return;
      void executeQuestion(question);
    },
    [isSending, executeQuestion]
  );

  const handleRetry = useCallback(
    (turnId: string) => {
      if (isSending) return;
      const targetTurn = turns.find((t) => t.id === turnId);
      if (!targetTurn) return;
      void executeQuestion(targetTurn.question, turnId);
    },
    [isSending, turns, executeQuestion]
  );

  const handleAbort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleClearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    activeTurnIdRef.current = null;
    isSendingRef.current = false;
    setIsSending(false);
    setTurns([]);
    setShowScrollBottom(false);
  }, []);

  const handleFeedback = useCallback(
    (turnId: string, logId: number, value: 1 | -1) => {
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === turnId ? { ...turn, feedback: value } : turn
        )
      );

      const payload: ChatFeedbackRequest = { log_id: logId, value };
      void api
        .post<ChatFeedbackResponse>('/chat/feedback', payload)
        .catch(() => {
          // Fire-and-forget per spec
        });
    },
    []
  );

  // Filter out suggested questions the user has already asked
  const remainingQuestions = useMemo(() => {
    const asked = new Set(
      turns.map((t) => t.question.trim().toLowerCase())
    );
    return FOLLOW_UP_QUESTIONS.filter(
      (q) => !asked.has(q.toLowerCase())
    ).slice(0, 3);
  }, [turns]);

  return (
    <section
      aria-label="Portfolio AI Assistant"
      className="fixed inset-0 pt-14 z-30 flex flex-col overflow-hidden bg-ink"
    >
      {/* Active Session Top Bar (only shown once conversation starts) */}
      {turns.length > 0 && (
        <div className="shrink-0 border-b border-border bg-surface/50 px-4 py-2 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  serverReady === false ? 'bg-textFaint' : 'bg-accent'
                }`}
                aria-hidden="true"
              />
              <span className="truncate font-sans text-xs font-medium text-text">
                Portfolio Assistant
              </span>
              <span className="font-mono text-[11px] text-textFaint">
                · {turns.length} {turns.length === 1 ? 'query' : 'queries'}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <Link
                to="/work"
                className="hidden font-mono text-[11px] text-textMuted transition-colors hover:text-text sm:inline"
              >
                Browse projects
              </Link>
              <button
                type="button"
                onClick={handleClearChat}
                className="cursor-pointer rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-textMuted transition-colors duration-150 hover:border-textMuted hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                Reset chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Conversation with portfolio assistant"
        className="relative flex flex-1 min-h-0 flex-col overflow-y-auto overscroll-contain px-4"
      >
        {turns.length === 0 ? (
          /* Empty State: Vertically centered, compact, fits in 1 screen without overlapping Input */
          <div className="mx-auto my-auto w-full max-w-3xl py-4 sm:py-6">
            <div className="space-y-5 sm:space-y-6">
              {/* Header Block */}
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      serverReady === null
                        ? 'animate-pulse bg-textFaint'
                        : serverReady
                          ? 'bg-accent'
                          : 'bg-textFaint'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[11px] text-textMuted">
                    {serverReady === null
                      ? 'Connecting to RAG index...'
                      : serverReady
                        ? 'Grounded RAG Index Ready'
                        : 'RAG Index Standby'}
                  </span>
                  <span className="hidden font-mono text-[11px] text-textFaint sm:inline">
                    · PostgreSQL + pgvector
                  </span>
                </div>

                <h1 className="font-sans text-xl font-semibold tracking-tight text-text sm:text-3xl">
                  Ask about my systems, stack, or experience.
                </h1>
                <p className="max-w-2xl font-sans text-xs leading-relaxed text-textMuted sm:text-sm">
                  Answers are generated strictly from my documented projects,
                  architecture notes, and work history, with source links on
                  every response.
                </p>
              </div>

              {/* Quick Topic Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 font-mono text-[11px] text-textFaint">
                  Quick ask:
                </span>
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    type="button"
                    disabled={isSending}
                    onClick={() => handleSelectSuggested(topic.question)}
                    className="cursor-pointer rounded-full border border-border bg-surface/60 px-2.5 py-1 font-mono text-[11px] text-textMuted transition-colors duration-150 hover:border-accent/50 hover:bg-surface hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>

              {/* Symmetrical 2x2 Starter Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-textFaint">
                    Suggested Prompts
                  </span>
                  <a
                    href="mailto:johnvecina640@gmail.com"
                    className="font-mono text-[11px] text-textMuted transition-colors hover:text-accent"
                  >
                    Direct email →
                  </a>
                </div>
                <SuggestedQuestions
                  onSelect={handleSelectSuggested}
                  disabled={isSending}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Active Conversation Log */
          <div className="mx-auto w-full max-w-3xl space-y-8 py-6 sm:py-8">
            <div className="space-y-8">
              {turns.map((turn) => (
                <Message
                  key={turn.id}
                  turn={turn}
                  onRetry={handleRetry}
                  onFeedback={handleFeedback}
                  onSelectQuestion={handleSelectSuggested}
                  isBusy={isSending}
                />
              ))}
            </div>

            {/* Render Cold-Start Notice */}
            {isSending && isSlowRequest && (
              <div className="rounded-lg border border-border bg-surface/60 px-4 py-3">
                <p className="font-mono text-xs text-textMuted animate-pulse">
                  Waking up the backend service. The first response after
                  inactivity can take around 20 seconds...
                </p>
              </div>
            )}

            {/* Follow-up Suggestions */}
            {!isSending && remainingQuestions.length > 0 && (
              <div className="space-y-2.5 border-t border-border/60 pt-5 pb-2">
                <p className="font-mono text-[11px] uppercase tracking-wider text-textFaint">
                  Follow-up questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {remainingQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleSelectSuggested(question)}
                      className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-left font-sans text-xs text-textMuted transition-colors duration-150 hover:border-accent/50 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Scroll-to-Bottom Button when scrolled up */}
        {showScrollBottom && turns.length > 0 && (
          <div className="sticky bottom-3 mx-auto flex justify-center pointer-events-none">
            <button
              type="button"
              onClick={() => scrollChatToBottom('smooth')}
              className="pointer-events-auto cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3 py-1 font-mono text-[11px] text-text shadow-md backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-accent"
            >
              ↓ Latest response
            </button>
          </div>
        )}
      </div>

      {/* Dedicated Bottom Composer Dock (never overlaps content) */}
      <div className="shrink-0">
        <Input
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSendFromInput}
          onAbort={handleAbort}
          isSending={isSending}
        />
      </div>
    </section>
  );
}