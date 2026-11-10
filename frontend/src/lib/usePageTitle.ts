import { useEffect } from 'react';

export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title
      ? `${title} — John Francis Vecina`
      : 'John Francis Vecina — Full-stack & AI Engineer';
  }, [title]);
}