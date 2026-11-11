export const SUGGESTED_QUESTIONS: readonly string[] = [
  'What is your core tech stack and how do you structure full-stack applications?',
  'How do you handle authentication, RBAC, and validation across your backend APIs?',
  'What are the main projects you have built and what problems do they solve?',
  'How does this portfolio RAG pipeline retrieve and ground answers from your work?',
];

export interface SuggestedQuestionsProps {
  questions?: readonly string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({
  questions = SUGGESTED_QUESTIONS,
  onSelect,
  disabled = false,
}: SuggestedQuestionsProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="group flex items-start justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3.5 text-left transition-colors duration-150 hover:border-textFaint hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        >
          <span className="font-sans text-sm leading-snug text-textMuted transition-colors duration-150 group-hover:text-text">
            {question}
          </span>
          <span
            aria-hidden="true"
            className="mt-0.5 shrink-0 font-mono text-xs text-textFaint transition-colors duration-150 group-hover:text-accent"
          >
            →
          </span>
        </button>
      ))}
    </div>
  );
}

export default SuggestedQuestions;