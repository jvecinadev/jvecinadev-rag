export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-surface2 ${className}`.trim()}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col justify-between rounded-lg border border-border bg-surface p-6 space-y-6"
    >
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}