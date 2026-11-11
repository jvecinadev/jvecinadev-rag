import { useCallback, useEffect, useState } from 'react';
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
  featured?: boolean;
}

const ENGINEERING_THEMES: readonly EngineeringTheme[] = [
  {
    id: '01',
    title: 'Tenant isolation & RBAC',
    detail:
      'Database-driven role-to-permission mapping resolved per request and workspace-based tenancy.',
    proof: 'IN USE // PLINTH & BANTAY PH',
    featured: true,
  },
  {
    id: '02',
    title: 'Auth flows',
    detail: 'JWT via httpOnly cookies, protected routes, and role middleware.',
    proof: 'IN USE // PLINTH & ALAALA COLLECTIONS',
  },
  {
    id: '03',
    title: 'Validation-first APIs',
    detail: 'Zod schemas on every route with consistent error responses.',
    proof: 'IN USE // PLINTH & BANTAY PH',
  },
  {
    id: '04',
    title: 'Testing mindset',
    detail:
      'Jest / Supertest integration suites covering tenant isolation and state transitions.',
    proof: 'IN USE // PLINTH',
  },
  {
    id: '05',
    title: 'Deployment-ready',
    detail:
      'Dockerized services, GitHub Actions CI pipelines on push, and strict environment config.',
    proof: 'IN USE // PLINTH & ALAALA COLLECTIONS',
  },
];

interface SystemLogItem {
  code: string;
  name: string;
  status: string;
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
    askPrompt:
      'What is Alaala Collections and what tech stack does it use?',
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

  return (
    <div className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24 space-y-24">
      {/* 1. Operator Dossier: Bio, Currently & Personal Portrait */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Verbatim Bio + Currently + Background */}
        <div className="lg:col-span-7 max-w-[72ch] space-y-8">
          <div className="space-y-3">
            <SectionLabel index="02" label="ABOUT" />
            <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-5xl">
              John Francis Vecina
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-textMuted">
              <span className="text-accent">FULL-STACK &amp; AI ENGINEER</span>
              <span className="text-textFaint">·</span>
              <span>jvecina.dev</span>
              <span className="text-textFaint">·</span>
              <span>@jvecinadev</span>
            </div>
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

          {/* Verbatim Currently Block (§3) */}
          <div className="rounded-lg border border-accent/30 bg-surface p-6 space-y-3">
            <div className="flex items-center justify-between gap-2 font-mono text-xs">
              <span className="inline-flex items-center gap-2 text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" />
                CURRENTLY
              </span>
              <span className="text-textFaint">ACTIVE FOCUS</span>
            </div>
            <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
              Building <strong className="font-semibold text-text">Plinth</strong>
              , a multi-tenant SaaS-style app with workspace-based access
              control, caching, and integration tests. Also building this
              portfolio&apos;s RAG agent, which answers questions using only my
              real project content.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs">
              <a
                href="https://github.com/jvecinadev/plinth"
                target="_blank"
                rel="noreferrer"
                className="text-text underline underline-offset-4 transition-colors duration-150 hover:text-accent"
              >
                github.com/jvecinadev/plinth ↗
              </a>
              <Link
                to="/chat?q=How%20was%20this%20RAG%20system%20built%3F"
                className="text-textMuted underline underline-offset-4 transition-colors duration-150 hover:text-text"
              >
                How this RAG agent works →
              </Link>
            </div>
          </div>

          {/* Background & Stack Summary Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4 space-y-1.5">
              <p className="font-mono text-xs text-textFaint">BACKGROUND</p>
              <p className="font-sans text-xs leading-relaxed text-textMuted">
                IT student and full-stack developer building production-style
                web applications end to end: UI, REST APIs, database schemas,
                and deployment.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 space-y-1.5">
              <p className="font-mono text-xs text-textFaint">PRIMARY STACK</p>
              <p className="font-sans text-xs leading-relaxed text-textMuted">
                MERN + TypeScript, with recent work spanning Prisma, MySQL,
                Laravel, PostgreSQL/pgvector, and multi-tenant architecture.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Portrait & Engineer Specification Card */}
        <aside
          aria-label="John Francis Vecina dossier"
          className="lg:col-span-5 rounded-lg border border-border bg-surface p-5 space-y-5"
        >
          <div className="flex items-center justify-between font-mono text-xs text-textFaint">
            <span>DOSSIER // J.F. VECINA</span>
            <span className="inline-flex items-center gap-1.5 text-text">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              OPEN TO WORK
            </span>
          </div>

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
                <div className="flex items-center justify-between font-mono text-xs text-textFaint">
                  <span>[ OPERATOR PORTRAIT ]</span>
                  <span>MNL // UTC+8</span>
                </div>
                <div className="my-auto flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-surface font-mono text-sm font-medium text-text">
                    JFV
                  </div>
                  <p className="font-sans text-sm font-medium text-text">
                    John Francis Vecina
                  </p>
                  <p className="font-mono text-xs text-textFaint">
                    Place photo at: frontend/public/portrait.jpg
                  </p>
                </div>
                <div className="flex items-center justify-between font-mono text-xs text-textFaint">
                  <span>@jvecinadev</span>
                  <span>jvecina.dev</span>
                </div>
              </div>
            )}
          </div>

          {/* Telemetry & Direct Links */}
          <dl className="divide-y divide-border font-mono text-xs">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-textFaint">ROLE</dt>
              <dd className="text-text">Full-stack &amp; AI Engineer</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-textFaint">LOCATION</dt>
              <dd className="text-text">Manila, Philippines</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-textFaint">STATUS</dt>
              <dd className="text-accent">Open to work — full-stack roles</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-textFaint">GITHUB</dt>
              <dd>
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
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-textFaint">PREVIOUS SITE</dt>
              <dd>
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
        </aside>
      </section>

      {/* 2. Engineering Themes — "How I Build" (§3 — all 5 themes) */}
      <section className="border-t border-border pt-16 space-y-8">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ENGINEERING_THEMES.map((theme) => (
            <div
              key={theme.id}
              className={`flex flex-col justify-between rounded-lg border p-6 space-y-4 ${
                theme.featured
                  ? 'md:col-span-2 lg:col-span-2 border-accent/30 bg-surface'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-accent">{theme.id}</span>
                  <span className="text-textFaint">{theme.proof}</span>
                </div>
                <h3 className="font-sans text-lg font-semibold text-text">
                  {theme.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-textMuted">
                  {theme.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Skills Inventory (§3 — 7 groups, mono chips, AI / RAG visually prominent) */}
      <section className="border-t border-border pt-16 space-y-8">
        <div className="max-w-[72ch] space-y-2">
          <SectionLabel label="SKILLS INVENTORY" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Production Stack &amp; Tooling
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {SKILL_GROUPS.map((group) => (
            <div
              key={group.category}
              className={`rounded-lg border p-6 space-y-4 ${
                group.featured
                  ? 'md:col-span-2 border-accent/40 bg-surface'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-textFaint">
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
      <section className="border-t border-border pt-16 space-y-12">
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
                className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-surface p-6 md:grid-cols-12"
              >
                <div className="md:col-span-3 font-mono text-xs text-textFaint pt-1">
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
          <p className="font-mono text-xs text-textFaint">
            SELECTED ENGINEERING SYSTEMS &amp; AI TOOLING
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {SHIPPED_SYSTEMS.map((sys) => (
              <article
                key={sys.name}
                className="flex flex-col justify-between rounded-lg border border-border bg-surface p-6 space-y-6 transition-colors duration-150 hover:bg-surface2"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span className="text-textFaint">{sys.code}</span>
                    <span className="text-accent">{sys.status}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-sans text-xl font-semibold text-text">
                      {sys.name}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-textMuted">
                      {sys.summary}
                    </p>
                  </div>

                  <ul className="space-y-2 border-t border-border pt-4">
                    {sys.highlights.map((bullet, idx) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 font-sans text-xs leading-relaxed text-textMuted"
                      >
                        <span className="font-mono text-xs text-textFaint">
                          0{idx + 1}
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {sys.stack.map((tech) => (
                      <Tag key={tech}>{tech}</Tag>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 font-mono text-xs">
                    <Link
                      to={`/chat?q=${encodeURIComponent(sys.askPrompt)}`}
                      className="text-text transition-colors duration-150 hover:text-accent"
                    >
                      ASK AGENT →
                    </Link>

                    <div className="flex items-center gap-4 text-textFaint">
                      {sys.liveUrl && (
                        <a
                          href={sys.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors duration-150 hover:text-text"
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

          <Button variant="primary" to="/chat">
            Open RAG Agent →
          </Button>
        </div>
      </section>
    </div>
  );
}