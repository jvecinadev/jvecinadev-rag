import { Button } from '../../components/Button';
import { SectionLabel } from '../../components/SectionLabel';
import { SUGGESTED_QUESTIONS } from './SuggestedQuestions';

export interface NoMatchCardProps {
  answer: string;
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export function NoMatchCard({
  answer,
  onSelectQuestion,
  disabled = false,
}: NoMatchCardProps) {
  const relatedQuestions = SUGGESTED_QUESTIONS.slice(0, 2);

  return (
    <div className="rounded-lg border border-border bg-surface p-5 space-y-4">
      <SectionLabel>NO MATCHES ABOVE 0.50</SectionLabel>

      <p className="font-sans text-sm leading-relaxed text-textMuted">
        {answer}
      </p>

      <div className="space-y-2 pt-1">
        <p className="font-mono text-xs text-textFaint">
          Try asking about indexed portfolio content:
        </p>
        <div className="flex flex-wrap gap-2">
          {relatedQuestions.map((question) => (
            <Button
              key={question}
              variant="ghost"
              disabled={disabled}
              onClick={() => onSelectQuestion(question)}
              className="text-left font-mono text-xs py-2 px-3"
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}