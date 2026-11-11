import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Project } from '../types/api';
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

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
  const featuredLiveHost = featuredProject
    ? formatHostname(featuredProject.liveUrl ?? featuredProject.url)
    : null;

  return (
    <div className="mx-auto max-w-300 px-4 sm:px-6">
      {/* 1. Hero + Personal Portrait Dossier */}
      <section className="py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Locked Hero Copy */}
          <div className="lg:col-span-7 space-y-6 max-w-[72ch]">
            <SectionLabel>FULL-STACK &amp; AI ENGINEER</SectionLabel>

            <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-5xl sm:leading-[1.12]">
              I build systems that survive contact with real users.
            </h1>

            <p className="font-sans text-base leading-relaxed text-textMuted sm:text-lg">
              Laravel, React, Postgres, and RAG pipelines. Based in Manila, open
              to full-stack and AI engineering roles.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" to="/chat">
                Ask my portfolio anything →
              </Button>
              <Button variant="ghost" to="/work">
                See my work
              </Button>
            </div>

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

          {/* Right Column: Personal Portrait Frame + Live RAG Dossier */}
          <aside
            aria-label="John Francis Vecina portrait and RAG agent preview"
            className="lg:col-span-5 rounded-lg border border-border bg-surface p-4 sm:p-5 space-y-4"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between font-mono text-xs text-textFaint">
              <span>ENGINEER // J.F. VECINA</span>
              <span className="inline-flex items-center gap-1.5 text-textMuted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                MANILA, PH
              </span>
            </div>

            {/* Dedicated Portrait Frame (Drop your photo at frontend/public/portrait.jpg) */}
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

              {/* Designed Portrait Placeholder (shown until frontend/public/portrait.jpg is added) */}
              {(!portraitLoaded || portraitError) && (
                <div className="absolute inset-0 flex flex-col justify-between p-4 bg-[radial-gradient(circle,#27272A_1px,transparent_1px)] bg-size-[16px_16px]">
                  <div className="flex items-center justify-between font-mono text-xs text-textFaint">
                    <span>[ PORTRAIT FRAME ]</span>
                    <span>4:3</span>
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
                    <span>FULL-STACK &amp; AI</span>
                    <span>jvecina.dev</span>
                  </div>
                </div>
              )}
            </div>

            {/* Static Sample RAG Exchange (§5 preview) */}
            <div className="space-y-2.5 border-t border-border pt-3.5 font-mono text-xs">
              <div className="rounded-lg border border-border bg-surface2 px-3 py-2 text-textMuted">
                <span className="text-textFaint">Q: </span>
                What is Alaala Collections?
              </div>

              <p className="px-1 font-sans text-xs leading-relaxed text-textMuted">
                Production MERN platform for event reservations, Cloudinary
                galleries, and JWT-protected admin operations{' '}
                <span className="font-mono text-accent">[1]</span>.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs text-textFaint">
                <span>1.84s · 2 sources · grounded</span>
                <Link
                  to="/chat?q=What%20is%20Alaala%20Collections%20and%20what%20tech%20stack%20does%20it%20use%3F"
                  className="text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                >
                  [ Try it yourself → ]
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 2. Featured Project (with Screenshot / Visual Preview) */}
      <section className="border-t border-border py-16 sm:py-24 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <SectionLabel index="01" label="FEATURED PRODUCTION SYSTEM" />
          {featuredLiveHost && (
            <span className="font-mono text-xs text-textFaint">
              LIVE // {featuredLiveHost}
            </span>
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
          <article className="rounded-lg border border-accent/30 bg-surface p-6 sm:p-8 transition-colors duration-150 hover:bg-surface2">
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
                      {featuredProject.highlights.slice(0, 2).map((item, idx) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 font-sans text-xs leading-relaxed text-textMuted"
                        >
                          <span className="font-mono text-xs text-accent">
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
                      VIEW CASE STUDY →
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
                    {(featuredProject.liveUrl ?? featuredProject.url) && (
                      <a
                        href={
                          (featuredProject.liveUrl ??
                            featuredProject.url) as string
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
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
      <section className="border-t border-border py-16 sm:py-24 space-y-8">
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

      {/* 4. Selected Work Grid (Visual Cards) */}
      <section className="border-t border-border py-16 sm:py-24 space-y-8">
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

              return (
                <article
                  key={project.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors duration-150 hover:bg-surface2"
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
                        <p className="font-mono text-xs text-textFaint truncate">
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

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <Link
                        to={`/work/${project.slug}`}
                        className="font-mono text-xs font-medium text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                      >
                        VIEW →
                      </Link>
                      {(project.liveUrl ?? project.url) && (
                        <a
                          href={(project.liveUrl ?? project.url) as string}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-textFaint transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                        >
                          LIVE ↗
                        </a>
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