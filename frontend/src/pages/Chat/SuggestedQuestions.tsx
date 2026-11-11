import { Button } from '../../components/Button';

export const SUGGESTED_QUESTIONS: readonly string[] = [
  'What is Alaala Collections and what tech stack does it use?',
  'Which of your projects use React?',
  "What's your experience with Laravel and PostgreSQL?",
  'How was this RAG system built?',
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
        <Button
          key={question}
          variant="ghost"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="justify-start text-left font-mono text-xs leading-relaxed py-3 px-3.5 h-auto"
        >
          <span className="text-textMuted">{question}</span>
        </Button>
      ))}
    </div>
  );
}