import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { api } from '../api';
import type { Project as ProjectType } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Button } from '../components/Button';
import { Tag } from '../components/Tag';
import { SectionLabel } from '../components/SectionLabel';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { ProjectPreviewImage } from '../components/ProjectPreviewImage';
import NotFound from './NotFound';

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

function formatYear(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '2025';
  }
  return String(date.getFullYear());
}

function normalizePostmortemMarkdown(rawBody: string): string {
  return rawBody
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('#')) {
        return trimmed;
      }
      const match = trimmed.match(/^([A-Z][A-Za-z0-9 &/-]{2,38}):\s+([\s\S]+)$/);
      if (match) {
        return `### ${match[1]}\n\n${match[2]}`;
      }
      return trimmed;
    })
    .join('\n\n');
}

function ProjectDetailSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24 space-y-12"
    >
      <div className="max-w-[72ch] space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 border-y border-border py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="aspect-video w-full max-w-240" />
      <div className="max-w-[72ch] space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export default function Project() {
  const { slug } = useParams<{ slug: string }>();

  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(project ? project.title : 'Project Case Study');

  const fetchProject = useCallback(async () => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await api.get<ProjectType>(
        `/projects/${encodeURIComponent(slug)}`
      );
      setProject(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError('Unable to load this project case study right now.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void fetchProject();
  }, [fetchProject]);

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (notFound) {
    return <NotFound />;
  }

  if (error || !project) {
    return (
      <section className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24">
        <ErrorState
          label="CASE STUDY UNAVAILABLE"
          message={error ?? 'Unable to load project.'}
          onRetry={() => void fetchProject()}
          actionTo="/work"
          actionLabel="Back to Work →"
        />
      </section>
    );
  }

  const { name, subtitle } = splitProjectTitle(project.title);
  const liveUrl = project.liveUrl ?? project.url;
  const liveHost = formatHostname(liveUrl);
  const stack =
    project.techStack?.length > 0 ? project.techStack : project.tags;
  const formattedBody = normalizePostmortemMarkdown(project.body);

  return (
    <article className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24 space-y-14">
      {/* 1. Header & Mono Meta Strip */}
      <header className="space-y-8">
        <div className="space-y-4 max-w-[72ch]">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-textFaint">
            <Link
              to="/work"
              className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
            >
              01 / WORK
            </Link>
            <span>/</span>
            <span className="text-textMuted uppercase">{project.slug}</span>
          </div>

          {subtitle && (
            <p className="font-mono text-xs uppercase tracking-wider text-accent">
              {subtitle}
            </p>
          )}

          <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-5xl">
            {name}
          </h1>

          <p className="font-sans text-base leading-relaxed text-textMuted sm:text-lg">
            {project.summary}
          </p>
        </div>

        {/* Mono Meta Strip: ROLE, TIMELINE, LIVE, REPO */}
        <dl className="grid grid-cols-2 gap-6 border-y border-border py-5 sm:grid-cols-4 font-mono text-xs">
          <div className="space-y-1">
            <dt className="text-textFaint">ROLE</dt>
            <dd className="text-text">Full-stack Engineer</dd>
          </div>

          <div className="space-y-1">
            <dt className="text-textFaint">TIMELINE</dt>
            <dd className="text-text">{formatYear(project.created_at)}</dd>
          </div>

          {liveUrl && (
            <div className="space-y-1">
              <dt className="text-textFaint">LIVE</dt>
              <dd>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline underline-offset-4 transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                >
                  {liveHost ?? 'Launch'} ↗
                </a>
              </dd>
            </div>
          )}

          {project.githubUrl && (
            <div className="space-y-1">
              <dt className="text-textFaint">REPO</dt>
              <dd>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text underline underline-offset-4 transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                >
                  GitHub ↗
                </a>
              </dd>
            </div>
          )}
        </dl>
      </header>

      {/* 2. Hero Media Frame (loads images[0] or displays the architectural preview frame) */}
      <figure className="max-w-240">
        <ProjectPreviewImage project={project} priority />
      </figure>

      {/* Executive Overview */}
      {project.description && (
        <section className="max-w-[72ch] rounded-lg border border-border bg-surface p-6 space-y-3">
          <SectionLabel label="SYSTEM OVERVIEW" />
          <div className="space-y-3 font-sans text-sm leading-relaxed text-textMuted sm:text-base">
            {project.description.split(/\n\n+/).map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </section>
      )}

      {/* 3. Postmortem Body (Markdown) */}
      <section className="max-w-[72ch] space-y-6">
        <SectionLabel label="ARCHITECTURE & POSTMORTEM" />
        <div className="space-y-4 font-sans text-base leading-relaxed text-text">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="pt-6 font-sans text-xl font-semibold text-text">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="pt-5 font-mono text-xs uppercase tracking-wider text-textMuted">
                  // {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="leading-relaxed text-textMuted">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 space-y-2 text-textMuted">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 space-y-2 text-textMuted">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-text">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noreferrer' : undefined}
                  className="text-accent underline underline-offset-4 hover:text-accent/80"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded-lg border border-border bg-surface2 px-1.5 py-0.5 font-mono text-xs text-text">
                  {children}
                </code>
              ),
            }}
          >
            {formattedBody}
          </ReactMarkdown>
        </div>
      </section>

      {/* 4. Highlights */}
      {project.highlights && project.highlights.length > 0 && (
        <section className="max-w-[72ch] space-y-4 border-t border-border pt-10">
          <SectionLabel label="HIGHLIGHTS" />
          <ul className="space-y-3">
            {project.highlights.map((highlight, idx) => (
              <li
                key={highlight}
                className="flex items-start gap-3.5 rounded-lg border border-border bg-surface p-4"
              >
                <span className="font-mono text-xs text-accent">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="font-sans text-sm leading-relaxed text-text">
                  {highlight}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. Tech Stack */}
      {stack && stack.length > 0 && (
        <section className="max-w-[72ch] space-y-4 border-t border-border pt-10">
          <SectionLabel label="TECH STACK" />
          <div className="flex flex-wrap gap-2">
            {stack.map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
          </div>
        </section>
      )}

      {/* 6. Ask About This Project CTA (Mandatory Entry Point #4) */}
      <section className="max-w-[72ch] border-t border-border pt-10">
        <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-wider text-textFaint">
              GROUNDED PROJECT Q&amp;A
            </p>
            <h2 className="font-sans text-lg font-semibold text-text">
              Want to go deeper on {name}?
            </h2>
            <p className="font-sans text-sm text-textMuted">
              Ask the portfolio agent about its architecture, trade-offs, or
              implementation details.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="primary"
              to={`/chat?q=Tell me about ${encodeURIComponent(project.title)}`}
            >
              Ask about this project →
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}