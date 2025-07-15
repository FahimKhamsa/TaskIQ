import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface UsageOverviewProps {
  credits: {
    used: number;
    total: number;
    percentage: number;
  };
}

export default function UsageOverviewCard({ credits }: UsageOverviewProps) {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <Zap className="h-5 w-5" />
          <span>Credit Usage</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Your current month&apos;s API credit consumption
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Credits Used This Month
            </span>
            <span className="text-sm text-muted-foreground">
              {credits.used} / {credits.total}
            </span>
          </div>
          <Progress value={credits.percentage} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {credits.percentage}% used
            </span>
            <span className="text-muted-foreground">
              {credits.total - credits.used} remaining
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
