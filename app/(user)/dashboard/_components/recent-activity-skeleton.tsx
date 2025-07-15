import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentActivitySkeleton() {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              <Skeleton className="h-4 w-44 mt-1" />
            </CardDescription>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30"
            >
              <Skeleton className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-full max-w-xs" />
                  <Skeleton className="h-3 w-3 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
