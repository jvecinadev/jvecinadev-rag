import React from 'react';

export interface SectionLabelProps {
  index?: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionLabel({
  index,
  label,
  children,
  className = '',
}: SectionLabelProps) {
  const content =
    children !== undefined
      ? children
      : index && label
        ? `${index} / ${label}`
        : label ?? index;

  return (
    <p
      className={`font-mono text-xs uppercase tracking-wider text-textFaint ${className}`.trim()}
    >
      {content}
    </p>
  );
}