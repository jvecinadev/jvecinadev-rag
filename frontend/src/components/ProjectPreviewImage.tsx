import { useState } from 'react';
import type { Project } from '../types/api';

export interface ProjectPreviewImageProps {
  project: Project;
  priority?: boolean;
  className?: string;
}

function formatHostname(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function splitProjectTitle(rawTitle: string): {
  name: string;
  subtitle: string | null;
} {
  const parts = rawTitle.split(/\s+-\s+/);
  if (parts.length > 1) {
    return {
      name: parts[0].trim(),
      subtitle: parts.slice(1).join(' - ').trim(),
    };
  }
  return { name: rawTitle, subtitle: null };
}

export function ProjectPreviewImage({
  project,
  priority = false,
  className = '',
}: ProjectPreviewImageProps) {
  const [failed, setFailed] = useState<boolean>(false);

  const primaryImage = project.images?.[0] ?? null;
  const showImage = Boolean(primaryImage) && !failed;
  const liveHost = formatHostname(project.liveUrl ?? project.url);
  const { name, subtitle } = splitProjectTitle(project.title);
  const stack =
    project.techStack?.length > 0 ? project.techStack : project.tags;

  return (
    <div
      className={`overflow-hidden rounded-lg border border-border bg-ink ${className}`.trim()}
    >
      {/* Top Window Chrome Bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2 font-mono text-xs text-textFaint">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-accent/60" />
        </div>
        <span className="truncate max-w-[26ch]">
          {liveHost ?? `/work/${project.slug}`}
        </span>
        <span className="text-textFaint">
          {project.featured ? 'PROD' : 'SYS'}
        </span>
      </div>

      {/* 16:9 Media Viewport */}
      <div className="relative aspect-video w-full bg-surface2">
        {showImage && primaryImage ? (
          <img
            src={primaryImage}
            alt={`${project.title} preview`}
            width={1200}
            height={675}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          /* Intentional Architectural Blueprint Frame when screenshot URL is pending/offline */
          <div className="flex h-full w-full flex-col justify-between p-5 bg-[radial-gradient(circle,#27272A_1px,transparent_1px)] bg-size-[16px_16px]">
            <div className="flex items-center justify-between gap-2 font-mono text-xs text-textFaint">
              <span>SPEC // {project.slug.toUpperCase()}</span>
              <span className="rounded-lg border border-border bg-surface px-2 py-0.5 text-textMuted">
                PREVIEW SLOT
              </span>
            </div>

            <div className="space-y-1.5 my-auto py-2">
              {subtitle && (
                <p className="font-mono text-xs uppercase tracking-wider text-accent">
                  {subtitle}
                </p>
              )}
              <p className="font-sans text-lg font-semibold text-text sm:text-xl">
                {name}
              </p>
              <p className="font-mono text-xs text-textMuted line-clamp-1">
                {stack.slice(0, 5).join(' · ')}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border/70 pt-2.5 font-mono text-xs text-textFaint">
              <span>
                {liveHost ? `HOST: ${liveHost}` : 'INTERNAL ARCHITECTURE'}
              </span>
              <span>1200 × 675</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}