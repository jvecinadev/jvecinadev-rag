import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Experience } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { Button } from '../components/Button';
import { SectionLabel } from '../components/SectionLabel';
import { Tag } from '../components/Tag';

interface CareerItem {
  role: string;
  organization: string;
  location: string;
  period: string;
  badge: string;
  bullets: readonly string[];
}

const EXPERIENCE_TIMELINE: readonly CareerItem[] = [
  {
    role: 'Backend AI Engineer Intern',
    organization: 'FlyRank AI',
    location: 'Remote',
    period: 'Aug 2026 to Present',
    badge: 'Current',
    bullets: [
      'Building RAG pipelines and LLM-backed backend services for production AI features using Python, FastAPI, and pgvector.',
      'Designing grounded retrieval and API layers that keep AI outputs deterministic, citable, and testable in production.',
    ],
  },
  {
    role: 'Freelance Software Developer',
    organization: 'Self-Employed',
    location: 'Valenzuela, PH',
    period: 'Aug 2025 to Present',
    badge: 'Active',
    bullets: [
      'Delivered full-stack web applications for small businesses, including multi-tenant SaaS platforms, admin dashboards, and RBAC-protected CRUD systems.',
      'Owned the full delivery lifecycle: requirements gathering, database and API architecture, frontend build, and cloud deployment.',
    ],
  },
] as const;

interface EngineeringPrinciple {
  number: string;
  title: string;
  description: string;
  appliedIn: string;
  askPrompt: string;
}

const ENGINEERING_PRINCIPLES: readonly EngineeringPrinciple[] = [
  {
    number: '01',
    title: 'Query-Level Tenant Isolation & RBAC',
    description:
      'Multi-tenant boundaries are enforced directly in database queries rather than UI checks alone. Permissions are resolved per request so role updates take effect immediately without stale JWT claims.',
    appliedIn: 'Plinth · Bantay PH',
    askPrompt:
      'How do you implement tenant isolation and RBAC in Plinth and Bantay PH?',
  },
  {
    number: '02',
    title: 'Schema Validation & Transactional Integrity',
    description:
      'Every mutating API route validates inputs through strict Zod or Pydantic schemas before touching business logic. Multi-step state transitions run inside database transactions with audit logs.',
    appliedIn: 'Bantay PH · Plinth',
    askPrompt:
      'How do you handle schema validation and transactional state transitions?',
  },
  {
    number: '03',
    title: 'Grounded AI & Deterministic Verification',
    description:
      'AI features are paired with vector similarity thresholds, source citations, or static analysis checks so the system never guesses silently when confidence is low.',
    appliedIn: 'FlyRank AI · Vouch · jvecina.dev',
    askPrompt:
      'How do you keep RAG and AI outputs reliable and grounded in production?',
  },
  {
    number: '04',
    title: 'Integration Testing & Containerized Delivery',
    description:
      'Critical paths like workspace isolation, authentication, and permission boundaries are backed by Jest and Supertest suites, containerized with Docker, and verified in CI.',
    appliedIn: 'Plinth · Vouch',
    askPrompt:
      'How do you approach integration testing, Docker, and CI across your projects?',
  },
] as const;

interface StackGroup {
  category: string;
  subtitle: string;
  skills: readonly string[];
}

const MASTER_STACK: readonly StackGroup[] = [
  {
    category: 'Frontend & State',
    subtitle: 'Type-safe interfaces & client state management',
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
    subtitle: 'API design, authentication & schema enforcement',
    skills: [
      'Node.js',
      'Express 5',
      'Python',
      'FastAPI',
      'Laravel',
      'Zod',
      'Pydantic',
      'REST APIs',
      'JWT / httpOnly Cookies',
    ],
  },
  {
    category: 'Data, ORM & Vector Stores',
    subtitle: 'Relational modeling, caching & similarity search',
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
    subtitle: 'LLM integration, static analysis & deployment',
    skills: [
      'Gemini API',
      'Claude',
      'OpenAI',
      'DeepSeek',
      'Ollama',
      'Jest',
      'Supertest',
      'pytest',
      'Docker',
      'GitHub Actions',
      'Git',
      'Linux',
      'Vercel',
    ],
  },
] as const;

export default function About() {
  usePageTitle('About');

  const [apiExperiences, setApiExperiences] = useState<Experience[]>([]);
  const [portraitLoaded, setPortraitLoaded] = useState<boolean>(false);
  const [portraitError, setPortraitError] = useState<boolean>(false);

  useEffect(() => {
    api
      .get<Experience[]>('/experience')
      .then((res) => setApiExperiences(res.data))
      .catch(() => {
        // Fallback to structured timeline if offline
      });
  }, []);

  return (
    <div className="mx-auto max-w-300 px-4 py-12 sm:px-6 sm:py-20 space-y-16 sm:space-y-20">
      {/* 1. PROFILE HERO & SUMMARY CARD */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
        {/* Left Column: Bio & Background */}
        <div className="flex flex-col justify-between lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <SectionLabel index="02" label="ABOUT" />

            <div className="space-y-2">
              <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-4xl lg:text-[42px] sm:leading-[1.12]">
                John Francis Vecina
              </h1>
              <p className="font-mono text-xs uppercase tracking-wider text-accent">
                Full Stack Developer &nbsp;·&nbsp; Backend AI Engineer
              </p>
            </div>

            <div className="space-y-4 pt-1 font-sans text-base leading-relaxed text-textMuted">
              <p className="text-text">
                I am a full-stack developer specializing in backend systems and
                AI integration. I build production-grade applications including
                multi-tenant SaaS platforms, civic governance systems, and AI
                security tooling, with a strict focus on security, correctness,
                and clean architecture.
              </p>
              <p>
                As an Information Technology student at Pamantasan ng Lungsod ng
                Valenzuela and a Backend AI Engineer Intern at FlyRank AI, I
                take on select freelance builds and engineering work where the
                goal is not just &ldquo;it works in a demo&rdquo; but &ldquo;it
                holds up under real-world conditions.&rdquo;
              </p>
            </div>
          </div>

          {/* Current Focus Box */}
          <div className="rounded-lg border border-border bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-medium text-text">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                Current Focus
              </span>
              <span className="font-mono text-xs text-textFaint">
                FlyRank AI &amp; Plinth
              </span>
            </div>

            <p className="font-sans text-sm leading-relaxed text-textMuted">
              Engineering RAG pipelines and FastAPI + pgvector services at{' '}
              <strong className="font-medium text-text">FlyRank AI</strong>,
              while expanding{' '}
              <strong className="font-medium text-text">Plinth</strong> with
              workspace-scoped access control, Redis caching, and integration
              test suites.
            </p>
          </div>
        </div>

        {/* Right Column: Clean Profile & Quick-Access Card */}
        <aside
          aria-label="Profile overview and contact links"
          className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5 sm:p-6 lg:col-span-5 space-y-6"
        >
          <div className="space-y-5">
            {/* Compact Identity Header with Optional Portrait */}
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface2">
                {!portraitError && (
                  <img
                    src={`${import.meta.env.BASE_URL}portrait.jpg`}
                    alt="John Francis Vecina"
                    width={64}
                    height={64}
                    onLoad={() => setPortraitLoaded(true)}
                    onError={() => setPortraitError(true)}
                    className={`h-full w-full object-cover ${
                      portraitLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
                {(!portraitLoaded || portraitError) && (
                  <div className="flex h-full w-full items-center justify-center font-mono text-sm font-semibold text-accent">
                    JFV
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="font-sans text-lg font-semibold text-text truncate">
                  John Francis Vecina
                </h2>
                <p className="font-mono text-xs text-textMuted truncate">
                  Valenzuela, Philippines (UTC+8)
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Open to Roles &amp; Freelance
                </p>
              </div>
            </div>

            {/* Clean Key-Value Details */}
            <dl className="divide-y divide-border border-t border-b border-border font-sans text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="font-mono text-xs text-textFaint">Role</dt>
                <dd className="font-medium text-text text-right">
                  Full Stack &amp; Backend AI
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="font-mono text-xs text-textFaint">Internship</dt>
                <dd className="text-text text-right">FlyRank AI (Remote)</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="font-mono text-xs text-textFaint">Education</dt>
                <dd className="text-text text-right">BSIT, PLV</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="font-mono text-xs text-textFaint">Email</dt>
                <dd className="text-right">
                  <a
                    href="mailto:johnvecina640@gmail.com"
                    className="font-mono text-xs text-text underline underline-offset-4 decoration-border transition-colors duration-150 hover:text-accent"
                  >
                    johnvecina640@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Symmetrical Action Buttons */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="primary"
                href="mailto:johnvecina640@gmail.com?subject=Inquiry%20from%20jvecina.dev"
                className="w-full"
              >
                Email Me
              </Button>
              <Button
                variant="ghost"
                href={`${import.meta.env.BASE_URL}resume.pdf`}
                className="w-full"
              >
                Resume PDF ↗
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="ghost"
                href="https://github.com/jvecinadev"
                className="w-full"
              >
                GitHub ↗
              </Button>
              <Button
                variant="ghost"
                href="https://www.linkedin.com/in/jvecinadev/"
                className="w-full"
              >
                LinkedIn ↗
              </Button>
            </div>
          </div>
        </aside>
      </section>

      {/* 2. EXPERIENCE & EDUCATION */}
      <section className="border-t border-border pt-14 sm:pt-16 space-y-8">
        <div className="max-w-[64ch] space-y-2">
          <SectionLabel label="EXPERIENCE & EDUCATION" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Professional background and academic foundation.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Experience Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {EXPERIENCE_TIMELINE.map((item) => (
              <article
                key={item.role + item.organization}
                className="rounded-lg border border-border bg-surface p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-sans text-lg font-semibold text-text">
                        {item.role}
                      </h3>
                      <span className="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[11px] text-accent">
                        {item.badge}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-textMuted">
                      {item.organization} · {item.location}
                    </p>
                  </div>

                  <span className="rounded border border-border bg-ink px-2.5 py-1 font-mono text-xs text-textMuted">
                    {item.period}
                  </span>
                </div>

                <ul className="space-y-2.5 border-t border-border pt-4">
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 font-sans text-sm leading-relaxed text-textMuted"
                    >
                      <span className="font-mono text-xs text-accent pt-1">
                        →
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}

            {/* Additional API Experience Records (if any beyond the primary two) */}
            {apiExperiences.length > 0 &&
              apiExperiences
                .filter(
                  (rec) =>
                    !rec.title.toLowerCase().includes('flyrank') &&
                    !rec.title.toLowerCase().includes('freelance')
                )
                .map((rec) => (
                  <article
                    key={rec.id}
                    className="rounded-lg border border-border bg-surface p-5 sm:p-6 space-y-2"
                  >
                    <h3 className="font-sans text-base font-semibold text-text">
                      {rec.title}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-textMuted">
                      {rec.summary}
                    </p>
                  </article>
                ))}
          </div>

          {/* Education & Availability Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            <div className="rounded-lg border border-border bg-surface p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-wider text-accent">
                  Education
                </p>
                <h3 className="font-sans text-lg font-semibold text-text">
                  Pamantasan ng Lungsod ng Valenzuela
                </h3>
                <p className="font-mono text-xs text-textMuted">
                  Present · Valenzuela, PH
                </p>
              </div>

              <div className="border-t border-border pt-3.5 space-y-2">
                <p className="font-sans text-sm font-medium text-text">
                  Bachelor of Science in Information Technology
                </p>
                <p className="font-sans text-xs leading-relaxed text-textMuted">
                  Specialization in Web Development, relational database design,
                  software engineering, and full-stack application architecture.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-wider text-accent">
                  For Recruiters &amp; Clients
                </p>
                <h3 className="font-sans text-base font-semibold text-text">
                  What I am open to right now
                </h3>
              </div>

              <ul className="space-y-2 border-t border-border pt-3.5 font-sans text-xs sm:text-sm text-textMuted">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-accent">•</span>
                  <span>Full-Stack or Backend Engineer roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-accent">•</span>
                  <span>AI / RAG Backend engineering roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-accent">•</span>
                  <span>Remote or Philippines-based teams</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-accent">•</span>
                  <span>Select freelance web and AI builds</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ENGINEERING STANDARDS (Symmetrical 2x2 Grid) */}
      <section className="border-t border-border pt-14 sm:pt-16 space-y-8">
        <div className="max-w-[64ch] space-y-2">
          <SectionLabel label="HOW I BUILD" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Architectural principles across every repository.
          </h2>
          <p className="font-sans text-sm leading-relaxed text-textMuted sm:text-base">
            Every system is designed around strict access control, schema
            validation, and verifiable outputs rather than happy-path demos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {ENGINEERING_PRINCIPLES.map((principle) => (
            <div
              key={principle.number}
              className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5 sm:p-6 space-y-5 transition-colors duration-150 hover:border-textFaint"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 font-mono text-xs">
                  <span className="text-accent">{principle.number}</span>
                  <span className="text-textFaint">{principle.appliedIn}</span>
                </div>

                <h3 className="font-sans text-lg font-semibold text-text">
                  {principle.title}
                </h3>

                <p className="font-sans text-sm leading-relaxed text-textMuted">
                  {principle.description}
                </p>
              </div>

              <div className="border-t border-border pt-3.5">
                <Link
                  to={`/chat?q=${encodeURIComponent(principle.askPrompt)}`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-text transition-colors duration-150 hover:text-accent"
                >
                  <span>Ask how I implement this</span>
                  <span aria-hidden="true" className="text-accent">
                    →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MASTER TECH STACK (Symmetrical 2x2 Grid) */}
      <section className="border-t border-border pt-14 sm:pt-16 space-y-8">
        <div className="max-w-[64ch] space-y-2">
          <SectionLabel label="TECHNICAL STACK" />
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Languages, frameworks, and infrastructure.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {MASTER_STACK.map((group) => (
            <div
              key={group.category}
              className="rounded-lg border border-border bg-surface p-5 sm:p-6 space-y-4"
            >
              <div className="border-b border-border pb-3">
                <h3 className="font-sans text-base font-semibold text-text">
                  {group.category}
                </h3>
                <p className="mt-0.5 font-mono text-xs text-textFaint">
                  {group.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CLOSING CTA (Mandatory Entry Point #5) */}
      <section className="border-t border-border pt-12">
        <div className="flex flex-col justify-between gap-6 rounded-lg border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-1.5 max-w-[56ch]">
            <p className="font-mono text-xs uppercase tracking-wider text-accent">
              Interactive Portfolio Q&amp;A
            </p>
            <h2 className="font-sans text-xl font-semibold text-text">
              <Link
                to="/chat"
                className="transition-colors duration-150 hover:text-accent"
              >
                Or just ask me. I answer from my own content. →
              </Link>
            </h2>
            <p className="font-sans text-sm text-textMuted">
              Ask the RAG assistant about my work at FlyRank AI, my project
              architectures, or my availability for your team.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Button variant="primary" to="/chat" className="w-full sm:w-auto">
              Ask Portfolio AI →
            </Button>
            <Button variant="ghost" to="/work" className="w-full sm:w-auto">
              Browse Case Studies
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}