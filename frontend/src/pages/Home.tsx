import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { HealthResponse, Project } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Button } from '../components/Button';
import { Tag } from '../components/Tag';
import { SectionLabel } from '../components/SectionLabel';
import { Skeleton, ProjectCardSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { ProjectPreviewImage } from '../components/ProjectPreviewImage';
import { SUGGESTED_QUESTIONS } from './Chat/SuggestedQuestions';

const HOME_TEASER_QUESTIONS: readonly string[] = SUGGESTED_QUESTIONS.slice(0, 3);
const MAX_CARD_TAGS = 6;

interface SystemPreview {
  id: string;
  label: string;
  systemName: string;
  roleLabel: string;
  architectureSummary: string;
  securityModel: string;
  verificationProof: string;
  sampleQuestion: string;
  stack: readonly string[];
  githubUrl: string;
}

const HERO_SYSTEM_PREVIEWS: readonly SystemPreview[] = [
  {
    id: 'plinth',
    label: '01 · Plinth',
    systemName: 'Plinth — Multi-Tenant B2B SaaS',
    roleLabel: 'SaaS Architecture',
    architectureSummary:
      'Workspace-scoped B2B platform for agencies managing clients, projects, and team tasks without cross-tenant data leakage.',
    securityModel:
      'Tenant ID scoping enforced at the DB query layer + 4-tier RBAC (Owner, Admin, Member, Viewer) on every mutating route.',
    verificationProof:
      'Zod request validation · Redis caching · Jest + Supertest integration tests',
    sampleQuestion:
      'How does Plinth enforce tenant isolation and RBAC across workspaces?',
    stack: ['React 19', 'TypeScript', 'Express 5', 'MongoDB', 'Redis', 'Zod', 'Docker'],
    githubUrl: 'https://github.com/jvecinadev/plinth',
  },
  {
    id: 'bantay-ph',
    label: '02 · Bantay PH',
    systemName: 'Bantay PH — Civic Governance Platform',
    roleLabel: 'State Machine & RBAC',
    architectureSummary:
      'Issue-reporting and case resolution system designed for barangay-level local government operations and public accountability.',
    securityModel:
      'Per-request database permission resolution (eliminating stale JWT role claims) paired with a transactional status state machine.',
    verificationProof:
      'Race-condition-safe transitions · Immutable audit logs · Prisma + MySQL',
    sampleQuestion:
      'How does Bantay PH handle per-request permissions and status transitions?',
    stack: ['React 19', 'TypeScript', 'Prisma', 'MySQL', 'TanStack Query', 'Zustand'],
    githubUrl: 'https://github.com/jvecinadev/bantay-ph',
  },
  {
    id: 'vouch',
    label: '03 · Vouch',
    systemName: 'Vouch — Local AI Diff Security Reviewer',
    roleLabel: 'AI Security Tooling',
    architectureSummary:
      'Privacy-first git diff analyzer that catches removed safeguards and vulnerabilities before code is merged.',
    securityModel:
      'Combines AST parsing (tree-sitter) and static analyzers (Bandit, Semgrep) with local Ollama triage so code never leaves the machine.',
    verificationProof:
      'Automated patch verification (apply → parse → confirm) · SARIF export',
    sampleQuestion:
      'How does Vouch combine static analysis with local LLMs to verify security patches?',
    stack: ['Python', 'Ollama', 'Bandit', 'Semgrep', 'tree-sitter', 'Gradio', 'pytest'],
    githubUrl: 'https://github.com/jvecinadev/vouch',
  },
] as const;

const HERO_PILLARS = [
  {
    title: 'Multi-Tenant & RBAC',
    detail: 'Query-level isolation & per-request permission checks',
  },
  {
    title: 'Grounded RAG Systems',
    detail: 'FastAPI, Laravel, pgvector & deterministic citations',
  },
  {
    title: 'End-to-End Delivery',
    detail: 'React 19, TypeScript, schema validation & Docker CI',
  },
] as const;

interface ProofOverride {
  whatItIs: string;
  proof: string;
  preferredOrder: number;
}

const PROJECT_PROOF_MAP: Record<string, ProofOverride> = {
  plinth: {
    whatItIs:
      'Multi-tenant B2B SaaS for agencies and teams managing clients, projects, and tasks across isolated workspaces.',
    proof:
      'Tenant isolation enforced at the DB query level; 4-tier RBAC on every mutating endpoint; integration tests with Jest + Supertest.',
    preferredOrder: 1,
  },
  'bantay-ph': {
    whatItIs:
      'Civic issue-reporting and resolution platform built for barangay-level local government units.',
    proof:
      'Per-request DB permission resolution (no stale JWT roles); race-condition-safe transactional state machine; full audit trails.',
    preferredOrder: 2,
  },
  vouch: {
    whatItIs:
      'Privacy-first AI security reviewer for git diffs — built for solo developers and small teams who need local security triage.',
    proof:
      'Detects removed safeguards, triages with local AI (Ollama), and verifies patches (apply → parse → confirm). Exports SARIF.',
    preferredOrder: 3,
  },
  'jvecina-dev': {
    whatItIs:
      'Full-stack portfolio and grounded RAG agent that answers technical questions strictly from indexed project and experience data.',
    proof:
      'Vector similarity retrieval via PostgreSQL + pgvector and Gemini embeddings with strict similarity thresholds and clickable source citations.',
    preferredOrder: 4,
  },
  'alaala-collections': {
    whatItIs:
      'Collection and event management platform for cataloging items, client reservations, galleries, and admin operations.',
    proof:
      'End-to-end CRUD workflows, search and filtering, Cloudinary media pipeline, and JWT-protected administrative controls.',
    preferredOrder: 5,
  },
};

const EXPERIENCE_ITEMS = [
  {
    role: 'Backend AI Engineer — Intern',
    company: 'FlyRank AI',
    location: 'Remote',
    period: 'Aug 2026 – Present',
    bullets: [
      'Building RAG pipelines and LLM-backed backend services for production AI features using Python, FastAPI, and pgvector.',
      'Designing grounded retrieval and API layers that keep AI outputs reliable, citable, and testable in production.',
    ],
  },
  {
    role: 'Freelance Software Developer',
    company: 'Self-Employed',
    location: 'Valenzuela, PH',
    period: 'Aug 2025 – Present',
    bullets: [
      'Delivered full-stack web applications for small businesses — multi-tenant SaaS, admin dashboards, and RBAC-protected CRUD systems.',
      'Owned the full lifecycle: requirements, architecture, build, and deployment (React, TypeScript, Express, PostgreSQL/Prisma, Docker, Vercel).',
    ],
  },
] as const;

const MASTER_STACK_GROUPS = [
  {
    category: 'Frontend & State',
    skills: [
      'TypeScript',
      'JavaScript',
      'React 19',
      'TanStack Query',
      'Zustand',
      'Tailwind CSS',
      'Vite',
    ],
  },
  {
    category: 'Backend & Validation',
    skills: [
      'Node.js',
      'Express 5',
      'Python',
      'FastAPI',
      'Laravel',
      'Zod',
      'Pydantic',
      'REST APIs',
    ],
  },
  {
    category: 'Data, ORM & Vectors',
    skills: [
      'PostgreSQL',
      'pgvector',
      'Prisma',
      'MySQL',
      'MongoDB',
      'Redis',
      'SQL',
    ],
  },
  {
    category: 'AI, Testing & Workflow',
    skills: [
      'Gemini API',
      'Claude',
      'OpenAI',
      'DeepSeek',
      'Ollama',
      'Jest',
      'Supertest',
      'Docker',
      'GitHub Actions',
      'Linux',
      'Vercel',
    ],
  },
] as const;

const CLIENT_SERVICES = [
  {
    title: 'Full-Stack Web Apps',
    description:
      'React and TypeScript frontends paired with Node.js or FastAPI backends — deployed, validated, and ready for real users.',
    deliverables: 'SaaS Builds · Admin Dashboards · Client Portals',
    subject: 'Full-Stack Web App Inquiry — jvecina.dev',
  },
  {
    title: 'Backend & API Systems',
    description:
      'Multi-tenant architecture, role-based access control (RBAC), third-party integrations, and relational or document database design.',
    deliverables: 'Multi-Tenancy · RBAC · Database Design',
    subject: 'Backend & API Architecture Inquiry — jvecina.dev',
  },
  {
    title: 'AI Integration',
    description:
      'RAG pipelines, pgvector retrieval, and LLM-backed backend features grounded in your application data without guesswork.',
    deliverables: 'RAG Pipelines · Semantic Search · LLM Services',
    subject: 'AI Integration Inquiry — jvecina.dev',
  },
] as const;

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

function getProofForProject(project: Project): ProofOverride | null {
  const slugKey = project.slug.toLowerCase();
  if (PROJECT_PROOF_MAP[slugKey]) {
    return PROJECT_PROOF_MAP[slugKey];
  }
  const titleLower = project.title.toLowerCase();
  if (titleLower.includes('plinth')) return PROJECT_PROOF_MAP.plinth;
  if (titleLower.includes('bantay')) return PROJECT_PROOF_MAP['bantay-ph'];
  if (titleLower.includes('vouch')) return PROJECT_PROOF_MAP.vouch;
  if (titleLower.includes('jvecina')) return PROJECT_PROOF_MAP['jvecina-dev'];
  if (titleLower.includes('alaala')) return PROJECT_PROOF_MAP['alaala-collections'];
  return null;
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

  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isInspectorPaused, setIsInspectorPaused] = useState<boolean>(false);
  const [heroPrompt, setHeroPrompt] = useState<string>('');
  const [quickPrompt, setQuickPrompt] = useState<string>('');

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

    api
      .get<HealthResponse>('/health')
      .then((res) => setHealth(res.data))
      .catch(() => {
        // Silent health check
      });
  }, [fetchProjects]);

  // Subtle auto-rotation for the Hero System Inspector (pauses on hover/focus)
  useEffect(() => {
    if (isInspectorPaused) return;
    const intervalId = window.setInterval(() => {
      setActivePreviewIndex((prev) => (prev + 1) % HERO_SYSTEM_PREVIEWS.length);
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, [isInspectorPaused]);

  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const orderA = getProofForProject(a)?.preferredOrder ?? 50;
      const orderB = getProofForProject(b)?.preferredOrder ?? 50;
      if (orderA !== orderB) return orderA - orderB;
      return a.id - b.id;
    });
  }, [projects]);

  const featuredProject = useMemo(() => {
    if (orderedProjects.length === 0) return null;
    const nonAlaala = orderedProjects.find(
      (p) => !p.slug.toLowerCase().includes('alaala')
    );
    return nonAlaala ?? orderedProjects[0];
  }, [orderedProjects]);

  const gridProjects = useMemo(() => {
    if (!featuredProject) return [];
    return orderedProjects
      .filter((p) => p.id !== featuredProject.id)
      .slice(0, 3);
  }, [orderedProjects, featuredProject]);

  const activePreview =
    HERO_SYSTEM_PREVIEWS[activePreviewIndex] ?? HERO_SYSTEM_PREVIEWS[0];

  const handleHeroPromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = heroPrompt.trim();
    if (trimmed.length < 2) {
      navigate(`/chat?q=${encodeURIComponent(activePreview.sampleQuestion)}`);
      return;
    }
    navigate(`/chat?q=${encodeURIComponent(trimmed)}`);
  };

  const handleQuickPromptSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = quickPrompt.trim();
    if (trimmed.length < 2) {
      navigate('/chat');
      return;
    }
    navigate(`/chat?q=${encodeURIComponent(trimmed)}`);
  };

  const featuredTitle = featuredProject
    ? splitProjectTitle(featuredProject.title)
    : null;
  const featuredProof = featuredProject
    ? getProofForProject(featuredProject)
    : null;
  const featuredStack = featuredProject
    ? featuredProject.techStack?.length > 0
      ? featuredProject.techStack
      : featuredProject.tags
    : [];
  const featuredLiveUrl = featuredProject
    ? featuredProject.liveUrl ?? featuredProject.url
    : null;

  return (
    <div className="mx-auto max-w-300 px-4 sm:px-6">
      {/* 1. SYMMETRICAL HERO SECTION */}
      <section className="py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
          {/* LEFT COLUMN: Identity, Headline, CTAs & 3-Pillar Architecture Bar */}
          <div className="flex flex-col justify-between lg:col-span-7 space-y-8">
            <div className="space-y-6">
              {/* Top Status & Positioning Pill */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1 font-mono text-xs text-text">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-accent animate-pulse"
                  />
                  <span>Available for Work</span>
                </div>

                <span className="rounded-md border border-border bg-surface/60 px-3 py-1 font-mono text-xs text-textMuted">
                  Backend AI Intern @ FlyRank AI
                </span>
              </div>

              {/* Name, Role & Main Headline */}
              <div className="space-y-3.5">
                <p className="font-mono text-xs uppercase tracking-wider text-accent">
                  John Francis Vecina &nbsp;·&nbsp; Full Stack Developer &amp;
                  Backend AI Engineer
                </p>

                <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-5xl lg:text-[46px] sm:leading-[1.1]">
                  I build web apps and AI backends that hold up in production.
                </h1>

                <p className="font-sans text-base leading-relaxed text-textMuted sm:text-lg max-w-[60ch]">
                  From multi-tenant SaaS with query-level isolation to grounded
                  RAG pipelines — I focus on strict validation, clean database
                  architecture, and software teams can rely on under real-world
                  load.
                </p>
              </div>

              {/* Action Buttons: Mobile-symmetrical (Primary full width on mobile + 2-col secondary) */}
              <div className="space-y-2.5 pt-1 sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:space-y-0">
                <Button
                  variant="primary"
                  to="/chat"
                  className="w-full sm:w-auto"
                >
                  Ask my portfolio anything →
                </Button>

                <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3">
                  <Button
                    variant="ghost"
                    href="mailto:johnvecina640@gmail.com?subject=Project%20Inquiry%20%E2%80%94%20jvecina.dev"
                    className="w-full sm:w-auto"
                  >
                    Start a Project
                  </Button>
                  <Button
                    variant="ghost"
                    to="/work"
                    className="w-full sm:w-auto"
                  >
                    See my work
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Anchor: 3-Column Engineering Pillars + Direct Links */}
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {HERO_PILLARS.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-lg border border-border bg-surface/80 p-3.5 transition-colors duration-150 hover:border-textFaint"
                  >
                    <p className="font-mono text-xs font-medium text-text">
                      {pillar.title}
                    </p>
                    <p className="mt-1 font-sans text-xs leading-relaxed text-textMuted">
                      {pillar.detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Recruiter & Contact Links */}
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-4 font-mono text-xs text-textMuted">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <a
                    href={`${import.meta.env.BASE_URL}resume.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text underline underline-offset-4 decoration-border transition-colors duration-150 hover:text-accent hover:decoration-accent"
                  >
                    Resume PDF ↗
                  </a>
                  <a
                    href="https://github.com/jvecinadev"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 decoration-border transition-colors duration-150 hover:text-text"
                  >
                    GitHub ↗
                  </a>
                  <a
                    href="https://www.linkedin.com/in/jvecinadev/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 decoration-border transition-colors duration-150 hover:text-text"
                  >
                    LinkedIn ↗
                  </a>
                </div>

                <span className="text-textFaint">
                  Valenzuela, PH (UTC+8)
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live System Architecture & RAG Console (Equal Height) */}
          <aside
            aria-label="Interactive system architecture and RAG inspector"
            onMouseEnter={() => setIsInspectorPaused(true)}
            onMouseLeave={() => setIsInspectorPaused(false)}
            className="flex flex-col justify-between rounded-lg border border-border bg-surface overflow-hidden lg:col-span-5"
          >
            {/* Top Window Bar */}
            <div>
              <div className="flex items-center justify-between border-b border-border bg-surface2/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      health?.ok ? 'bg-accent' : 'bg-textMuted'
                    }`}
                  />
                  <span className="font-mono text-xs font-medium text-text">
                    Production Systems Inspector
                  </span>
                </div>
                <span className="font-mono text-[11px] text-textFaint">
                  {isInspectorPaused ? 'Paused' : 'Auto-cycling'}
                </span>
              </div>

              {/* 3-Tab System Switcher */}
              <div
                role="tablist"
                aria-label="Select flagship project to inspect"
                className="grid grid-cols-3 border-b border-border bg-ink/60 p-1.5 gap-1.5"
              >
                {HERO_SYSTEM_PREVIEWS.map((sys, idx) => {
                  const selected = idx === activePreviewIndex;
                  return (
                    <button
                      key={sys.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => {
                        setActivePreviewIndex(idx);
                        setIsInspectorPaused(true);
                      }}
                      className={`rounded-md border px-2.5 py-2 font-mono text-xs transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                        selected
                          ? 'border-accent bg-accent/10 text-text font-medium'
                          : 'border-transparent bg-transparent text-textMuted hover:bg-surface hover:text-text'
                      }`}
                    >
                      {sys.label}
                    </button>
                  );
                })}
              </div>

              {/* Active System Specification Body */}
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                      {activePreview.roleLabel}
                    </p>
                    <h2 className="mt-0.5 font-sans text-base font-semibold text-text">
                      {activePreview.systemName}
                    </h2>
                  </div>
                  <a
                    href={activePreview.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-md border border-border bg-ink px-2.5 py-1 font-mono text-[11px] text-textMuted transition-colors duration-150 hover:border-textFaint hover:text-text"
                  >
                    Code ↗
                  </a>
                </div>

                <p className="font-sans text-xs sm:text-sm leading-relaxed text-textMuted">
                  {activePreview.architectureSummary}
                </p>

                {/* Architecture & Verification Breakdown */}
                <div className="rounded-lg border border-border bg-ink p-3.5 space-y-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                      Security &amp; Data Integrity
                    </p>
                    <p className="mt-1 font-sans text-xs leading-relaxed text-text">
                      {activePreview.securityModel}
                    </p>
                  </div>

                  <div className="border-t border-border pt-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-textFaint">
                      Verification
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-textMuted">
                      {activePreview.verificationProof}
                    </p>
                  </div>
                </div>

                {/* Stack Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {activePreview.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border bg-ink px-2 py-0.5 font-mono text-[11px] text-textMuted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Console Footer: Direct RAG Query Input */}
            <div className="border-t border-border bg-ink/80 p-4 space-y-2.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-textFaint">ASK THE PORTFOLIO AI</span>
                <Link
                  to={`/chat?q=${encodeURIComponent(
                    activePreview.sampleQuestion
                  )}`}
                  className="text-accent transition-colors duration-150 hover:text-text"
                >
                  Ask about {activePreview.systemName.split(' — ')[0]} →
                </Link>
              </div>

              <form
                onSubmit={handleHeroPromptSubmit}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  onFocus={() => setIsInspectorPaused(true)}
                  placeholder={activePreview.sampleQuestion}
                  aria-label="Ask a question about John's projects or experience"
                  maxLength={1000}
                  className="w-full min-w-0 rounded-md border border-border bg-surface px-3 py-2 font-sans text-xs text-text placeholder:text-textFaint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="shrink-0"
                >
                  Ask →
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </section>

      {/* 2. FEATURED CASE STUDY */}
      <section className="border-t border-border py-14 sm:py-20 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <SectionLabel index="01" label="FEATURED SYSTEM" />
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Production engineering with verifiable proof.
            </h2>
          </div>
          <Link
            to="/work"
            className="font-mono text-xs text-textMuted transition-colors duration-150 hover:text-accent"
          >
            View all projects ({projects.length || '5'}) →
          </Link>
        </div>

        {loading && <FeaturedProjectSkeleton />}

        {!loading && error && (
          <ErrorState
            label="PROJECTS UNAVAILABLE"
            message={error}
            onRetry={() => void fetchProjects()}
          />
        )}

        {!loading && !error && featuredProject && featuredTitle && (
          <article className="rounded-lg border border-border bg-surface overflow-hidden transition-colors duration-150 hover:border-textFaint">
            <div className="p-5 sm:p-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                {/* Preview Image */}
                <div className="lg:col-span-6">
                  <Link
                    to={`/work/${featuredProject.slug}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                  >
                    <ProjectPreviewImage project={featuredProject} priority />
                  </Link>
                </div>

                {/* Case Study Details */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-accent">
                      <span>FLAGSHIP CASE STUDY</span>
                      {featuredTitle.subtitle && (
                        <>
                          <span className="text-textFaint">·</span>
                          <span>{featuredTitle.subtitle}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                      <Link
                        to={`/work/${featuredProject.slug}`}
                        className="transition-colors duration-150 hover:text-accent"
                      >
                        {featuredTitle.name}
                      </Link>
                    </h3>
                  </div>

                  <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
                    {featuredProof?.whatItIs ?? featuredProject.summary}
                  </p>

                  {featuredProof && (
                    <div className="rounded-lg border border-border bg-ink p-4 space-y-1.5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                        Engineering Proof
                      </p>
                      <p className="font-sans text-xs sm:text-sm leading-relaxed text-text">
                        {featuredProof.proof}
                      </p>
                    </div>
                  )}

                  {!featuredProof &&
                    featuredProject.highlights &&
                    featuredProject.highlights.length > 0 && (
                      <ul className="space-y-2 border-t border-border pt-4">
                        {featuredProject.highlights.slice(0, 3).map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 font-sans text-xs sm:text-sm leading-relaxed text-textMuted"
                          >
                            <span className="font-mono text-xs text-accent shrink-0 pt-0.5">
                              →
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
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 font-mono text-xs">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/work/${featuredProject.slug}`}
                        className="font-medium text-text transition-colors duration-150 hover:text-accent py-1"
                      >
                        Read Case Study &amp; README →
                      </Link>
                      <Link
                        to={`/chat?q=${encodeURIComponent(
                          `Tell me about ${featuredTitle.name} and how it is architected`
                        )}`}
                        className="text-textMuted transition-colors duration-150 hover:text-text py-1"
                      >
                        Ask AI →
                      </Link>
                    </div>

                    <div className="flex items-center gap-4">
                      {featuredLiveUrl && (
                        <a
                          href={featuredLiveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent transition-colors duration-150 hover:text-text py-1"
                        >
                          Live Demo ↗
                        </a>
                      )}
                      {featuredProject.githubUrl && (
                        <a
                          href={featuredProject.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-textMuted transition-colors duration-150 hover:text-text py-1"
                        >
                          Source Code ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}
      </section>

      {/* 3. SELECTED WORK GRID */}
      <section className="border-t border-border py-14 sm:py-20 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <SectionLabel index="02" label="SELECTED PROJECTS" />
          <Link
            to="/work"
            className="font-mono text-xs text-textMuted transition-colors duration-150 hover:text-accent"
          >
            See all projects →
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        )}

        {!loading && !error && gridProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {gridProjects.map((project) => {
              const { name, subtitle } = splitProjectTitle(project.title);
              const proof = getProofForProject(project);
              const stack =
                project.techStack?.length > 0
                  ? project.techStack
                  : project.tags;
              const visibleTags = stack.slice(0, MAX_CARD_TAGS);
              const liveUrl = project.liveUrl ?? project.url;

              return (
                <article
                  key={project.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors duration-150 hover:border-textFaint"
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
                          className="transition-colors duration-150 hover:text-accent"
                        >
                          {name}
                        </Link>
                      </h3>
                      <p className="font-sans text-sm leading-relaxed text-textMuted">
                        {proof?.whatItIs ?? project.summary}
                      </p>
                    </div>

                    {proof && (
                      <div className="rounded-md border border-border bg-ink/70 p-3">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                          Proof
                        </p>
                        <p className="mt-1 font-sans text-xs leading-relaxed text-textMuted">
                          {proof.proof}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {visibleTags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3 font-mono text-xs">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/work/${project.slug}`}
                          className="font-medium text-text transition-colors duration-150 hover:text-accent"
                        >
                          Case Study →
                        </Link>
                        <Link
                          to={`/chat?q=${encodeURIComponent(
                            `Tell me about ${name}`
                          )}`}
                          className="text-textMuted transition-colors duration-150 hover:text-text"
                        >
                          Ask AI
                        </Link>
                      </div>

                      <div className="flex items-center gap-3">
                        {liveUrl && (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent transition-colors duration-150 hover:text-text"
                          >
                            Live ↗
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-textMuted transition-colors duration-150 hover:text-text"
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
        )}
      </section>

      {/* 4. PORTFOLIO RAG AGENT TEASER (Mandatory Entry Point #3) */}
      <section className="border-t border-border py-14 sm:py-20">
        <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[64ch] space-y-2.5">
              <SectionLabel index="03" label="GROUNDED PORTFOLIO AI" />
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Have a specific technical question? Ask the RAG agent.
              </h2>
              <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
                Built with PostgreSQL, pgvector, and Gemini embeddings. It
                answers strictly from my repositories, architecture writeups,
                and work experience — with clickable source citations.
              </p>
            </div>

            <form
              onSubmit={handleQuickPromptSubmit}
              className="flex w-full flex-col gap-2.5 sm:flex-row lg:max-w-md"
            >
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Ask about my stack, RBAC, or projects..."
                aria-label="Ask my portfolio a question"
                maxLength={1000}
                className="w-full rounded-md border border-border bg-ink px-3.5 py-2 font-sans text-sm text-text placeholder:text-textFaint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto shrink-0"
              >
                Ask →
              </Button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 border-t border-border pt-6">
            {HOME_TEASER_QUESTIONS.map((question) => (
              <Link
                key={question}
                to={`/chat?q=${encodeURIComponent(question)}`}
                className="group flex items-start justify-between gap-3 rounded-lg border border-border bg-ink p-4 text-left transition-colors duration-150 hover:border-textFaint hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <span className="font-sans text-sm leading-snug text-textMuted transition-colors duration-150 group-hover:text-text">
                  {question}
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono text-xs text-textFaint transition-colors duration-150 group-hover:text-accent shrink-0"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EXPERIENCE & MASTER TECH STACK */}
      <section className="border-t border-border py-14 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Experience & Education */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <SectionLabel index="04" label="EXPERIENCE & EDUCATION" />
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
                Where I’ve built and shipped.
              </h2>
            </div>

            <div className="space-y-4">
              {EXPERIENCE_ITEMS.map((exp) => (
                <div
                  key={exp.role + exp.company}
                  className="rounded-lg border border-border bg-surface p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-sans text-base font-semibold text-text">
                        {exp.role}
                      </h3>
                      <p className="font-mono text-xs text-accent">
                        {exp.company} · {exp.location}
                      </p>
                    </div>
                    <span className="rounded border border-border bg-ink px-2 py-0.5 font-mono text-[11px] text-textMuted">
                      {exp.period}
                    </span>
                  </div>

                  <ul className="space-y-2 pt-1">
                    {exp.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 font-sans text-sm leading-relaxed text-textMuted"
                      >
                        <span className="font-mono text-xs text-accent pt-1">
                          •
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Education Card */}
              <div className="rounded-lg border border-border bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-sans text-base font-semibold text-text">
                      Pamantasan ng Lungsod ng Valenzuela
                    </h3>
                    <p className="font-sans text-sm text-textMuted">
                      BS in Information Technology — Focus: Web Development
                    </p>
                  </div>
                  <span className="rounded border border-border bg-ink px-2 py-0.5 font-mono text-[11px] text-textMuted">
                    Present
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Master Tech Stack */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <SectionLabel index="05" label="TECHNICAL STACK" />
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
                Tools I use in production.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {MASTER_STACK_GROUPS.map((group) => (
                <div
                  key={group.category}
                  className="rounded-lg border border-border bg-surface p-5 space-y-3"
                >
                  <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <Tag key={skill}>{skill}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. WORK WITH ME (Clients & Recruiters) */}
      <section className="border-t border-border py-14 sm:py-20 space-y-10">
        <div className="max-w-[64ch] space-y-2.5">
          <SectionLabel index="06" label="WORK WITH ME" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Available for engineering roles and select client builds.
          </h2>
          <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
            Whether you need a full-stack application built from scratch, a
            multi-tenant backend architected properly, or a grounded AI feature
            shipped to production.
          </p>
        </div>

        {/* 3 Service Pillars */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CLIENT_SERVICES.map((service) => (
            <div
              key={service.title}
              className="flex flex-col justify-between rounded-lg border border-border bg-surface p-6 space-y-6"
            >
              <div className="space-y-3">
                <p className="font-mono text-[11px] text-accent">
                  {service.deliverables}
                </p>
                <h3 className="font-sans text-lg font-semibold text-text">
                  {service.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-textMuted">
                  {service.description}
                </p>
              </div>

              <a
                href={`mailto:johnvecina640@gmail.com?subject=${encodeURIComponent(
                  service.subject
                )}`}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-text transition-colors duration-150 hover:text-accent pt-3 border-t border-border"
              >
                <span>Have something in mind? Let’s talk</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>

        {/* Dual Conversion Strip: For Clients & For Recruiters */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* For Clients */}
          <div className="flex flex-col justify-between rounded-lg border border-border bg-surface2/50 p-6 space-y-4">
            <div className="space-y-1.5">
              <p className="font-mono text-xs uppercase tracking-wider text-accent">
                For Clients
              </p>
              <h3 className="font-sans text-xl font-semibold text-text">
                Building something? I take on a limited number of freelance
                projects.
              </h3>
              <p className="font-sans text-sm text-textMuted">
                Direct communication, clean architecture, and production-ready
                deployment.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                href="mailto:johnvecina640@gmail.com?subject=Project%20Inquiry%20%E2%80%94%20jvecina.dev"
              >
                Start a Project →
              </Button>
              <span className="font-mono text-xs text-textFaint">
                johnvecina640@gmail.com
              </span>
            </div>
          </div>

          {/* For Recruiters */}
          <div className="flex flex-col justify-between rounded-lg border border-border bg-surface2/50 p-6 space-y-4">
            <div className="space-y-1.5">
              <p className="font-mono text-xs uppercase tracking-wider text-accent">
                For Recruiters &amp; Hiring Managers
              </p>
              <h3 className="font-sans text-xl font-semibold text-text">
                Open to Full-Stack &amp; Backend AI Engineer roles.
              </h3>
              <p className="font-sans text-sm text-textMuted">
                Remote or Philippines-based (UTC+8). Inspect my resume, source
                repositories, or query my experience via the RAG assistant.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Button
                variant="ghost"
                href={`${import.meta.env.BASE_URL}resume.pdf`}
              >
                Resume PDF ↗
              </Button>
              <Button variant="ghost" href="https://github.com/jvecinadev">
                GitHub ↗
              </Button>
              <Button
                variant="ghost"
                href="https://www.linkedin.com/in/jvecinadev/"
              >
                LinkedIn ↗
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}