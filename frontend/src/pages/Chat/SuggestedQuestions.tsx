export const SUGGESTED_QUESTIONS: readonly string[] = [
  'What is your core tech stack and how do you structure full-stack applications?',
  'How do you handle authentication, RBAC, and validation across your backend APIs?',
  'What are the main projects you have built and what problems do they solve?',
  'How does this portfolio RAG pipeline retrieve and ground answers from your work?',
];
export interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const SUGGESTED_PROMPTS: ReadonlyArray<{
  tag: string;
  question: string;
}> = [
  {
    tag: 'Stack & Architecture',
    question:
      'What is your core tech stack and how do you structure full-stack applications?',
  },
  {
    tag: 'Security & RBAC',
    question:
      'How do you handle authentication, RBAC, and validation across your backend APIs?',
  },
  {
    tag: 'Production Systems',
    question:
      'What are the main projects you have built and what problems do they solve?',
  },
  {
    tag: 'AI & Retrieval',
    question:
      'How does this portfolio RAG pipeline retrieve and ground answers from your work?',
  },
];

export function SuggestedQuestions({
  onSelect,
  disabled = false,
}: SuggestedQuestionsProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {SUGGESTED_PROMPTS.map((item) => (
        <button
          key={item.question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(item.question)}
          className="group flex flex-col justify-between rounded-xl border border-border bg-surface/70 p-3.5 text-left transition-all duration-150 hover:border-accent/50 hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <div className="mb-1.5 flex w-full items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
              {item.tag}
            </span>
            <span
              aria-hidden="true"
              className="font-mono text-xs text-textFaint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
            >
              →
            </span>
          </div>
          <p className="font-sans text-xs leading-snug text-text sm:text-[13px]">
            {item.question}
          </p>
        </button>
      ))}
    </div>
  );
}