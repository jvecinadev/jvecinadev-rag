import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { HealthResponse, Project } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Button } from '../components/Button';
import { Tag } from '../components/Tag';
import { SectionLabel } from '../components/SectionLabel';
import { Skeleton, ProjectCardSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { ProjectPreviewImage } from '../components/ProjectPreviewImage';
import { SUGGESTED_QUESTIONS } from './Chat/SuggestedQuestions';

const HOME_TEASER_QUESTIONS: readonly string[] = SUGGESTED_QUESTIONS.slice(0, 3);
const MAX_CARD_TAGS = 5;

interface SampleTrace {
  id: string;
  label: string;
  question: string;
  answer: string;
  citationLabel: string;
  citationTo: string;
  similarity: string;
  latency: string;
}

const SAMPLE_TRACES: readonly SampleTrace[] = [
  {
    id: 'alaala',
    label: 'ALAALA',
    question: 'What is Alaala Collections and what tech stack does it use?',
    answer:
      'Production MERN event management platform with client reservations, Cloudinary galleries, and a JWT-protected admin dashboard.',
    citationLabel: '[1] Project: Alaala Collections',
    citationTo: '/work/alaala-collections',
    similarity: '0.91',
    latency: '1.42s',
  },
  {
    id: 'plinth',
    label: 'PLINTH',
    question: 'How does Plinth handle multi-tenant workspace access control?',
    answer:
      'Workspace-based tenancy with owner, admin, member, and viewer roles, Zod route validation, Redis-cached metrics, and Jest/Supertest isolation tests.',
    citationLabel: '[1] System: Plinth SaaS',
    citationTo: '/about',
    similarity: '0.89',
    latency: '1.68s',
  },
  {
    id: 'bantay',
    label: 'BANTAY PH',
    question: 'How is RBAC implemented in Bantay PH?',
    answer:
      'Database-driven role-to-permission mapping resolved per request in Express 5 + Prisma/MySQL, paired with a transactional report status state machine.',
    citationLabel: '[1] System: Bantay PH',
    citationTo: '/about',
    similarity: '0.87',
    latency: '1.51s',
  },
];

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

function FeaturedProjectSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-lg border border-border bg-surface p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Skeleton className="aspect-video w-full" />
        </div>
        <div className="lg:col-span-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex flex-wrap gap-2 pt-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  usePageTitle();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);

  const [activeTraceId, setActiveTraceId] = useState<string>(
    SAMPLE_TRACES[0].id
  );
  const [quickPrompt, setQuickPrompt] = useState<string>('');
  const [portraitLoaded, setPortraitLoaded] = useState<boolean>(false);
  const [portraitError, setPortraitError] = useState<boolean>(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Project[]>('/projects');
      setProjects(response.data);
    } catch {
      setError('Unable to load projects right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();

    const start = performance.now();
    api
      .get<HealthResponse>('/health')
      .then((res) => {
        setHealth(res.data);
        setPingMs(Math.max(1, Math.round(performance.now() - start)));
      })
      .catch(() => {
        // Silent telemetry check
      });
  }, [fetchProjects]);

  const featuredProject =
    projects.find((project) => project.featured) ?? projects[0] ?? null;

  const selectedProjects = projects
    .filter((project) =>
      featuredProject ? project.id !== featuredProject.id : true
    )
    .slice(0, 3);

  const gridProjects =
    selectedProjects.length > 0 ? selectedProjects : projects.slice(0, 3);

  const featuredTitle = featuredProject
    ? splitProjectTitle(featuredProject.title)
    : null;
  const featuredStack = featuredProject
    ? featuredProject.techStack?.length > 0
      ? featuredProject.techStack
      : featuredProject.tags
    : [];
  const featuredLiveUrl = featuredProject
    ? featuredProject.liveUrl ?? featuredProject.url
    : null;
  const featuredLiveHost = formatHostname(featuredLiveUrl);

  const activeTrace =
    SAMPLE_TRACES.find((t) => t.id === activeTraceId) ?? SAMPLE_TRACES[0];

  const handleQuickPromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = quickPrompt.trim();
    if (trimmed.length < 2) {
      navigate('/chat');
      return;
    }
    navigate(`/chat?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="mx-auto max-w-300 px-4 sm:px-6">
      {/* 1. Hero + Interactive Operator Dossier */}
      <section className="py-12 sm:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Locked Hero Copy */}
          <div className="lg:col-span-7 space-y-6 max-w-[72ch]">
            <div className="flex flex-wrap items-center gap-3">
              <SectionLabel>FULL-STACK &amp; AI ENGINEER</SectionLabel>
              {health?.ok && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-0.5 font-mono text-xs text-textFaint">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  pgvector online{pingMs !== null ? ` · ${pingMs}ms` : ''}
                </span>
              )}
            </div>

            <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-5xl sm:leading-[1.12]">
              I build systems that survive contact with real users.
            </h1>

            <p className="font-sans text-base leading-relaxed text-textMuted sm:text-lg">
              Laravel, React, Postgres, and RAG pipelines. Based in Manila, open
              to full-stack and AI engineering roles.
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Button variant="primary" to="/chat" className="w-full sm:w-auto">
                Ask my portfolio anything →
              </Button>
              <Button variant="ghost" to="/work" className="w-full sm:w-auto">
                See my work
              </Button>
            </div>

            {/* Mono Strip (§3 locked items) */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 font-mono text-xs text-textFaint">
              <span className="inline-flex items-center gap-2 text-textMuted">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-accent"
                />
                Available
              </span>
              <span>Manila</span>
              <a
                href="https://github.com/jvecinadev"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
              >
                github
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
              >
                linkedin
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
              >
                resume.pdf
              </a>
            </div>
          </div>

          {/* Right Column: Personal Portrait + Interactive RAG Trace Switcher */}
          <aside
            aria-label="Operator dossier and interactive RAG preview"
            className="lg:col-span-5 rounded-lg border border-border bg-surface overflow-hidden"
          >
            {/* Subtle Terminal Chrome Bar */}
            <div className="flex items-center justify-between border-b border-border bg-surface2/60 px-4 py-2 font-mono text-[11px] text-textFaint">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-textMuted">jvecina.dev // rag-agent</span>
              </div>
              <span>gemini · pgvector</span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Identity Header with Portrait Slot */}
              <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface2">
                    {!portraitError && (
                      <img
                        src={`${import.meta.env.BASE_URL}portrait.jpg`}
                        alt="John Francis Vecina"
                        width={48}
                        height={48}
                        onLoad={() => setPortraitLoaded(true)}
                        onError={() => setPortraitError(true)}
                        className={`h-full w-full object-cover ${
                          portraitLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    )}
                    {(!portraitLoaded || portraitError) && (
                      <div className="flex h-full w-full items-center justify-center font-mono text-xs font-medium text-accent">
                        JFV
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-sans text-sm font-semibold text-text truncate">
                      John Francis Vecina
                    </p>
                    <p className="font-mono text-xs text-textFaint truncate">
                      @jvecinadev · MANILA, PH
                    </p>
                  </div>
                </div>

                <Link
                  to="/about"
                  className="shrink-0 rounded-lg border border-border bg-surface2 px-2.5 py-1 font-mono text-xs text-textMuted transition-colors duration-150 hover:border-accent/50 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  DOSSIER →
                </Link>
              </div>

              {/* Interactive Trace Selector Tabs */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-textFaint">
                    RAG TRACE PREVIEW
                  </span>
                  <div
                    role="tablist"
                    aria-label="Sample RAG traces"
                    className="flex items-center gap-1"
                  >
                    {SAMPLE_TRACES.map((trace) => {
                      const isSelected = trace.id === activeTrace.id;
                      return (
                        <button
                          key={trace.id}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => setActiveTraceId(trace.id)}
                          className={`rounded-lg border px-2 py-1 font-mono text-xs transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                            isSelected
                              ? 'border-accent/60 bg-surface2 text-text'
                              : 'border-border bg-ink text-textFaint hover:text-textMuted'
                          }`}
                        >
                          {trace.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Trace Output */}
                <div className="rounded-lg border border-border bg-ink p-3.5 space-y-3">
                  <div className="font-mono text-xs text-text leading-relaxed">
                    <span className="text-accent">&gt; </span>
                    {activeTrace.question}
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block h-3 w-1.5 bg-accent align-middle animate-cursor"
                    />
                  </div>

                  <p className="font-sans text-xs leading-relaxed text-textMuted">
                    {activeTrace.answer}{' '}
                    <span className="font-mono text-accent">[1]</span>
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                    <Link
                      to={activeTrace.citationTo}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-0.5 font-mono text-xs text-textMuted transition-colors duration-150 hover:border-accent hover:text-text"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {activeTrace.citationLabel}
                    </Link>
                    <span className="font-mono text-xs text-accent">
                      cos: {activeTrace.similarity}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 font-mono text-xs text-textFaint">
                  <span>{activeTrace.latency} · 2 sources · grounded</span>
                  <Link
                    to={`/chat?q=${encodeURIComponent(activeTrace.question)}`}
                    className="text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                  >
                    [ Run live query → ]
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 2. Featured Project */}
      <section className="border-t border-border py-14 sm:py-24 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionLabel index="01" label="FEATURED PRODUCTION SYSTEM" />
          {featuredLiveHost && featuredLiveUrl && (
            <a
              href={featuredLiveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs text-textMuted transition-colors duration-150 hover:text-accent"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              LIVE // {featuredLiveHost} ↗
            </a>
          )}
        </div>

        {loading && <FeaturedProjectSkeleton />}

        {!loading && error && (
          <ErrorState
            label="PROJECTS UNAVAILABLE"
            message={error}
            onRetry={() => void fetchProjects()}
          />
        )}

        {!loading && !error && !featuredProject && (
          <EmptyState
            label="01 / FEATURED WORK"
            title="No featured project found."
            description="Projects will appear here once seeded in the database."
          />
        )}

        {!loading && !error && featuredProject && featuredTitle && (
          <article className="rounded-lg border border-accent/30 bg-surface p-5 sm:p-8 transition-colors duration-150 hover:border-accent/50 hover:bg-surface2/60">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Visual Screenshot / Preview Frame */}
              <div className="lg:col-span-6">
                <Link
                  to={`/work/${featuredProject.slug}`}
                  className="block focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                >
                  <ProjectPreviewImage project={featuredProject} priority />
                </Link>
              </div>

              {/* Right Column: Engineering Details */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-1.5">
                  {featuredTitle.subtitle && (
                    <p className="font-mono text-xs uppercase tracking-wider text-accent">
                      {featuredTitle.subtitle}
                    </p>
                  )}
                  <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                    <Link
                      to={`/work/${featuredProject.slug}`}
                      className="transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                    >
                      {featuredTitle.name}
                    </Link>
                  </h2>
                </div>

                <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
                  {featuredProject.summary}
                </p>

                {featuredProject.highlights &&
                  featuredProject.highlights.length > 0 && (
                    <ul className="space-y-2 border-t border-border pt-4">
                      {featuredProject.highlights
                        .slice(0, 3)
                        .map((item, idx) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 font-sans text-xs sm:text-sm leading-relaxed text-textMuted"
                          >
                            <span className="font-mono text-xs text-accent shrink-0 pt-0.5">
                              0{idx + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                    </ul>
                  )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {featuredStack.slice(0, 7).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                  {featuredStack.length > 7 && (
                    <Tag>+{featuredStack.length - 7}</Tag>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 font-mono text-xs">
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/work/${featuredProject.slug}`}
                      className="font-medium text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                    >
                      VIEW CASE STUDY &amp; README →
                    </Link>
                    <Link
                      to={`/chat?q=${encodeURIComponent(
                        `Tell me about ${featuredProject.title}`
                      )}`}
                      className="text-textMuted transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                    >
                      ASK AGENT →
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 text-textFaint">
                    {featuredLiveUrl && (
                      <a
                        href={featuredLiveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                      >
                        LIVE ↗
                      </a>
                    )}
                    {featuredProject.githubUrl && (
                      <a
                        href={featuredProject.githubUrl}
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
            </div>
          </article>
        )}
      </section>

      {/* 3. Chat Teaser (Mid-page entry point) */}
      <section className="border-t border-border py-14 sm:py-24 space-y-8">
        <div className="max-w-[72ch] space-y-3">
          <SectionLabel index="02" label="INTERROGATE MY WORK" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
            Skip the scrolling. Query the codebase &amp; case studies.
          </h2>
          <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
            Every answer is retrieved via pgvector similarity search over my
            project writeups and experience, with inline citations to the source.
          </p>
        </div>

        {/* Direct Prompt Bar into /chat */}
        <form
          onSubmit={handleQuickPromptSubmit}
          className="flex flex-col gap-2.5 sm:flex-row max-w-2xl"
        >
          <div className="relative flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center font-mono text-xs text-accent"
            >
              &gt;
            </span>
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="Ask about any project, stack decision, or architecture..."
              aria-label="Ask my portfolio agent a question"
              maxLength={1000}
              className="w-full rounded-lg border border-border bg-surface pl-8 pr-4 py-2.5 font-mono text-xs text-text placeholder:text-textFaint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto shrink-0 text-xs"
          >
            Ask Agent →
          </Button>
        </form>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {HOME_TEASER_QUESTIONS.map((question) => (
            <Button
              key={question}
              variant="ghost"
              to={`/chat?q=${encodeURIComponent(question)}`}
              className="justify-between text-left font-mono text-xs leading-relaxed p-4 h-auto"
            >
              <span className="text-textMuted">{question}</span>
              <span aria-hidden="true" className="text-accent shrink-0 pl-2">
                →
              </span>
            </Button>
          ))}
        </div>
      </section>

      {/* 4. Selected Work Grid */}
      <section className="border-t border-border py-14 sm:py-24 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <SectionLabel index="03" label="SELECTED WORK" />
          <Link
            to="/work"
            className="font-mono text-xs text-textMuted transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg px-2 py-1 -mr-2"
          >
            ALL WORK ({projects.length || '…'}) →
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        )}

        {!loading && error && (
          <ErrorState
            label="PROJECTS UNAVAILABLE"
            message={error}
            onRetry={() => void fetchProjects()}
          />
        )}

        {!loading && !error && gridProjects.length === 0 && (
          <EmptyState
            label="03 / SELECTED WORK"
            title="No projects available."
            description="Check back once projects are published."
          />
        )}

        {!loading && !error && gridProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {gridProjects.map((project) => {
              const { name, subtitle } = splitProjectTitle(project.title);
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
                  className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors duration-150 hover:border-accent/40 hover:bg-surface2"
                >
                  <div className="space-y-4">
                    <Link
                      to={`/work/${project.slug}`}
                      className="block focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                    >
                      <ProjectPreviewImage project={project} />
                    </Link>

                    <div className="space-y-2">
                      {subtitle && (
                        <p className="font-mono text-xs text-accent truncate">
                          {subtitle}
                        </p>
                      )}
                      <h3 className="font-sans text-lg font-semibold text-text">
                        <Link
                          to={`/work/${project.slug}`}
                          className="transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                        >
                          {name}
                        </Link>
                      </h3>
                      <p className="font-sans text-sm leading-relaxed text-textMuted line-clamp-2">
                        {project.summary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {visibleTags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                      {overflowCount > 0 && <Tag>+{overflowCount}</Tag>}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3 font-mono text-xs">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/work/${project.slug}`}
                          className="font-medium text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                        >
                          VIEW →
                        </Link>
                        <Link
                          to={`/chat?q=${encodeURIComponent(
                            `Tell me about ${project.title}`
                          )}`}
                          className="text-textMuted transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                        >
                          ASK AI
                        </Link>
                      </div>

                      {liveUrl ? (
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                        >
                          LIVE ↗
                        </a>
                      ) : (
                        project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-textFaint transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                          >
                            REPO ↗
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}