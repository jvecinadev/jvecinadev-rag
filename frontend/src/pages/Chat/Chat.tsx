import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { SectionLabel } from '../../components/SectionLabel';
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

const FOLLOW_UP_QUESTIONS = [
  'What is Alaala Collections and what tech stack does it use?',
  'Which of your projects use React?',
  "What's your experience with Laravel and PostgreSQL?",
  'How was this RAG system built?',
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

  const hasAutoSentRef = useRef<boolean>(false);
  const isSendingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeTurnIdRef = useRef<string | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (turns.length > 0) {
      scrollToBottom();
    }
  }, [turns, isSlowRequest, scrollToBottom]);

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
    );
  }, [turns]);

  return (
    <section className="flex h-[calc(100dvh-3.5rem)] flex-col">
      {/* Compact Header Bar when conversation is active */}
      {turns.length > 0 && (
        <div className="border-b border-border bg-ink/90 px-4 py-2.5">
          <div className="mx-auto flex max-w-[72ch] items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  serverReady === false ? 'bg-textFaint' : 'bg-accent'
                }`}
                aria-hidden="true"
              />
              <span className="font-sans text-xs font-medium text-textMuted">
                Portfolio Q&A
              </span>
              <span className="font-mono text-[11px] text-textFaint">
                · {turns.length} {turns.length === 1 ? 'question' : 'questions'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearChat}
              className="font-mono text-xs text-textMuted transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-sm px-1.5 py-0.5 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Message Log */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation with portfolio agent"
        className="flex-1 overflow-y-auto px-4 py-8 sm:py-12"
      >
        <div className="mx-auto max-w-[72ch] space-y-8">
          {turns.length === 0 ? (
            <div className="space-y-8 pt-2 sm:pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionLabel index="03" label="ASK" />
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-textFaint">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        serverReady === null
                          ? 'bg-textFaint animate-pulse'
                          : serverReady
                            ? 'bg-accent'
                            : 'bg-textFaint'
                      }`}
                      aria-hidden="true"
                    />
                    {serverReady === null
                      ? 'Connecting...'
                      : serverReady
                        ? 'Ready'
                        : 'Offline'}
                  </span>
                </div>

                <h1 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                  Ask my portfolio anything.
                </h1>
                <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
                  Answers are generated strictly from my projects, case studies,
                  and work experience. Every claim links directly to its source.
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-xs text-textFaint">
                  SUGGESTED QUESTIONS
                </p>
                <SuggestedQuestions
                  onSelect={handleSelectSuggested}
                  disabled={isSending}
                />
              </div>

              {/* Subtle Grounding Note */}
              <div className="rounded-lg border border-border bg-surface/60 px-4 py-3">
                <p className="font-sans text-xs leading-relaxed text-textFaint">
                  Grounded via PostgreSQL + pgvector retrieval. If a question
                  falls outside my documented work, the assistant will let you
                  know rather than guessing.
                </p>
              </div>
            </div>
          ) : (
            <>
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
                <p className="font-mono text-xs text-textFaint animate-pulse">
                  Waking up the server — first response after inactivity can
                  take ~20 seconds...
                </p>
              )}

              {/* Follow-up Suggestions */}
              {!isSending && remainingQuestions.length > 0 && (
                <div className="space-y-2.5 border-t border-border/60 pt-6">
                  <p className="font-mono text-[11px] text-textFaint">
                    FOLLOW-UP QUESTIONS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {remainingQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => handleSelectSuggested(question)}
                        className="rounded-md border border-border bg-surface px-3 py-1.5 text-left font-sans text-xs text-textMuted transition-colors duration-150 hover:border-textMuted hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={bottomAnchorRef} />
        </div>
      </div>

      {/* Pinned Input Bar */}
      <Input
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSendFromInput}
        onAbort={handleAbort}
        isSending={isSending}
      />
    </section>
  );
}