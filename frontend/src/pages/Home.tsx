import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { HealthResponse } from '../types/api';
import { usePageTitle } from '../lib/usePageTitle';
import { formatDate } from '../lib/formatDate';

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
      setError('Unable to reach /api/health. Verify the Laravel backend is running on :8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  return (
    <section className="mx-auto max-w-300 px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-[72ch] space-y-6">
        <p className="font-mono text-xs tracking-wider text-textFaint">
          FULL-STACK &amp; AI ENGINEER
        </p>

        <h1 className="font-sans text-3xl font-semibold tracking-tight text-text sm:text-5xl">
          I build systems that survive contact with real users.
        </h1>

        <p className="font-sans text-base text-textMuted sm:text-lg">
          Laravel, React, Postgres, and RAG pipelines. Based in Manila, open to
          full-stack and AI engineering roles.
        </p>

        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 font-mono text-xs text-textFaint">
            00 / SYSTEM HEALTH CHECK
          </div>

          {loading && (
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-textFaint animate-pulse" />
              <div className="h-4 w-64 rounded-lg bg-surface2 animate-pulse" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-xs text-textMuted">{error}</span>
              <button
                type="button"
                onClick={() => void fetchHealth()}
                className="self-start rounded-lg border border-border bg-surface2 px-3 py-1.5 font-mono text-xs text-text transition-colors duration-150 hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                Retry
              </button>
            </div>
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
              <span className="text-textFaint">{formatDate(health.timestamp)}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}