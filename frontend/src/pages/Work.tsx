import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Project } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Button } from '../components/Button';
import { SectionLabel } from '../components/SectionLabel';
import { Tag } from '../components/Tag';
import { ProjectCardSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { ProjectPreviewImage } from '../components/ProjectPreviewImage';

const MAX_CARD_TAGS = 6;

const ARCHITECTURE_COMPARISONS = [
  'What is Alaala Collections and what tech stack does it use?',
  'Which of your projects use React?',
  'How do you handle authentication and RBAC across your projects?',
] as const;

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

function formatHostname(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function parseRepoSlug(githubUrl: string | null): string | null {
  if (!githubUrl) return null;
  try {
    const parsed = new URL(githubUrl);
    const parts = parsed.pathname
      .replace(/^\/+|\/+$/g, '')
      .replace(/\.git$/i, '')
      .split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

export default function Work() {
  usePageTitle('Work');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSpecs, setExpandedSpecs] = useState<Record<number, boolean>>(
    {}
  );
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Project[]>('/projects');
      setProjects(response.data);
    } catch {
      setError('Unable to load project index.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const liveCount = useMemo(
    () => projects.filter((p) => Boolean(p.liveUrl ?? p.url)).length,
    [projects]
  );

  const toggleSpec = (projectId: number) => {
    setExpandedSpecs((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleCopyClone = async (project: Project) => {
    const repoSlug = parseRepoSlug(project.githubUrl);
    if (!repoSlug) return;
    try {
      await navigator.clipboard.writeText(
        `git clone https://github.com/${repoSlug}.git`
      );
      setCopiedId(project.id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === project.id ? null : current));
      }, 1800);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <section className="mx-auto max-w-300 px-4 py-12 sm:px-6 sm:py-24 space-y-12 sm:space-y-16">
      {/* 1. Header & Index Telemetry Bar */}
      <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[72ch] space-y-3">
          <SectionLabel index="01" label="WORK // SYSTEM INDEX" />
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-5xl">
            Systems &amp; Case Studies
          </h1>
          <p className="font-sans text-base leading-relaxed text-textMuted">
            Production platforms, multi-tenant architectures, and grounded
            retrieval systems — each backed by a live GitHub{' '}
            <code className="rounded-lg border border-border bg-surface2 px-1.5 py-0.5 font-mono text-xs text-text">
              README.md
            </code>{' '}
            reader and architectural postmortem.
          </p>
        </div>

        {/* Right Telemetry Summary + Direct Chat CTA */}
        <div className="flex flex-wrap items-center gap-3">
          {!loading && !error && projects.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-2 font-mono text-xs">
              <span className="text-text">
                {String(projects.length).padStart(2, '0')} INDEXED
              </span>
              <span className="text-border">|</span>
              <span className="inline-flex items-center gap-1.5 text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {liveCount} LIVE
              </span>
            </div>
          )}

          <Button variant="ghost" to="/chat" className="text-xs font-mono">
            Query all systems in /chat →
          </Button>
        </div>
      </header>

      {/* 2. Loading / Error / Empty States */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      )}

      {!loading && error && (
        <ErrorState
          label="WORK INDEX FAILED"
          message={error}
          onRetry={() => void fetchProjects()}
        />
      )}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          label="01 / WORK"
          title="No projects indexed yet."
          description="Projects will appear here once seeded."
        />
      )}

      {/* 3. 2-Column Project Systems Grid */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project, index) => {
            const { name, subtitle } = splitProjectTitle(project.title);
            const stack =
              project.techStack?.length > 0 ? project.techStack : project.tags;
            const isSpecExpanded = Boolean(expandedSpecs[project.id]);
            const visibleTags = isSpecExpanded
              ? stack
              : stack.slice(0, MAX_CARD_TAGS);
            const overflowCount = stack.length - visibleTags.length;

            const liveUrl = project.liveUrl ?? project.url;
            const liveHost = formatHostname(liveUrl);
            const repoSlug = parseRepoSlug(project.githubUrl);
            const hasHighlights =
              project.highlights && project.highlights.length > 0;

            const borderClass = project.featured
              ? 'border-accent/40 hover:border-accent/70'
              : 'border-border hover:border-accent/40';

            return (
              <article
                key={project.id}
                className={`flex flex-col justify-between rounded-lg border ${borderClass} bg-surface overflow-hidden transition-colors duration-150`}
              >
                <div>
                  {/* Top System Chrome Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface2/60 px-5 py-2.5 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-accent font-medium">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-textFaint">//</span>
                      <span className="text-text uppercase truncate max-w-48 sm:max-w-none">
                        {project.slug}
                      </span>
                      {project.featured && (
                        <span className="rounded-lg border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                          FEATURED
                        </span>
                      )}
                    </div>

                    {liveUrl ? (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-accent transition-colors duration-150 hover:text-text"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        <span>{liveHost ?? 'LIVE'} ↗</span>
                      </a>
                    ) : (
                      <span className="text-textFaint">
                        {repoSlug ?? 'OPEN SOURCE'}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 space-y-5">
                    <Link
                      to={`/work/${project.slug}`}
                      className="block focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                    >
                      <ProjectPreviewImage
                        project={project}
                        priority={index < 2}
                      />
                    </Link>

                    <div className="space-y-2">
                      {subtitle && (
                        <p className="font-mono text-xs uppercase tracking-wider text-accent">
                          {subtitle}
                        </p>
                      )}

                      <h2 className="font-sans text-xl font-semibold tracking-tight text-text sm:text-2xl">
                        <Link
                          to={`/work/${project.slug}`}
                          className="transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                        >
                          {name}
                        </Link>
                      </h2>

                      <p
                        className={`font-sans text-sm leading-relaxed text-textMuted ${
                          isSpecExpanded ? '' : 'line-clamp-2'
                        }`}
                      >
                        {project.summary}
                      </p>
                    </div>

                    {/* Architectural Highlights Preview (Top 2 visible, expandable for devs) */}
                    {hasHighlights && (
                      <div className="rounded-lg border border-border bg-ink p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                          <span className="text-textFaint uppercase tracking-wider">
                            ARCHITECTURAL HIGHLIGHTS
                          </span>
                          {project.highlights.length > 2 && (
                            <button
                              type="button"
                              onClick={() => toggleSpec(project.id)}
                              className="cursor-pointer text-accent transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                            >
                              {isSpecExpanded
                                ? 'COLLAPSE −'
                                : `ALL (${project.highlights.length}) +`}
                            </button>
                          )}
                        </div>

                        <ul className="space-y-2">
                          {(isSpecExpanded
                            ? project.highlights
                            : project.highlights.slice(0, 2)
                          ).map((bullet, bIdx) => (
                            <li
                              key={bullet}
                              className="flex items-start gap-2.5 font-sans text-xs leading-relaxed text-textMuted"
                            >
                              <span className="font-mono text-[11px] text-accent shrink-0 pt-0.5">
                                0{bIdx + 1}
                              </span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Tech Stack + Actions */}
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {visibleTags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                    {overflowCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleSpec(project.id)}
                        title="Show all tech stack tags"
                        className="cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40"
                      >
                        <Tag>+{overflowCount}</Tag>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 font-mono text-xs">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/work/${project.slug}`}
                        className="font-medium text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                      >
                        CASE STUDY &amp; README →
                      </Link>
                      <Link
                        to={`/chat?q=${encodeURIComponent(
                          `Tell me about ${project.title}`
                        )}`}
                        className="text-textMuted transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                      >
                        ASK AI →
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 text-textFaint">
                      {repoSlug && (
                        <button
                          type="button"
                          onClick={() => void handleCopyClone(project)}
                          title={`Copy: git clone https://github.com/${repoSlug}.git`}
                          className="cursor-pointer transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                        >
                          {copiedId === project.id ? 'CLONED ✓' : 'CLONE'}
                        </button>
                      )}
                      {liveUrl && (
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                        >
                          LIVE ↗
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                        >
                          REPO ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 4. Bottom Cross-Project Architecture Interrogation Strip */}
      <div className="rounded-lg border border-border bg-surface p-5 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <SectionLabel label="CROSS-SYSTEM INTERROGATION" />
            <h2 className="font-sans text-lg font-semibold text-text sm:text-xl">
              Compare stack decisions or query across all repositories
            </h2>
          </div>

          <Button
            variant="primary"
            to="/chat"
            className="w-full sm:w-auto text-xs"
          >
            Open Full RAG Console →
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 border-t border-border pt-5">
          {ARCHITECTURE_COMPARISONS.map((prompt) => (
            <Button
              key={prompt}
              variant="ghost"
              to={`/chat?q=${encodeURIComponent(prompt)}`}
              className="justify-between text-left font-mono text-xs leading-relaxed p-4 h-auto bg-ink hover:bg-surface2"
            >
              <span className="text-textMuted">{prompt}</span>
              <span aria-hidden="true" className="text-accent shrink-0 pl-2">
                →
              </span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}