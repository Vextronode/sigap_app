import { cn } from "../../utils/cn";

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className }: SkeletonProps) => <div className={cn("skeleton", className)} />;

export const CardSkeleton = () => (
  <div className="card skeleton-card" aria-label="Memuat data">
    <Skeleton className="skeleton--title" />
    <Skeleton className="skeleton--line" />
    <Skeleton className="skeleton--line skeleton--short" />
  </div>
);
