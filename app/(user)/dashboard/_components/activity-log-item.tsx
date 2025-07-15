import { Badge } from "@/components/ui/badge";
import { Info, CheckCircle, AlertTriangle, XCircle, Crown } from "lucide-react";

interface ActivityLogItemProps {
  log: {
    id: string;
    type: string;
    content: string;
    createdAt: string;
    isPremium: boolean;
  };
  index: number;
  isExpanded: boolean;
}

export function ActivityLogItem({
  log,
  index,
  isExpanded,
}: ActivityLogItemProps) {
  // Helper function to get log type icon and color
  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return { icon: CheckCircle, color: "text-green-500" };
      case "WARNING":
        return { icon: AlertTriangle, color: "text-yellow-500" };
      case "ERROR":
        return { icon: XCircle, color: "text-red-500" };
      default:
        return { icon: Info, color: "text-blue-500" };
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const logDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - logDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const { icon: LogIcon, color } = getLogTypeIcon(log.type);

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 ease-out ${
        isExpanded
          ? "animate-in slide-in-from-bottom-2 fade-in"
          : "animate-in slide-in-from-left-2 fade-in"
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "both",
      }}
    >
      <LogIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground break-words">
            {log.content || `${log.type} action performed`}
          </p>
          {log.isPremium && (
            <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant="secondary"
            className={`text-xs ${
              log.type === "SUCCESS"
                ? "bg-green-100 text-green-700"
                : log.type === "WARNING"
                ? "bg-yellow-100 text-yellow-700"
                : log.type === "ERROR"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {log.type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(log.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
