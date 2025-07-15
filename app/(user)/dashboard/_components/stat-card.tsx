import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title?: string;
  value?: string;
  description?: string;
  icon?: LucideIcon;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-muted-foreground">
            {title}
          </CardDescription>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {/* {change && (
            <Badge
              variant={changeType === "positive" ? "default" : "secondary"}
              className={
                changeType === "positive" ? "bg-success/20 text-success" : ""
              }
            >
              {change}
            </Badge>
          )} */}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
