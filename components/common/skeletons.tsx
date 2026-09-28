import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function StatCardSkeleton() {
  return (
    <Card className="p-5 space-y-3">
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-16" />
    </Card>
  );
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-xl px-3 py-2.5">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-3 w-10 hidden sm:block" />
      <Skeleton className="h-3 w-14 hidden md:block" />
    </div>
  );
}

export function GridCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function ChartSkeleton() {
  return <Skeleton className="h-full w-full rounded-xl" />;
}
