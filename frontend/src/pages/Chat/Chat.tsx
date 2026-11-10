import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { api } from '../../api';
import type {
  ChatFeedbackRequest,
  ChatFeedbackResponse,
  ChatRequest,
  ChatResponse,
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

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ValidationErrorResponse>(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    if (status === 422) {
      const firstValidationError = data?.errors?.question?.[0];
      if (firstValidationError) {
        return firstValidationError;
      }
      if (data?.message) {
        return data.message;
      }
    }
  }
  return 'Something went wrong while generating an answer.';
}

export default function Chat() {
  usePageTitle('Ask');

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

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
  }, [turns, scrollToBottom]);

  // Cleanup any in-flight request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const executeQuestion = useCallback(
    async (questionText: string, existingTurnId?: string) => {
      const trimmed = questionText.trim();
      if (trimmed.length < 2 || trimmed.length > 1000 || isSending) {
        return;
      }

      const turnId =
        existingTurnId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const controller = new AbortController();
      abortControllerRef.current = controller;
      activeTurnIdRef.current = turnId;
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
          setIsSending(false);
        }
      }
    },
    [isSending]
  );

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
          // Fire-and-forget per spec; swallow errors
        });
    },
    []
  );

  return (
    <section className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Scrollable Message Log */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation with portfolio agent"
        className="flex-1 overflow-y-auto px-4 py-8 sm:py-12"
      >
        <div className="mx-auto max-w-[72ch] space-y-8">
          {turns.length === 0 ? (
            <div className="space-y-6 pt-4 sm:pt-8">
              <div className="space-y-3">
                <SectionLabel index="03" label="ASK" />
                <h1 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                  Ask my portfolio anything.
                </h1>
                <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
                  Answers are drawn only from my projects, writing, and
                  experience. Every claim links to its source.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <p className="font-mono text-xs text-textFaint">
                  SUGGESTED QUESTIONS
                </p>
                <SuggestedQuestions
                  onSelect={handleSelectSuggested}
                  disabled={isSending}
                />
              </div>
            </div>
          ) : (
            turns.map((turn) => (
              <Message
                key={turn.id}
                turn={turn}
                onRetry={handleRetry}
                onFeedback={handleFeedback}
                onSelectQuestion={handleSelectSuggested}
                isBusy={isSending}
              />
            ))
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