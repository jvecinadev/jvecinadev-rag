import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Experience } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Button } from '../components/Button';
import { SectionLabel } from '../components/SectionLabel';
import { Tag } from '../components/Tag';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

interface SkillGroup {
  id: string;
  category: string;
  code: string;
  featured?: boolean;
  skills: readonly string[];
}

const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    id: '01',
    category: 'AI / RAG',
    code: 'DIFFERENTIATOR // RETRIEVAL & GROUNDING',
    featured: true,
    skills: [
      'LARAVEL',
      'GOOGLE GEMINI',
      'EMBEDDINGS',
      'VECTOR SEARCH',
      'RAG PIPELINES',
    ],
  },
  {
    id: '02',
    category: 'Frontend',
    code: 'UI & CLIENT ARCHITECTURE',
    skills: ['REACT', 'TYPESCRIPT', 'JAVASCRIPT', 'TAILWIND', 'VITE'],
  },
  {
    id: '03',
    category: 'Backend',
    code: 'API & AUTHENTICATION',
    skills: [
      'NODE.JS',
      'EXPRESS',
      'ZOD',
      'JWT',
      'HTTPONLY COOKIES',
      'REST',
    ],
  },
  {
    id: '04',
    category: 'Data & Caching',
    code: 'RELATIONAL, DOCUMENT & VECTOR STORES',
    skills: [
      'MONGODB',
      'POSTGRESQL',
      'REDIS',
      'PRISMA',
      'MYSQL',
      'PGVECTOR',
    ],
  },
  {
    id: '05',
    category: 'Quality & Infrastructure',
    code: 'TESTING, CONTAINERS & CI',
    skills: ['JEST', 'SUPERTEST', 'DOCKER', 'GITHUB ACTIONS'],
  },
  {
    id: '06',
    category: 'Workflow',
    code: 'VERSION CONTROL & API TOOLING',
    skills: ['GIT', 'GITHUB', 'POSTMAN', 'FIGMA'],
  },
  {
    id: '07',
    category: 'Deployment',
    code: 'CLOUD & PRODUCTION HOSTING',
    skills: ['VERCEL', 'RENDER', 'MONGODB ATLAS'],
  },
];

interface EngineeringTheme {
  id: string;
  title: string;
  detail: string;
  proof: string;
  askPrompt: string;
  featured?: boolean;
}

const ENGINEERING_THEMES: readonly EngineeringTheme[] = [
  {
    id: '01',
    title: 'Tenant isolation & RBAC',
    detail:
      'Database-driven role-to-permission mapping resolved per request and workspace-based tenancy.',
    proof: 'PLINTH · BANTAY PH',
    askPrompt:
      'How do you implement tenant isolation and RBAC in Plinth and Bantay PH?',
    featured: true,
  },
  {
    id: '02',
    title: 'Auth flows',
    detail: 'JWT via httpOnly cookies, protected routes, and role middleware.',
    proof: 'PLINTH · ALAALA COLLECTIONS',
    askPrompt: 'How do you handle JWT authentication and protected routes?',
  },
  {
    id: '03',
    title: 'Validation-first APIs',
    detail: 'Zod schemas on every route with consistent error responses.',
    proof: 'PLINTH · BANTAY PH',
    askPrompt: 'How do you use Zod validation and structure API error responses?',
  },
  {
    id: '04',
    title: 'Testing mindset',
    detail:
      'Jest / Supertest integration suites covering tenant isolation and state transitions.',
    proof: 'PLINTH',
    askPrompt: 'What integration tests did you write for Plinth?',
  },
  {
    id: '05',
    title: 'Deployment-ready',
    detail:
      'Dockerized services, GitHub Actions CI pipelines on push, and strict environment config.',
    proof: 'PLINTH · ALAALA COLLECTIONS',
    askPrompt: 'How do you set up Docker and GitHub Actions CI in your projects?',
  },
];

interface SystemLogItem {
  code: string;
  name: string;
  status: string;
  isLive?: boolean;
  caseStudySlug?: string;
  summary: string;
  highlights: readonly string[];
  stack: readonly string[];
  repoUrl: string;
  liveUrl?: string;
  askPrompt: string;
}

const SHIPPED_SYSTEMS: readonly SystemLogItem[] = [
  {
    code: 'SYS // 01',
    name: 'Plinth',
    status: 'IN PROGRESS · FEATURED',
    summary:
      'Multi-tenant SaaS platform for managing clients, projects, and tasks across team workspaces, with role-based access control and a Redis-cached metrics dashboard.',
    highlights: [
      'Workspace-based tenancy with owner, admin, member, and viewer roles, invites, and workspace switching.',
      'Jest + Supertest integration suite verifying tenant isolation and soft-delete behavior.',
      'Dockerized frontend and backend with GitHub Actions running build and test on every push.',
    ],
    stack: [
      'REACT 19',
      'TYPESCRIPT',
      'NODE.JS',
      'EXPRESS 5',
      'MONGODB',
      'REDIS',
      'ZOD',
      'JEST',
      'DOCKER',
    ],
    repoUrl: 'https://github.com/jvecinadev/plinth',
    askPrompt: 'Tell me about Plinth and how workspace tenancy is implemented',
  },
  {
    code: 'SYS // 02',
    name: 'Bantay PH',
    status: 'CIVIC PLATFORM',
    summary:
      'Full-stack community issue-reporting platform for local government use. Residents submit reports, validators verify them, and staff resolve them through an enforced status workflow with a complete audit trail.',
    highlights: [
      'Database-driven RBAC with role-to-permission mapping resolved per request rather than hardcoded in JWTs.',
      'Enforced report lifecycle state machine with transactional, race-condition-safe status updates.',
      'Prisma + MySQL schema with decimal-precision coordinates, unique validator constraints, and explicit cascade/restrict rules.',
    ],
    stack: [
      'REACT 19',
      'TYPESCRIPT',
      'EXPRESS 5',
      'PRISMA',
      'MYSQL',
      'TANSTACK QUERY',
      'ZUSTAND',
      'TAILWIND',
    ],
    repoUrl: 'https://github.com/jvecinadev/bantay-ph',
    askPrompt: 'How does Bantay PH handle RBAC and report status workflows?',
  },
  {
    code: 'SYS // 03',
    name: 'Alaala Collections',
    status: 'PRODUCTION · LIVE',
    isLive: true,
    caseStudySlug: 'alaala-collections',
    summary:
      'Full-stack MERN event management platform with protected admin dashboard, end-to-end reservation workflow, Cloudinary gallery management, and review moderation.',
    highlights: [
      'End-to-end client booking and reservation status tracking with admin approval controls.',
      'JWT-protected administrative routes for managing service packages, galleries, and customer reviews.',
    ],
    stack: ['REACT', 'NODE.JS', 'EXPRESS', 'MONGODB', 'JWT', 'CLOUDINARY'],
    repoUrl:
      'https://github.com/jvecinadev/event-management-platform-case-study',
    liveUrl: 'https://alaalacollections.site',
    askPrompt: 'What is Alaala Collections and what tech stack does it use?',
  },
  {
    code: 'SYS // 04',
    name: 'Vouch',
    status: 'AI SECURITY TOOLING',
    summary:
      'Local, privacy-first security reviewer for git diffs. Scans with Bandit and Semgrep, catches removed safeguards, triages findings with a local AI model, and suggests fixes that are automatically verified.',
    highlights: [
      'Combines deterministic static analysis (Bandit + Semgrep) with local AI triage so code never leaves the machine.',
      'Automatically verifies suggested security fixes against the diff before surfacing them.',
    ],
    stack: ['PYTHON', 'BANDIT', 'SEMGREP', 'LOCAL LLM', 'GIT DIFF ANALYSIS'],
    repoUrl: 'https://github.com/jvecinadev/vouch',
    askPrompt: 'What is Vouch and how does it use AI for security reviews?',
  },
];

function BrandLogoSlot() {
  const [logoSrc, setLogoSrc] = useState<string>(
    `${import.meta.env.BASE_URL}logo.svg`
  );
  const [triedPng, setTriedPng] = useState<boolean>(false);
  const [logoLoaded, setLogoLoaded] = useState<boolean>(false);
  const [logoFailed, setLogoFailed] = useState<boolean>(false);

  const handleLogoError = () => {
    if (!triedPng) {
      setTriedPng(true);
      setLogoSrc(`${import.meta.env.BASE_URL}logo.png`);
    } else {
      setLogoFailed(true);
    }
  };

  return (
    <div
      title="Brand Mark (frontend/public/logo.svg or logo.png)"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface2"
    >
      {!logoFailed && (
        <img
          src={logoSrc}
          alt="jvecina.dev logo"
          width={40}
          height={40}
          onLoad={() => setLogoLoaded(true)}
          onError={handleLogoError}
          className={`h-full w-full object-contain p-1.5 ${
            logoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {(!logoLoaded || logoFailed) && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="h-5 w-5 text-accent"
        >
          <path
            d="M4 7L9 12L4 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 17H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

function extractTimelineLabel(item: Experience, index: number): string {
  const yearMatch = `${item.title} ${item.summary} ${item.body}`.match(
    /\b(20\d{2}\s*[—–-]\s*(?:Present|20\d{2})|20\d{2})\b/i
  );
  if (yearMatch) {
    return yearMatch[1];
  }
  if (index === 0) {
    return '2025 — Present';
  }
  const createdYear = new Date(item.created_at).getFullYear();
  if (!Number.isNaN(createdYear)) {
    return String(createdYear);
  }
  return `0${index + 1}`;
}

function ExperienceSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-surface p-6 md:grid-cols-12"
        >
          <div className="md:col-span-3">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="md:col-span-9 space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function About() {
  usePageTitle('About');

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [portraitLoaded, setPortraitLoaded] = useState<boolean>(false);
  const [portraitError, setPortraitError] = useState<boolean>(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('ALL');

  const fetchExperience = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Experience[]>('/experience');
      setExperiences(response.data);
    } catch {
      setError('Unable to load experience records from /api/experience.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchExperience();
  }, [fetchExperience]);

  const totalSkillsCount = useMemo(
    () => SKILL_GROUPS.reduce((sum, group) => sum + group.skills.length, 0),
    []
  );

  const visibleSkillGroups = useMemo(() => {
    if (activeSkillCategory === 'ALL') return SKILL_GROUPS;
    return SKILL_GROUPS.filter(
      (group) => group.category === activeSkillCategory
    );
  }, [activeSkillCategory]);

  return (
    <div className="mx-auto max-w-300 px-4 py-12 sm:px-6 sm:py-24 space-y-20 sm:space-y-24">
      {/* 1. Operator Dossier: Bio, Currently & Double-Framed Portrait Card */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Identity Header + Verbatim Bio + Verbatim Currently + Stack Summary */}
        <div className="lg:col-span-7 max-w-[72ch] space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <BrandLogoSlot />
              <div className="space-y-1">
                <SectionLabel index="02" label="ABOUT // ENGINEER PROFILE" />
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-textMuted">
                  <span className="text-accent">
                    FULL-STACK &amp; AI ENGINEER
                  </span>
                  <span className="text-textFaint">·</span>
                  <span>jvecina.dev</span>
                  <span className="text-textFaint">·</span>
                  <span>@jvecinadev</span>
                </div>
              </div>
            </div>

            <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-5xl">
              John Francis Vecina
            </h1>
          </div>

          {/* Verbatim Bio (§3) */}
          <p className="font-sans text-base leading-relaxed text-text sm:text-lg">
            I&apos;m a full-stack developer based in Manila, focused on shipping
            clean, maintainable web applications. I like building systems where
            the UI, API, and database design all feel consistent — good
            validation, predictable error handling, and a smooth user
            experience. Lately I&apos;ve been going deeper into RAG pipelines
            and retrieval systems, because &quot;it works in a demo&quot; and
            &quot;it works in production&quot; are very different problems.
          </p>

          {/* Verbatim Currently Block (§3) — Framed Console Card */}
          <div className="rounded-lg border border-accent/30 bg-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface2/60 px-5 py-2.5 font-mono text-xs">
              <span className="inline-flex items-center gap-2 text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" />
                CURRENTLY
              </span>
              <span className="text-textFaint">ACTIVE FOCUS</span>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
                Building{' '}
                <strong className="font-semibold text-text">Plinth</strong>, a
                multi-tenant SaaS-style app with workspace-based access control,
                caching, and integration tests. Also building this
                portfolio&apos;s RAG agent, which answers questions using only
                my real project content.
              </p>

              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3.5 font-mono text-xs">
                <a
                  href="https://github.com/jvecinadev/plinth"
                  target="_blank"
                  rel="noreferrer"
                  className="text-text underline underline-offset-4 decoration-border transition-colors duration-150 hover:text-accent hover:decoration-accent"
                >
                  github.com/jvecinadev/plinth ↗
                </a>
                <Link
                  to="/chat?q=How%20was%20this%20RAG%20system%20built%3F"
                  className="text-accent underline underline-offset-4 decoration-accent/40 transition-colors duration-150 hover:text-text"
                >
                  How this RAG agent works →
                </Link>
              </div>
            </div>
          </div>

          {/* Background & Stack Summary Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4 space-y-1.5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                BACKGROUND
              </p>
              <p className="font-sans text-xs sm:text-sm leading-relaxed text-textMuted">
                IT student and full-stack developer building production-style
                web applications end to end: UI, REST APIs, database schemas,
                and deployment.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 space-y-1.5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                PRIMARY STACK
              </p>
              <p className="font-sans text-xs sm:text-sm leading-relaxed text-textMuted">
                MERN + TypeScript, with recent work spanning Prisma, MySQL,
                Laravel, PostgreSQL/pgvector, and multi-tenant architecture.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Double-Framed Personal Portrait & Engineer Specification Card */}
        <aside
          aria-label="John Francis Vecina dossier"
          className="lg:col-span-5 rounded-lg border border-border bg-surface p-2"
        >
          <div className="rounded-lg border border-border bg-ink overflow-hidden">
            {/* Top Window Chrome */}
            <div className="flex items-center justify-between border-b border-border bg-surface2/70 px-4 py-2.5 font-mono text-[11px]">
              <span className="text-textMuted">DOSSIER // J.F. VECINA</span>
              <span className="inline-flex items-center gap-1.5 text-text">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                OPEN TO WORK
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-5">
              {/* Portrait Slot (automatically shows frontend/public/portrait.jpg when placed) */}
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border bg-surface2">
                {!portraitError && (
                  <img
                    src={`${import.meta.env.BASE_URL}portrait.jpg`}
                    alt="John Francis Vecina"
                    width={600}
                    height={450}
                    onLoad={() => setPortraitLoaded(true)}
                    onError={() => setPortraitError(true)}
                    className={`h-full w-full object-cover transition-colors duration-150 ${
                      portraitLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}

                {(!portraitLoaded || portraitError) && (
                  <div className="absolute inset-0 flex flex-col justify-between p-4 bg-[radial-gradient(circle,#27272A_1px,transparent_1px)] bg-size-[16px_16px]">
                    <div className="flex items-center justify-between font-mono text-[11px] text-textFaint">
                      <span>[ OPERATOR PORTRAIT ]</span>
                      <span>MNL // UTC+8</span>
                    </div>
                    <div className="my-auto flex flex-col items-center justify-center text-center space-y-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-surface font-mono text-sm font-medium text-accent">
                        JFV
                      </div>
                      <p className="font-sans text-sm font-medium text-text">
                        John Francis Vecina
                      </p>
                      <p className="font-mono text-[11px] text-textFaint">
                        frontend/public/portrait.jpg
                      </p>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-textFaint">
                      <span>@jvecinadev</span>
                      <span>jvecina.dev</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Telemetry & Direct Links */}
              <dl className="divide-y divide-border font-mono text-xs">
                <div className="flex items-center justify-between gap-2 py-2.5">
                  <dt className="text-textFaint">ROLE</dt>
                  <dd className="text-text text-right">
                    Full-stack &amp; AI Engineer
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2 py-2.5">
                  <dt className="text-textFaint">LOCATION</dt>
                  <dd className="text-text text-right">Manila, Philippines</dd>
                </div>
                <div className="flex items-center justify-between gap-2 py-2.5">
                  <dt className="text-textFaint">STATUS</dt>
                  <dd className="text-accent text-right">
                    Open to work — full-stack roles
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2 py-2.5">
                  <dt className="text-textFaint">GITHUB</dt>
                  <dd className="text-right">
                    <a
                      href="https://github.com/jvecinadev"
                      target="_blank"
                      rel="noreferrer"
                      className="text-text underline underline-offset-4 transition-colors duration-150 hover:text-accent"
                    >
                      github.com/jvecinadev ↗
                    </a>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2 py-2.5">
                  <dt className="text-textFaint">PREVIOUS SITE</dt>
                  <dd className="text-right">
                    <a
                      href="https://jvecina-dev.vercel.app/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-textMuted underline underline-offset-4 transition-colors duration-150 hover:text-text"
                    >
                      jvecina-dev.vercel.app ↗
                    </a>
                  </dd>
                </div>
              </dl>

              {/* Quick Dossier Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Button
                  variant="primary"
                  to="/chat?q=What%20is%20your%20background%20and%20primary%20tech%20stack%3F"
                  className="w-full text-xs"
                >
                  Interview AI →
                </Button>
                <Button
                  variant="ghost"
                  href="/resume.pdf"
                  className="w-full text-xs"
                >
                  resume.pdf ↗
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* 2. Engineering Themes — "How I Build" (§3 — all 5 themes with direct RAG query links) */}
      <section className="border-t border-border pt-14 sm:pt-20 space-y-8">
        <div className="max-w-[72ch] space-y-2">
          <SectionLabel label="ENGINEERING THEMES // HOW I BUILD" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Architectural defaults across every system
          </h2>
          <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
            Consistent validation, tenant boundaries, and automated verification
            from the database schema up to the client.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ENGINEERING_THEMES.map((theme) => (
            <div
              key={theme.id}
              className={`flex flex-col justify-between rounded-lg border p-5 sm:p-6 space-y-5 transition-colors duration-150 hover:border-accent/40 ${
                theme.featured
                  ? 'md:col-span-2 lg:col-span-2 border-accent/30 bg-surface'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 font-mono text-xs">
                  <span className="text-accent">PRINCIPLE // {theme.id}</span>
                  <span className="text-textFaint">{theme.proof}</span>
                </div>
                <h3 className="font-sans text-lg font-semibold text-text">
                  {theme.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-textMuted">
                  {theme.detail}
                </p>
              </div>

              <div className="border-t border-border pt-3.5">
                <Link
                  to={`/chat?q=${encodeURIComponent(theme.askPrompt)}`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-textMuted transition-colors duration-150 hover:text-accent"
                >
                  <span>Ask how I implement this</span>
                  <span className="text-accent">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Skills Inventory (§3 — 7 groups, mono chips, interactive category filter) */}
      <section className="border-t border-border pt-14 sm:pt-20 space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[72ch] space-y-2">
            <SectionLabel label="SKILLS INVENTORY" />
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Production Stack &amp; Tooling
            </h2>
          </div>

          {/* Clean Category Filter Strip */}
          <div
            role="tablist"
            aria-label="Filter skills by category"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeSkillCategory === 'ALL'}
              onClick={() => setActiveSkillCategory('ALL')}
              className={`shrink-0 cursor-pointer rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                activeSkillCategory === 'ALL'
                  ? 'border-accent bg-accent/10 text-text'
                  : 'border-border bg-surface text-textMuted hover:text-text'
              }`}
            >
              ALL ({totalSkillsCount})
            </button>
            {SKILL_GROUPS.map((group) => {
              const isSelected = activeSkillCategory === group.category;
              return (
                <button
                  key={group.category}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveSkillCategory(group.category)}
                  className={`shrink-0 cursor-pointer rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                    isSelected
                      ? 'border-accent bg-accent/10 text-text'
                      : 'border-border bg-surface text-textMuted hover:text-text'
                  }`}
                >
                  {group.category.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {visibleSkillGroups.map((group) => (
            <div
              key={group.category}
              className={`rounded-lg border p-5 sm:p-6 space-y-4 ${
                group.featured
                  ? 'md:col-span-2 border-accent/40 bg-surface'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-accent">
                    {group.id}
                  </span>
                  <h3 className="font-sans text-base font-semibold text-text">
                    {group.category}
                  </h3>
                </div>
                <span
                  className={`font-mono text-xs ${
                    group.featured ? 'text-accent' : 'text-textFaint'
                  }`}
                >
                  {group.code}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Tag key={skill} highlight={Boolean(group.featured)}>
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Experience & Systems Architecture Ledger */}
      <section className="border-t border-border pt-14 sm:pt-20 space-y-12">
        <div className="max-w-[72ch] space-y-2">
          <SectionLabel label="EXPERIENCE & SYSTEMS LEDGER" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            What I&apos;ve Built &amp; Shipped
          </h2>
          <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
            Experience records from the portfolio API alongside architectural
            summaries of my core repositories.
          </p>
        </div>

        {/* Live /api/experience feed */}
        {loading && <ExperienceSkeleton />}

        {!loading && error && (
          <ErrorState
            label="EXPERIENCE API ERROR"
            message={error}
            onRetry={() => void fetchExperience()}
          />
        )}

        {!loading && !error && experiences.length > 0 && (
          <div className="space-y-4">
            <p className="font-mono text-xs text-textFaint">
              INDEXED EXPERIENCE RECORDS (/API/EXPERIENCE)
            </p>
            {experiences.map((item, idx) => (
              <article
                key={item.id}
                className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-surface p-5 sm:p-6 md:grid-cols-12"
              >
                <div className="md:col-span-3 font-mono text-xs text-accent pt-1">
                  {extractTimelineLabel(item, idx)}
                </div>

                <div className="md:col-span-9 space-y-3 max-w-[72ch]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-sans text-lg font-semibold text-text">
                      {item.title}
                    </h3>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-textMuted underline underline-offset-4 transition-colors duration-150 hover:text-accent"
                      >
                        LINK ↗
                      </a>
                    )}
                  </div>

                  <p className="font-sans text-sm leading-relaxed text-textMuted">
                    {item.summary}
                  </p>

                  {item.body && item.body !== item.summary && (
                    <p className="font-sans text-sm leading-relaxed text-textMuted">
                      {item.body}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Real Engineering Systems Matrix (Plinth, Bantay PH, Alaala Collections, Vouch) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-xs text-textFaint">
              SELECTED ENGINEERING SYSTEMS &amp; AI TOOLING
            </p>
            <Link
              to="/work"
              className="font-mono text-xs text-textMuted transition-colors duration-150 hover:text-accent"
            >
              OPEN WORK ARCHIVE →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {SHIPPED_SYSTEMS.map((sys) => (
              <article
                key={sys.name}
                className="flex flex-col justify-between rounded-lg border border-border bg-surface overflow-hidden transition-colors duration-150 hover:border-accent/40"
              >
                <div>
                  {/* Top System Chrome Bar */}
                  <div className="flex items-center justify-between gap-2 border-b border-border bg-surface2/60 px-5 py-2.5 font-mono text-xs">
                    <span className="text-textFaint">{sys.code}</span>
                    <span className="inline-flex items-center gap-1.5 text-accent">
                      {sys.isLive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      )}
                      {sys.status}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-sans text-xl font-semibold text-text">
                        {sys.caseStudySlug ? (
                          <Link
                            to={`/work/${sys.caseStudySlug}`}
                            className="transition-colors duration-150 hover:text-accent"
                          >
                            {sys.name}
                          </Link>
                        ) : (
                          sys.name
                        )}
                      </h3>
                      <p className="font-sans text-sm leading-relaxed text-textMuted">
                        {sys.summary}
                      </p>
                    </div>

                    <ul className="space-y-2 border-t border-border pt-4">
                      {sys.highlights.map((bullet, idx) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2.5 font-sans text-xs sm:text-sm leading-relaxed text-textMuted"
                        >
                          <span className="font-mono text-xs text-accent shrink-0 pt-0.5">
                            0{idx + 1}
                          </span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {sys.stack.map((tech) => (
                      <Tag key={tech}>{tech}</Tag>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 font-mono text-xs">
                    <div className="flex items-center gap-4">
                      {sys.caseStudySlug && (
                        <Link
                          to={`/work/${sys.caseStudySlug}`}
                          className="font-medium text-text transition-colors duration-150 hover:text-accent"
                        >
                          CASE STUDY →
                        </Link>
                      )}
                      <Link
                        to={`/chat?q=${encodeURIComponent(sys.askPrompt)}`}
                        className="text-textMuted transition-colors duration-150 hover:text-accent"
                      >
                        ASK AGENT →
                      </Link>
                    </div>

                    <div className="flex items-center gap-4 text-textFaint">
                      {sys.liveUrl && (
                        <a
                          href={sys.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent transition-colors duration-150 hover:text-text"
                        >
                          LIVE ↗
                        </a>
                      )}
                      <a
                        href={sys.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors duration-150 hover:text-text"
                      >
                        REPO ↗
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Closing Line before Footer (Mandatory Entry Point #5 from §4) */}
      <section className="border-t border-border pt-12">
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-surface p-6 sm:flex-row sm:items-center">
          <p className="font-mono text-sm text-text">
            <Link
              to="/chat"
              className="transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
            >
              Or just ask me — I answer from my own content. →
            </Link>
          </p>

          <Button variant="primary" to="/chat" className="w-full sm:w-auto">
            Open RAG Agent →
          </Button>
        </div>
      </section>
    </div>
  );
}