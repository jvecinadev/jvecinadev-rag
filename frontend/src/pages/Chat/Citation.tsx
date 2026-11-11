import { Link } from 'react-router-dom';
import type { ChatSource } from '../../types/api';

export interface CitationProps {
  source: ChatSource;
}

const LINK_CLASSES =
  'inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xs text-textMuted transition-colors duration-150 hover:border-accent hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40';

const PLAIN_CLASSES =
  'inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xs text-textMuted';

export function Citation({ source }: CitationProps) {
  const content = (
    <>
      <span className="text-accent">[{source.id}]</span>
      <span className="truncate max-w-[28ch] sm:max-w-[42ch]">{source.title}</span>
    </>
  );

  if (source.url === null || source.url.trim() === '') {
    return <span className={PLAIN_CLASSES}>{content}</span>;
  }

  if (source.url.startsWith('http')) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className={LINK_CLASSES}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={source.url} className={LINK_CLASSES}>
      {content}
    </Link>
  );
}