import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlanCardSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <Skeleton className="w-24 h-5" />
      <Skeleton className="w-32 h-8" />
      <Skeleton className="w-full h-4" />
      <div className="space-y-2 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="w-full h-4" />
        ))}
      </div>
      <Skeleton className="w-full h-10 rounded-full mt-4" />
    </Card>
  );
}
