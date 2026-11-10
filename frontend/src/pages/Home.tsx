import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { HealthResponse } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { formatDate } from '../lib/formatDate';
import { Button } from '../components/Button';
import { Tag } from '../components/Tag';
import { SectionLabel } from '../components/SectionLabel';
import { Skeleton, ProjectCardSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';

export default function Home() {
  usePageTitle();

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<HealthResponse>('/health');
      setHealth(response.data);
    } catch {
      setError(
        'Unable to reach /api/health. Verify the Laravel backend is running on :8000.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  return (
    <div className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24 space-y-16">
      {/* Hero + Phase 0 Live Health Check */}
      <section className="max-w-[72ch] space-y-6">
        <SectionLabel>FULL-STACK &amp; AI ENGINEER</SectionLabel>

        <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-5xl">
          I build systems that survive contact with real users.
        </h1>

        <p className="font-sans text-base text-textMuted sm:text-lg">
          Laravel, React, Postgres, and RAG pipelines. Based in Manila, open to
          full-stack and AI engineering roles.
        </p>

        <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
          <SectionLabel index="00" label="SYSTEM HEALTH CHECK" />

          {loading && (
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-textFaint animate-pulse" />
              <Skeleton className="h-4 w-64" />
            </div>
          )}

          {!loading && error && (
            <ErrorState
              label="HEALTH CHECK FAILED"
              message={error}
              onRetry={() => void fetchHealth()}
            />
          )}

          {!loading && !error && health && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-textMuted">
              <span className="inline-flex items-center gap-2 text-text">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {health.ok ? 'API ONLINE' : 'API DEGRADED'}
              </span>
              <span className="text-textFaint">·</span>
              <span>db: {health.db}</span>
              <span className="text-textFaint">·</span>
              <span className="text-textFaint">
                {formatDate(health.timestamp)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Phase 1 Design Primitives Verification Scratchpad */}
      <section className="space-y-8 border-t border-border pt-12">
        <SectionLabel index="01" label="PRIMITIVES VERIFICATION (PHASE 1)" />

        {/* Buttons */}
        <div className="space-y-3">
          <p className="font-mono text-xs text-textMuted">
            Button variants (primary · ghost · icon · disabled · router link)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" to="/chat">
              Ask my portfolio anything →
            </Button>
            <Button variant="ghost" to="/work">
              See my work
            </Button>
            <Button
              variant="icon"
              aria-label="Thumbs up"
              title="Icon button"
            >
              ↑
            </Button>
            <Button variant="primary" disabled>
              Disabled Primary
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <p className="font-mono text-xs text-textMuted">
            Tag chips (standard · AI/RAG highlighted)
          </p>
          <div className="flex flex-wrap gap-2">
            <Tag>REACT</Tag>
            <Tag>TYPESCRIPT</Tag>
            <Tag>POSTGRESQL</Tag>
            <Tag highlight>LARAVEL</Tag>
            <Tag highlight>PGVECTOR</Tag>
            <Tag highlight>RAG PIPELINES</Tag>
          </div>
        </div>

        {/* Skeletons */}
        <div className="space-y-3">
          <p className="font-mono text-xs text-textMuted">
            Skeletons (inline + ProjectCardSkeleton)
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-[72ch]">
            <ProjectCardSkeleton />
          </div>
        </div>

        {/* ErrorState & EmptyState */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ErrorState
            label="REQUEST FAILED"
            message="Something went wrong while generating an answer."
            onRetry={() => void fetchHealth()}
          />
          <EmptyState
            label="03 / ASK"
            title="Answers are drawn only from my projects, writing, and experience."
            description="Every claim links to its source."
            actionLabel="Go to /chat →"
            actionTo="/chat"
          />
        </div>
      </section>
    </div>
  );
}