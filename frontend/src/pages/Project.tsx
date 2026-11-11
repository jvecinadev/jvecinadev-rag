import {
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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

interface GithubRepoInfo {
  owner: string;
  repo: string;
}

interface ReadmeHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

type DocSegment =
  | { type: 'markdown'; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

function parseGithubRepo(githubUrl: string | null): GithubRepoInfo | null {
  if (!githubUrl) return null;
  try {
    const parsed = new URL(githubUrl);
    if (!parsed.hostname.endsWith('github.com')) return null;
    const segments = parsed.pathname
      .replace(/^\/+|\/+$/g, '')
      .replace(/\.git$/i, '')
      .split('/');
    if (segments.length < 2) return null;
    return { owner: segments[0], repo: segments[1] };
  } catch {
    return null;
  }
}

function slugifyHeading(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractNodeText).join('');
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractNodeText(node.props.children);
  }
  return '';
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
        return `## ${match[1]}\n\n${match[2]}`;
      }
      return trimmed;
    })
    .join('\n\n');
}

function resolveGithubRelativeUrl(
  rawUrl: string,
  repoInfo: GithubRepoInfo | null,
  kind: 'raw' | 'blob'
): string {
  const trimmed = rawUrl.trim();
  if (
    !repoInfo ||
    !trimmed ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.replace(/^\.?\//, '');
  if (kind === 'raw') {
    return `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/HEAD/${cleanPath}`;
  }
  return `https://github.com/${repoInfo.owner}/${repoInfo.repo}/blob/HEAD/${cleanPath}`;
}

function preprocessGithubReadme(
  rawMarkdown: string,
  repoInfo: GithubRepoInfo | null
): string {
  let text = rawMarkdown.replace(/\r\n/g, '\n');

  text = text.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (full, src) => {
    const altMatch = full.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : 'Project illustration';
    return `![${alt}](${resolveGithubRelativeUrl(src, repoInfo, 'raw')})`;
  });

  text = text
    .replace(/<\/?(div|p|center|details|summary|sub|sup)(\s+[^>]*)?>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<!--[\s\S]*?-->/g, '');

  text = text
    .replace(/^(\s*[-*+]\s+)\[x\]\s+/gim, '$1✓ ')
    .replace(/^(\s*[-*+]\s+)\[\s\]\s+/gim, '$1○ ');

  text = text.replace(/^\s*#\s+[^\n]+\n+/, '');

  return text.trim();
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\||\|$/g, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function isTableSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|') || !trimmed.includes('-')) return false;
  const cells = parseTableRow(trimmed);
  return (
    cells.length > 0 &&
    cells.every((cell) => /^:?-{2,}:?$/.test(cell))
  );
}

function splitMarkdownAndTables(markdown: string): DocSegment[] {
  const lines = markdown.split('\n');
  const segments: DocSegment[] = [];
  let mdBuffer: string[] = [];
  let inCodeFence = false;
  let i = 0;

  const flushMarkdown = () => {
    if (mdBuffer.length > 0) {
      const joined = mdBuffer.join('\n').trim();
      if (joined) {
        segments.push({ type: 'markdown', content: joined });
      }
      mdBuffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*```/.test(line)) {
      inCodeFence = !inCodeFence;
      mdBuffer.push(line);
      i += 1;
      continue;
    }

    if (
      !inCodeFence &&
      line.trim().includes('|') &&
      i + 1 < lines.length &&
      isTableSeparatorLine(lines[i + 1])
    ) {
      flushMarkdown();
      const headers = parseTableRow(line);
      const rows: string[][] = [];
      i += 2;

      while (
        i < lines.length &&
        lines[i].trim().includes('|') &&
        lines[i].trim() !== '' &&
        !/^\s*```/.test(lines[i])
      ) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }

      segments.push({ type: 'table', headers, rows });
      continue;
    }

    mdBuffer.push(line);
    i += 1;
  }

  flushMarkdown();
  return segments;
}

function extractHeadings(markdown: string): ReadmeHeading[] {
  const lines = markdown.split('\n');
  const headings: ReadmeHeading[] = [];
  let inCodeFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length as 2 | 3;
      const cleanText = match[2]
        .replace(/[`*_~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
      const id = slugifyHeading(cleanText);
      if (cleanText && id) {
        headings.push({ id, text: cleanText, level });
      }
    }
  }

  return headings;
}

async function fetchGithubReadmeMarkdown(
  repoInfo: GithubRepoInfo,
  signal: AbortSignal
): Promise<string> {
  const rawHeadUrl = `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/HEAD/README.md`;
  try {
    const rawRes = await fetch(rawHeadUrl, { signal });
    if (rawRes.ok) {
      const text = await rawRes.text();
      if (text.trim().length > 0) {
        return text;
      }
    }
  } catch {
    // Fall through to GitHub REST API fallback
  }

  const apiRes = await fetch(
    `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/readme`,
    {
      headers: { Accept: 'application/vnd.github.raw+json' },
      signal,
    }
  );

  if (!apiRes.ok) {
    throw new Error(`GitHub README fetch returned ${apiRes.status}`);
  }

  return apiRes.text();
}

function CodeBlockFrame({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const rawCode = useMemo(
    () => extractNodeText(children).replace(/\n$/, ''),
    [children]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-ink">
      <div className="flex items-center justify-between border-b border-border bg-surface2/70 px-3.5 py-2 font-mono text-[11px] text-textFaint">
        <span>CODE SNIPPET</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="cursor-pointer rounded-lg border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-textMuted transition-colors duration-150 hover:border-accent/50 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {copied ? 'COPIED ✓' : 'COPY'}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto p-3.5 sm:p-4 font-mono text-xs leading-relaxed text-text">
        {children}
      </pre>
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto max-w-300 px-4 py-12 sm:px-6 sm:py-24 space-y-10"
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

  const [readmeMarkdown, setReadmeMarkdown] = useState<string | null>(null);
  const [readmeLoading, setReadmeLoading] = useState<boolean>(false);
  const [readmeFailed, setReadmeFailed] = useState<boolean>(false);
  const [activeDocTab, setActiveDocTab] = useState<'readme' | 'brief'>('readme');
  const [cloneCopied, setCloneCopied] = useState<boolean>(false);
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);

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

  const repoInfo = useMemo(
    () => parseGithubRepo(project?.githubUrl ?? null),
    [project?.githubUrl]
  );

  useEffect(() => {
    if (!repoInfo) {
      setReadmeMarkdown(null);
      setReadmeLoading(false);
      setReadmeFailed(false);
      setActiveDocTab('brief');
      return;
    }

    const controller = new AbortController();
    setReadmeLoading(true);
    setReadmeFailed(false);
    setActiveDocTab('readme');

    fetchGithubReadmeMarkdown(repoInfo, controller.signal)
      .then((raw) => {
        if (!controller.signal.aborted) {
          const cleaned = preprocessGithubReadme(raw, repoInfo);
          setReadmeMarkdown(cleaned);
          setReadmeLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setReadmeMarkdown(null);
          setReadmeFailed(true);
          setReadmeLoading(false);
          setActiveDocTab('brief');
        }
      });

    return () => {
      controller.abort();
    };
  }, [repoInfo]);

  const fallbackBody = useMemo(
    () => (project ? normalizePostmortemMarkdown(project.body) : ''),
    [project]
  );

  const displayedMarkdown = useMemo(() => {
    if (activeDocTab === 'readme' && readmeMarkdown) {
      return readmeMarkdown;
    }
    return fallbackBody;
  }, [activeDocTab, readmeMarkdown, fallbackBody]);

  const docSegments = useMemo(
    () => splitMarkdownAndTables(displayedMarkdown),
    [displayedMarkdown]
  );

  const headings = useMemo(
    () => extractHeadings(displayedMarkdown),
    [displayedMarkdown]
  );

  const handleCopyClone = async () => {
    if (!repoInfo) return;
    try {
      await navigator.clipboard.writeText(
        `git clone https://github.com/${repoInfo.owner}/${repoInfo.repo}.git`
      );
      setCloneCopied(true);
      window.setTimeout(() => setCloneCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (notFound) {
    return <NotFound />;
  }

  if (error || !project) {
    return (
      <section className="mx-auto max-w-300 px-4 py-12 sm:px-6 sm:py-24">
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
  const readmeLineCount = readmeMarkdown
    ? readmeMarkdown.split('\n').length
    : 0;

  return (
    <article className="mx-auto max-w-300 px-4 py-10 sm:px-6 sm:py-20 space-y-12 sm:space-y-16 overflow-x-hidden">
      <header className="space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4 max-w-[72ch]">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-textFaint">
            <Link
              to="/work"
              className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
            >
              01 / WORK
            </Link>
            <span>/</span>
            <span className="text-textMuted uppercase break-all">
              {project.slug}
            </span>
          </div>

          {subtitle && (
            <p className="font-mono text-xs uppercase tracking-wider text-accent">
              {subtitle}
            </p>
          )}

          <h1 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-5xl">
            {name}
          </h1>

          <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-lg">
            {project.summary}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4 border-y border-border py-4 sm:grid-cols-4 sm:gap-6 sm:py-5 font-mono text-xs">
          <div className="space-y-1 min-w-0">
            <dt className="text-textFaint">ROLE</dt>
            <dd className="text-text truncate">Full-stack Engineer</dd>
          </div>

          <div className="space-y-1 min-w-0">
            <dt className="text-textFaint">TIMELINE</dt>
            <dd className="text-text">{formatYear(project.created_at)}</dd>
          </div>

          {liveUrl && (
            <div className="space-y-1 min-w-0">
              <dt className="text-textFaint">LIVE</dt>
              <dd className="truncate">
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
            <div className="space-y-1 min-w-0">
              <dt className="text-textFaint">REPOSITORY</dt>
              <dd className="truncate">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text underline underline-offset-4 transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                >
                  {repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : 'GitHub'} ↗
                </a>
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            variant="primary"
            to={`/chat?q=Tell me about ${encodeURIComponent(project.title)}`}
            className="w-full sm:w-auto"
          >
            Ask about this project →
          </Button>

          {liveUrl && (
            <Button
              variant="ghost"
              href={liveUrl}
              className="w-full sm:w-auto"
            >
              Open Live Deployment ↗
            </Button>
          )}

          {project.githubUrl && (
            <Button
              variant="ghost"
              href={project.githubUrl}
              className="w-full sm:w-auto"
            >
              Inspect Source on GitHub ↗
            </Button>
          )}
        </div>
      </header>

      <figure className="max-w-240">
        <ProjectPreviewImage project={project} priority />
      </figure>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        <div className="min-w-0 lg:col-span-8 space-y-8">
          <div className="rounded-lg border border-border bg-surface p-3 sm:p-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${
                    readmeMarkdown
                      ? 'bg-accent'
                      : readmeLoading
                        ? 'bg-accent animate-pulse'
                        : 'bg-textFaint'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-text uppercase">
                  {activeDocTab === 'readme' && readmeMarkdown
                    ? `${repoInfo?.repo ?? project.slug} / README.md`
                    : 'CASE STUDY SPECIFICATION'}
                </span>
                {activeDocTab === 'readme' && readmeLineCount > 0 && (
                  <span className="text-textFaint">
                    · {readmeLineCount} lines
                  </span>
                )}
              </div>

              {repoInfo && (
                <div
                  role="tablist"
                  aria-label="Documentation source"
                  className="grid grid-cols-2 sm:flex items-center gap-1.5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeDocTab === 'readme'}
                    disabled={readmeLoading || readmeFailed}
                    onClick={() => setActiveDocTab('readme')}
                    className={`cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                      activeDocTab === 'readme'
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-border bg-ink text-textMuted hover:text-text'
                    }`}
                  >
                    {readmeLoading ? 'SYNCING README...' : 'GITHUB README.MD'}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeDocTab === 'brief'}
                    onClick={() => setActiveDocTab('brief')}
                    className={`cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                      activeDocTab === 'brief'
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-border bg-ink text-textMuted hover:text-text'
                    }`}
                  >
                    CASE STUDY BRIEF
                  </button>
                </div>
              )}
            </div>

            {repoInfo && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-ink px-3 py-2 font-mono text-xs">
                <code className="truncate text-textMuted">
                  git clone https://github.com/{repoInfo.owner}/{repoInfo.repo}.git
                </code>
                <button
                  type="button"
                  onClick={() => void handleCopyClone()}
                  className="shrink-0 cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-text transition-colors duration-150 hover:border-accent/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {cloneCopied ? 'COPIED ✓' : 'COPY CLONE'}
                </button>
              </div>
            )}
          </div>

          {headings.length > 1 && (
            <div className="lg:hidden rounded-lg border border-border bg-surface">
              <button
                type="button"
                onClick={() => setMobileTocOpen((prev) => !prev)}
                aria-expanded={mobileTocOpen}
                className="flex w-full items-center justify-between px-4 py-3 font-mono text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
              >
                <span>ON THIS PAGE ({headings.length} SECTIONS)</span>
                <span className="text-accent">
                  {mobileTocOpen ? 'HIDE −' : 'JUMP +'}
                </span>
              </button>
              {mobileTocOpen && (
                <nav
                  aria-label="Mobile table of contents"
                  className="border-t border-border px-4 py-3 space-y-2"
                >
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={() => setMobileTocOpen(false)}
                      className={`block font-mono text-xs transition-colors duration-150 hover:text-accent ${
                        h.level === 3
                          ? 'pl-4 text-textFaint'
                          : 'text-textMuted'
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              )}
            </div>
          )}

          {activeDocTab === 'brief' && project.description && (
            <section className="max-w-[72ch] rounded-lg border border-border bg-surface p-5 sm:p-6 space-y-3">
              <SectionLabel label="SYSTEM OVERVIEW" />
              <div className="space-y-3 font-sans text-sm leading-relaxed text-textMuted sm:text-base">
                {project.description.split(/\n\n+/).map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {readmeLoading && activeDocTab === 'readme' ? (
            <div
              aria-label="Loading GitHub README"
              className="max-w-[72ch] rounded-lg border border-border bg-surface p-5 sm:p-8 space-y-4"
            >
              <div className="flex items-center gap-2 font-mono text-xs text-accent">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span>
                  FETCHING LIVE README.MD FROM GITHUB ({repoInfo?.owner}/
                  {repoInfo?.repo})...
                </span>
              </div>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : (
            <section className="max-w-[72ch] space-y-5 min-w-0">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <SectionLabel
                  label={
                    activeDocTab === 'readme' && readmeMarkdown
                      ? 'LIVE REPOSITORY README.MD'
                      : 'ARCHITECTURE & POSTMORTEM'
                  }
                />
                {project.githubUrl && activeDocTab === 'readme' && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-textFaint transition-colors duration-150 hover:text-accent"
                  >
                    View raw on GitHub ↗
                  </a>
                )}
              </div>

              <div className="space-y-5 font-sans text-sm sm:text-base leading-relaxed text-text wrap-break-word">
                {docSegments.map((segment, segIdx) => {
                  if (segment.type === 'table') {
                    return (
                      <div
                        key={`table-${segIdx}`}
                        className="my-5 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto"
                      >
                        <div className="inline-block min-w-full align-middle rounded-lg border border-border overflow-hidden">
                          <table className="min-w-full divide-y divide-border text-left font-sans text-xs sm:text-sm">
                            <thead className="bg-surface2 font-mono text-[11px] uppercase tracking-wider text-textMuted">
                              <tr>
                                {segment.headers.map((header, hIdx) => (
                                  <th
                                    key={`th-${hIdx}`}
                                    scope="col"
                                    className="px-3.5 py-2.5 font-medium"
                                  >
                                    {header.replace(/[`*_]/g, '')}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-surface text-textMuted">
                              {segment.rows.map((row, rIdx) => (
                                <tr key={`tr-${rIdx}`}>
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={`td-${rIdx}-${cIdx}`}
                                      className="px-3.5 py-2.5 align-top leading-relaxed"
                                    >
                                      <ReactMarkdown
                                        components={{
                                          p: ({ children }) => (
                                            <span>{children}</span>
                                          ),
                                          strong: ({ children }) => (
                                            <strong className="font-semibold text-text">
                                              {children}
                                            </strong>
                                          ),
                                          code: ({ children }) => (
                                            <code className="rounded-lg border border-border bg-ink px-1.5 py-0.5 font-mono text-[11px] text-accent wrap-break-word">
                                              {children}
                                            </code>
                                          ),
                                          a: ({ href, children }) => {
                                            const resolved =
                                              resolveGithubRelativeUrl(
                                                href ?? '',
                                                repoInfo,
                                                'blob'
                                              );
                                            return (
                                              <a
                                                href={resolved}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-accent underline underline-offset-4 hover:text-text"
                                              >
                                                {children}
                                              </a>
                                            );
                                          },
                                        }}
                                      >
                                        {cell}
                                      </ReactMarkdown>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <ReactMarkdown
                      key={`md-${segIdx}`}
                      components={{
                        h1: ({ children }) => {
                          const text = extractNodeText(children);
                          const id = slugifyHeading(text);
                          return (
                            <h2
                              id={id}
                              className="scroll-mt-24 pt-6 border-t border-border font-sans text-xl sm:text-2xl font-semibold tracking-tight text-text"
                            >
                              {children}
                            </h2>
                          );
                        },
                        h2: ({ children }) => {
                          const text = extractNodeText(children);
                          const id = slugifyHeading(text);
                          return (
                            <h2
                              id={id}
                              className="scroll-mt-24 pt-6 border-t border-border font-sans text-lg sm:text-xl font-semibold tracking-tight text-text"
                            >
                              {children}
                            </h2>
                          );
                        },
                        h3: ({ children }) => {
                          const text = extractNodeText(children);
                          const id = slugifyHeading(text);
                          return (
                            <h3
                              id={id}
                              className="scroll-mt-24 pt-4 font-mono text-xs uppercase tracking-wider text-accent"
                            >
                              // {children}
                            </h3>
                          );
                        },
                        h4: ({ children }) => (
                          <h4 className="pt-3 font-sans text-sm font-semibold text-text">
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="leading-relaxed text-textMuted wrap-break-word">
                            {children}
                          </p>
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
                          <li className="leading-relaxed wrap-break-word">
                            {children}
                          </li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="my-4 rounded-lg border-l-2 border-accent bg-surface px-4 py-3 font-sans text-sm text-textMuted">
                            {children}
                          </blockquote>
                        ),
                        hr: () => <hr className="my-8 border-border" />,
                        strong: ({ children }) => (
                          <strong className="font-semibold text-text">
                            {children}
                          </strong>
                        ),
                        a: ({ href, children }) => {
                          const resolved = resolveGithubRelativeUrl(
                            href ?? '',
                            repoInfo,
                            'blob'
                          );
                          const isExternal = resolved.startsWith('http');
                          return (
                            <a
                              href={resolved}
                              target={isExternal ? '_blank' : undefined}
                              rel={isExternal ? 'noreferrer' : undefined}
                              className="text-accent underline underline-offset-4 transition-colors duration-150 hover:text-text break-all sm:wrap-break-word"
                            >
                              {children}
                            </a>
                          );
                        },
                        img: ({ src, alt }) => {
                          if (!src) return null;
                          const resolvedSrc = resolveGithubRelativeUrl(
                            src,
                            repoInfo,
                            'raw'
                          );
                          const isBadge =
                            resolvedSrc.includes('shields.io') ||
                            resolvedSrc.includes('badge');
                          if (isBadge) {
                            return (
                              <img
                                src={resolvedSrc}
                                alt={alt ?? ''}
                                loading="lazy"
                                className="inline-block h-5 mr-1.5 my-1 align-middle"
                              />
                            );
                          }
                          return (
                            <span className="my-4 block overflow-hidden rounded-lg border border-border bg-surface">
                              <img
                                src={resolvedSrc}
                                alt={alt ?? project.title}
                                loading="lazy"
                                className="max-h-130 w-full object-contain bg-ink"
                              />
                            </span>
                          );
                        },
                        pre: ({ children }) => (
                          <CodeBlockFrame>{children}</CodeBlockFrame>
                        ),
                        code: ({ className, children }) => {
                          const rawText = extractNodeText(children);
                          const isBlock =
                            Boolean(className) || rawText.includes('\n');
                          if (isBlock) {
                            return (
                              <code className="font-mono text-xs text-text">
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code className="rounded-lg border border-border bg-surface2 px-1.5 py-0.5 font-mono text-xs text-text wrap-break-word">
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {segment.content}
                    </ReactMarkdown>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          {headings.length > 1 && (
            <nav
              aria-label="Table of contents"
              className="hidden lg:block rounded-lg border border-border bg-surface p-5 space-y-3"
            >
              <SectionLabel label="ON THIS PAGE" />
              <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className={`block font-mono text-xs transition-colors duration-150 hover:text-accent truncate ${
                        h.level === 3
                          ? 'pl-3 text-textFaint'
                          : 'text-textMuted'
                      }`}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {project.highlights && project.highlights.length > 0 && (
            <section className="rounded-lg border border-border bg-surface p-5 space-y-4">
              <SectionLabel label="ENGINEERING HIGHLIGHTS" />
              <ul className="space-y-3">
                {project.highlights.map((highlight, idx) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-3 font-sans text-xs sm:text-sm leading-relaxed text-textMuted"
                  >
                    <span className="font-mono text-xs text-accent shrink-0 pt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-text">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {stack && stack.length > 0 && (
            <section className="rounded-lg border border-border bg-surface p-5 space-y-4">
              <SectionLabel label="TECH STACK" />
              <div className="flex flex-wrap gap-1.5">
                {stack.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      <section className="max-w-[72ch] border-t border-border pt-10">
        <div className="rounded-lg border border-border bg-surface p-5 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
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
              className="w-full sm:w-auto"
            >
              Ask about this project →
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}