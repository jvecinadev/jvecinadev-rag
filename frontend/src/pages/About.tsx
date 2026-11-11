import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Experience } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { SectionLabel } from '../components/SectionLabel';
import { Tag } from '../components/Tag';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

interface SkillGroup {
  category: string;
  code: string;
  featured?: boolean;
  skills: readonly string[];
}

const SKILL_GROUPS: readonly SkillGroup[] = [
  {
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
    category: 'Frontend',
    code: 'UI & CLIENT ARCHITECTURE',
    skills: ['REACT', 'TYPESCRIPT', 'JAVASCRIPT', 'TAILWIND', 'VITE'],
  },
  {
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
    category: 'Data & caching',
    code: 'STORAGE & VECTOR INDEXING',
    skills: ['MONGODB', 'POSTGRESQL', 'REDIS', 'PGVECTOR'],
  },
  {
    category: 'Quality & infrastructure',
    code: 'VERIFICATION & CONTAINERS',
    skills: ['JEST', 'SUPERTEST', 'DOCKER', 'GITHUB ACTIONS'],
  },
  {
    category: 'Workflow',
    code: 'TOOLING & COLLABORATION',
    skills: ['GIT', 'GITHUB', 'POSTMAN', 'FIGMA'],
  },
  {
    category: 'Deployment',
    code: 'CLOUD & HOSTING',
    skills: ['VERCEL', 'RENDER', 'MONGODB ATLAS'],
  },
];

interface EngineeringTheme {
  id: string;
  title: string;
  detail: string;
}

const ENGINEERING_THEMES: readonly EngineeringTheme[] = [
  {
    id: '01',
    title: 'Auth flows',
    detail: 'JWT via httpOnly cookies, protected routes.',
  },
  {
    id: '02',
    title: 'Validation-first APIs',
    detail: 'Zod schemas, consistent error responses.',
  },
  {
    id: '03',
    title: 'Testing mindset',
    detail: 'Jest / Supertest where reliability matters.',
  },
  {
    id: '04',
    title: 'Deployment-ready',
    detail: 'Docker, CI basics, environment config.',
  },
];

interface FallbackTimelineItem {
  period: string;
  title: string;
  summary: string;
  tags: readonly string[];
}

const FALLBACK_TIMELINE: readonly FallbackTimelineItem[] = [
  {
    period: '2025 — Present',
    title: 'Full-stack Developer · Plinth / freelance',
    summary:
      'Building multi-tenant web applications, REST APIs, and grounded RAG retrieval systems.',
    tags: ['REACT', 'TYPESCRIPT', 'LARAVEL', 'POSTGRESQL', 'PGVECTOR'],
  },
  {
    period: '2024 — 2025',
    title: '[ROLE] · [COMPANY — replace]',
    summary: '[one-line summary needed — replace before ship]',
    tags: ['REACT', 'NODE.JS', 'EXPRESS', 'MONGODB'],
  },
  {
    period: '2023 — 2024',
    title: '[ROLE] · [COMPANY — replace]',
    summary: '[one-line summary needed — replace before ship]',
    tags: ['JAVASCRIPT', 'REST', 'GIT'],
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
    <div aria-hidden="true" className="space-y-6">
      {[0, 1, 2].map((item) => (
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
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
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
      setError('Unable to load experience timeline right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchExperience();
  }, [fetchExperience]);

  return (
    <div className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24 space-y-20">
      {/* 1. Bio + Currently + Operator Portrait */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7 max-w-[72ch] space-y-8">
          <div className="space-y-3">
            <SectionLabel index="02" label="ABOUT" />
            <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              John Francis Vecina
            </h1>
            <p className="font-mono text-xs text-textMuted">
              FULL-STACK &amp; AI ENGINEER · MANILA, PHILIPPINES
            </p>
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
          <div className="rounded-lg border border-accent/30 bg-surface p-6 space-y-2.5">
            <div className="flex items-center gap-2 font-mono text-xs text-accent">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>CURRENTLY</span>
            </div>
            <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
              Building <strong className="font-semibold text-text">Plinth</strong>
              , a multi-tenant SaaS-style app with workspace-based access
              control, caching, and integration tests. Also building this
              portfolio&apos;s RAG agent, which answers questions using only my
              real project content.
            </p>
          </div>
        </div>

        {/* Right Column: Personal Portrait & Quick Specs */}
        <aside
          aria-label="Engineer profile card"
          className="lg:col-span-5 rounded-lg border border-border bg-surface p-5 space-y-5"
        >
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
                  <span>ID // JFV-MNL</span>
                  <span>PORTRAIT SLOT</span>
                </div>
                <div className="my-auto flex flex-col items-center justify-center text-center space-y-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-surface font-mono text-sm font-medium text-text">
                    JFV
                  </div>
                  <p className="font-mono text-xs text-textFaint">
                    frontend/public/portrait.jpg
                  </p>
                </div>
                <div className="flex items-center justify-between font-mono text-xs text-textFaint">
                  <span>MANILA, PH</span>
                  <span>OPEN TO WORK</span>
                </div>
              </div>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 font-mono text-xs">
            <div className="space-y-1">
              <dt className="text-textFaint">LOCATION</dt>
              <dd className="text-text">Manila, Philippines</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-textFaint">STATUS</dt>
              <dd className="inline-flex items-center gap-1.5 text-text">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Open to work
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-textFaint">FOCUS</dt>
              <dd className="text-textMuted">MERN · Laravel · RAG</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-textFaint">DIRECT</dt>
              <dd>
                <a
                  href="mailto:contact@jvecina.dev"
                  className="text-text underline underline-offset-4 transition-colors duration-150 hover:text-accent"
                >
                  contact@jvecina.dev
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      {/* 2. How I Build — Engineering Themes (§3) */}
      <section className="border-t border-border pt-16 space-y-8">
        <div className="max-w-[72ch] space-y-2">
          <SectionLabel label="ENGINEERING THEMES // HOW I BUILD" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
             architectural defaults across every project
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ENGINEERING_THEMES.map((theme) => (
            <div
              key={theme.id}
              className="rounded-lg border border-border bg-surface p-5 space-y-3"
            >
              <span className="font-mono text-xs text-accent">{theme.id}</span>
              <h3 className="font-sans text-base font-semibold text-text">
                {theme.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-textMuted">
                {theme.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Experience Timeline (from /api/experience with §3 fallback) */}
      <section className="border-t border-border pt-16 space-y-8">
        <div className="max-w-[72ch] space-y-2">
          <SectionLabel label="EXPERIENCE & BACKGROUND" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
            Timeline
          </h2>
        </div>

        {loading && <ExperienceSkeleton />}

        {!loading && error && (
          <ErrorState
            label="EXPERIENCE UNAVAILABLE"
            message={error}
            onRetry={() => void fetchExperience()}
          />
        )}

        {!loading && !error && experiences.length > 0 && (
          <div className="space-y-6">
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

        {!loading && !error && experiences.length === 0 && (
          <div className="space-y-6">
            {FALLBACK_TIMELINE.map((item) => (
              <article
                key={item.period}
                className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-surface p-6 md:grid-cols-12"
              >
                <div className="md:col-span-3 font-mono text-xs text-textFaint pt-1">
                  {item.period}
                </div>
                <div className="md:col-span-9 space-y-3 max-w-[72ch]">
                  <h3 className="font-sans text-lg font-semibold text-text">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-textMuted">
                    {item.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {item.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. Skills Inventory (§3 — mono chips, AI / RAG group visually featured) */}
      <section className="border-t border-border pt-16 space-y-8">
        <div className="max-w-[72ch] space-y-2">
          <SectionLabel label="SKILLS INVENTORY" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text">
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
                <h3 className="font-sans text-base font-semibold text-text">
                  {group.category}
                </h3>
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

      {/* 5. Closing Line before Footer (Mandatory Entry Point #5 from §4) */}
      <section className="border-t border-border pt-12">
        <p className="font-mono text-sm text-textMuted">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
          >
            <span>Or just ask me — I answer from my own content. →</span>
          </Link>
        </p>
      </section>
    </div>
  );
}