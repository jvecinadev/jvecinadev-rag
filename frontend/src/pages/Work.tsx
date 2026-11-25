import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Project } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { SectionLabel } from '../components/SectionLabel';
import { Tag } from '../components/Tag';
import { Button } from '../components/Button';
import { ProjectCardSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { ProjectPreviewImage } from '../components/ProjectPreviewImage';

const MAX_CARD_TAGS = 7;

type FilterCategory = 'ALL' | 'SAAS' | 'BACKEND' | 'AI';

const FILTER_TABS: readonly { id: FilterCategory; label: string }[] = [
  { id: 'ALL', label: 'All Systems' },
  { id: 'SAAS', label: 'Full-Stack & SaaS' },
  { id: 'BACKEND', label: 'Backend & RBAC' },
  { id: 'AI', label: 'AI & Security' },
] as const;

interface ProjectMetadataOverride {
  whatItIs: string;
  proof: string;
  categoryLabel: string;
  categories: readonly FilterCategory[];
  preferredOrder: number;
}

const PROJECT_METADATA_MAP: Record<string, ProjectMetadataOverride> = {
  plinth: {
    whatItIs:
      'Multi-tenant B2B SaaS for agencies and teams managing clients, projects, and tasks across isolated workspaces.',
    proof:
      'Tenant isolation enforced at DB query level; 4-tier RBAC on every mutating endpoint; integration tests with Jest + Supertest.',
    categoryLabel: 'Multi-Tenant B2B SaaS',
    categories: ['SAAS', 'BACKEND'],
    preferredOrder: 1,
  },
  'bantay-ph': {
    whatItIs:
      'Civic issue-reporting platform for barangay-level governance — built for local government units.',
    proof:
      'Per-request DB permission resolution (no stale JWT roles); race-condition-safe transactional state machine; history and audit trails.',
    categoryLabel: 'Civic Governance Platform',
    categories: ['SAAS', 'BACKEND'],
    preferredOrder: 2,
  },
  vouch: {
    whatItIs:
      'Privacy-first AI security reviewer for git diffs — built for solo devs and small teams who need local security triage.',
    proof:
      'Detects removed safeguards, triages with local AI (Ollama), and verifies patches (apply → parse → confirm). Exports SARIF.',
    categoryLabel: 'AI Security Tooling',
    categories: ['AI', 'BACKEND'],
    preferredOrder: 3,
  },
  'jvecina-dev': {
    whatItIs:
      'Full-stack portfolio with admin panel and grounded RAG agent — a live demo of what I build.',
    proof:
      'Syncs project metadata and pulls live GitHub README at render time to prevent drift; pgvector + Gemini embeddings for grounded RAG.',
    categoryLabel: 'Grounded RAG System',
    categories: ['AI', 'SAAS'],
    preferredOrder: 4,
  },
  'alaala-collections': {
    whatItIs:
      'Collection and event management app for cataloging items, reservations, galleries, and detail views.',
    proof:
      'End-to-end search, filtering, media management, and JWT-protected administrative operations.',
    categoryLabel: 'Full-Stack Web App',
    categories: ['SAAS'],
    preferredOrder: 5,
  },
};

function splitProjectTitle(rawTitle: string): {
  name: string;
  subtitle: string | null;
} {
  const parts = rawTitle.split(/\s+[-—]\s+/);
  if (parts.length > 1) {
    return {
      name: parts[0].trim(),
      subtitle: parts.slice(1).join(' — ').trim(),
    };
  }
  return { name: rawTitle, subtitle: null };
}

function getMetadataForProject(project: Project): ProjectMetadataOverride | null {
  const slugKey = project.slug.toLowerCase();
  if (PROJECT_METADATA_MAP[slugKey]) {
    return PROJECT_METADATA_MAP[slugKey];
  }
  const titleLower = project.title.toLowerCase();
  if (titleLower.includes('plinth')) return PROJECT_METADATA_MAP.plinth;
  if (titleLower.includes('bantay')) return PROJECT_METADATA_MAP['bantay-ph'];
  if (titleLower.includes('vouch')) return PROJECT_METADATA_MAP.vouch;
  if (titleLower.includes('jvecina')) return PROJECT_METADATA_MAP['jvecina-dev'];
  if (titleLower.includes('alaala')) return PROJECT_METADATA_MAP['alaala-collections'];
  return null;
}

function matchesCategory(project: Project, filter: FilterCategory): boolean {
  if (filter === 'ALL') return true;
  const meta = getMetadataForProject(project);
  if (meta) {
    return meta.categories.includes(filter);
  }
  const stackText = [...(project.techStack ?? []), ...(project.tags ?? [])]
    .join(' ')
    .toLowerCase();
  if (filter === 'AI') {
    return (
      stackText.includes('gemini') ||
      stackText.includes('ollama') ||
      stackText.includes('pgvector') ||
      stackText.includes('python')
    );
  }
  if (filter === 'BACKEND') {
    return (
      stackText.includes('express') ||
      stackText.includes('prisma') ||
      stackText.includes('postgres') ||
      stackText.includes('mysql') ||
      stackText.includes('redis')
    );
  }
  return true;
}

export default function Work() {
  usePageTitle('Work');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');

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

  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const orderA = getMetadataForProject(a)?.preferredOrder ?? 50;
      const orderB = getMetadataForProject(b)?.preferredOrder ?? 50;
      if (orderA !== orderB) return orderA - orderB;
      return a.id - b.id;
    });
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return orderedProjects.filter((p) => matchesCategory(p, activeFilter));
  }, [orderedProjects, activeFilter]);

  // If we have an odd number of projects (e.g., 5) in "ALL", feature the first full-width
  // so the remaining projects form a balanced 2x2 grid.
  const useLeadLayout =
    activeFilter === 'ALL' &&
    filteredProjects.length >= 3 &&
    filteredProjects.length % 2 === 1;

  const leadProject = useLeadLayout ? filteredProjects[0] : null;
  const gridProjects = useLeadLayout
    ? filteredProjects.slice(1)
    : filteredProjects;

  return (
    <div className="mx-auto max-w-300 px-4 py-12 sm:px-6 sm:py-20 space-y-12">
      {/* Header + Filter Controls */}
      <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[68ch] space-y-3">
          <SectionLabel index="01" label="WORK & CASE STUDIES" />
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Production systems built for real-world constraints.
          </h1>
          <p className="font-sans text-base leading-relaxed text-textMuted">
            Multi-tenant B2B SaaS, civic governance platforms, local AI security
            tooling, and grounded RAG pipelines. Open any project to inspect its
            architecture and live GitHub README.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter projects by domain"
          className="flex flex-wrap items-center gap-1.5"
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                  isSelected
                    ? 'border-accent bg-accent/10 text-text font-medium'
                    : 'border-border bg-surface text-textMuted hover:border-textFaint hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <ErrorState
          label="WORK INDEX FAILED"
          message={error}
          onRetry={() => void fetchProjects()}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && (
        <EmptyState
          label="01 / WORK"
          title="No projects match this filter."
          description="Select another category to view all systems."
        />
      )}

      {/* Projects Layout */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div className="space-y-8">
          {/* Lead Full-Width Card (when count is odd, e.g., 5 projects -> 1 + 4 symmetrical grid) */}
          {leadProject && (() => {
            const { name, subtitle } = splitProjectTitle(leadProject.title);
            const meta = getMetadataForProject(leadProject);
            const stack =
              leadProject.techStack?.length > 0
                ? leadProject.techStack
                : leadProject.tags;
            const liveUrl = leadProject.liveUrl ?? leadProject.url;

            return (
              <article className="rounded-lg border border-border bg-surface p-5 sm:p-8 transition-colors duration-150 hover:border-textFaint">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-6">
                    <Link
                      to={`/work/${leadProject.slug}`}
                      className="block focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                    >
                      <ProjectPreviewImage project={leadProject} priority />
                    </Link>
                  </div>

                  <div className="lg:col-span-6 space-y-5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                        <span className="text-accent">
                          01 · {meta?.categoryLabel ?? subtitle ?? 'FLAGSHIP SYSTEM'}
                        </span>
                        {liveUrl && (
                          <span className="inline-flex items-center gap-1.5 text-textMuted">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            Live Deployment
                          </span>
                        )}
                      </div>

                      <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                        <Link
                          to={`/work/${leadProject.slug}`}
                          className="transition-colors duration-150 hover:text-accent"
                        >
                          {name}
                        </Link>
                      </h2>
                    </div>

                    <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
                      {meta?.whatItIs ?? leadProject.summary}
                    </p>

                    {meta && (
                      <div className="rounded-lg border border-border bg-ink p-4 space-y-1.5">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                          Engineering Proof
                        </p>
                        <p className="font-sans text-xs sm:text-sm leading-relaxed text-text">
                          {meta.proof}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {stack.slice(0, 8).map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 font-mono text-xs">
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/work/${leadProject.slug}`}
                          className="font-medium text-text transition-colors duration-150 hover:text-accent py-1"
                        >
                          Case Study &amp; README →
                        </Link>
                        <Link
                          to={`/chat?q=${encodeURIComponent(
                            `Tell me about ${name}`
                          )}`}
                          className="text-textMuted transition-colors duration-150 hover:text-text py-1"
                        >
                          Ask AI →
                        </Link>
                      </div>

                      <div className="flex items-center gap-4">
                        {liveUrl && (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent transition-colors duration-150 hover:text-text py-1"
                          >
                            Live ↗
                          </a>
                        )}
                        {leadProject.githubUrl && (
                          <a
                            href={leadProject.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-textMuted transition-colors duration-150 hover:text-text py-1"
                          >
                            Code ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })()}

          {/* Symmetrical 2-Column Project Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {gridProjects.map((project, idx) => {
              const displayIndex = useLeadLayout ? idx + 2 : idx + 1;
              const { name, subtitle } = splitProjectTitle(project.title);
              const meta = getMetadataForProject(project);
              const stack =
                project.techStack?.length > 0
                  ? project.techStack
                  : project.tags;
              const visibleTags = stack.slice(0, MAX_CARD_TAGS);
              const overflowCount = stack.length - visibleTags.length;
              const liveUrl = project.liveUrl ?? project.url;

              return (
                <article
                  key={project.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5 sm:p-6 transition-colors duration-150 hover:border-textFaint"
                >
                  <div className="space-y-5">
                    <Link
                      to={`/work/${project.slug}`}
                      className="block focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                    >
                      <ProjectPreviewImage project={project} />
                    </Link>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 font-mono text-xs">
                        <span className="text-accent">
                          {String(displayIndex).padStart(2, '0')} ·{' '}
                          {meta?.categoryLabel ?? subtitle ?? 'System'}
                        </span>
                        {liveUrl && (
                          <span className="inline-flex items-center gap-1.5 text-textFaint">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            Live
                          </span>
                        )}
                      </div>

                      <h2 className="font-sans text-xl font-semibold text-text">
                        <Link
                          to={`/work/${project.slug}`}
                          className="transition-colors duration-150 hover:text-accent"
                        >
                          {name}
                        </Link>
                      </h2>

                      <p className="font-sans text-sm leading-relaxed text-textMuted">
                        {meta?.whatItIs ?? project.summary}
                      </p>
                    </div>

                    {meta && (
                      <div className="rounded-md border border-border bg-ink/80 p-3.5 space-y-1">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                          Proof
                        </p>
                        <p className="font-sans text-xs leading-relaxed text-textMuted">
                          {meta.proof}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {visibleTags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                      {overflowCount > 0 && <Tag>+{overflowCount}</Tag>}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 font-mono text-xs">
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/work/${project.slug}`}
                          className="font-medium text-text transition-colors duration-150 hover:text-accent py-1"
                        >
                          Case Study →
                        </Link>
                        <Link
                          to={`/chat?q=${encodeURIComponent(
                            `Tell me about ${name}`
                          )}`}
                          className="text-textMuted transition-colors duration-150 hover:text-text py-1"
                        >
                          Ask AI
                        </Link>
                      </div>

                      <div className="flex items-center gap-4">
                        {liveUrl && (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent transition-colors duration-150 hover:text-text py-1"
                          >
                            Live ↗
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-textMuted transition-colors duration-150 hover:text-text py-1"
                          >
                            Code ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Conversion Strip */}
      <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-1.5 max-w-[58ch]">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            Deep Dive or Custom Build
          </p>
          <h2 className="font-sans text-xl font-semibold text-text">
            Want to ask how a specific feature or schema was implemented?
          </h2>
          <p className="font-sans text-sm text-textMuted">
            Query the portfolio RAG assistant across all repositories, or reach
            out directly to discuss a project.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button variant="primary" to="/chat" className="w-full sm:w-auto">
            Ask Portfolio AI →
          </Button>
          <Button
            variant="ghost"
            href="mailto:johnvecina640@gmail.com?subject=Project%20Inquiry%20%E2%80%94%20jvecina.dev"
            className="w-full sm:w-auto"
          >
            Start a Project
          </Button>
        </div>
      </div>
    </div>
  );
}