import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Project } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { SectionLabel } from '../components/SectionLabel';
import { Tag } from '../components/Tag';
import { ProjectCardSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { ProjectPreviewImage } from '../components/ProjectPreviewImage';

const MAX_CARD_TAGS = 6;

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

export default function Work() {
  usePageTitle('Work');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24 space-y-12">
      <div className="max-w-[72ch] space-y-3">
        <SectionLabel index="01" label="WORK" />
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Systems &amp; Case Studies
        </h1>
        <p className="font-sans text-base leading-relaxed text-textMuted">
          Production platforms, multi-tenant architectures, and retrieval
          systems. Select a project for its architectural postmortem or query
          the agent directly.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      )}

      {!loading && error && (
        <ErrorState
          label="WORK INDEX FAILED"
          message={error}
          onRetry={() => void fetchProjects()}
        />
      )}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          label="01 / WORK"
          title="No projects indexed yet."
          description="Projects will appear here once seeded."
        />
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project, index) => {
            const { name, subtitle } = splitProjectTitle(project.title);
            const stack =
              project.techStack?.length > 0 ? project.techStack : project.tags;
            const visibleTags = stack.slice(0, MAX_CARD_TAGS);
            const overflowCount = stack.length - visibleTags.length;
            const liveUrl = project.liveUrl ?? project.url;

            const borderClass = project.featured
              ? 'border-accent/30'
              : 'border-border';

            return (
              <article
                key={project.id}
                className={`flex flex-col justify-between rounded-lg border ${borderClass} bg-surface p-6 transition-colors duration-150 hover:bg-surface2`}
              >
                <div className="space-y-5">
                  <Link
                    to={`/work/${project.slug}`}
                    className="block focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                  >
                    <ProjectPreviewImage project={project} />
                  </Link>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 font-mono text-xs text-textFaint">
                      <span>
                        {String(index + 1).padStart(2, '0')} //{' '}
                        {subtitle ? subtitle.toUpperCase() : 'SYSTEM'}
                      </span>
                    </div>

                    <h2 className="font-sans text-xl font-semibold text-text">
                      <Link
                        to={`/work/${project.slug}`}
                        className="transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg"
                      >
                        {name}
                      </Link>
                    </h2>

                    <p className="font-sans text-sm leading-relaxed text-textMuted line-clamp-2">
                      {project.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div className="flex flex-wrap gap-1.5">
                    {visibleTags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                    {overflowCount > 0 && <Tag>+{overflowCount}</Tag>}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 font-mono text-xs">
                    <Link
                      to={`/work/${project.slug}`}
                      className="font-medium text-text transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                    >
                      VIEW →
                    </Link>

                    <div className="flex items-center gap-4 text-textFaint">
                      {liveUrl && (
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors duration-150 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg py-1"
                        >
                          LIVE ↗
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
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
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}