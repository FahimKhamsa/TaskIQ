import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Calendar,
  MapPin,
  Heart,
  Shield,
  Zap,
  Settings,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Static data for all available integrations.
const integrations = [
  {
    id: "gmail",
    name: "Gmail",
    description:
      "Send emails, read messages, and manage your inbox through your Telegram bot",
    icon: Mail,
    status: "connected",
    lastSync: "2 minutes ago",
    permissions: ["Read emails", "Send emails", "Manage labels"],
    features: [
      "Send emails via bot commands",
      "Check unread messages",
      "Search email content",
      "Create and manage filters",
    ],
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description:
      "Create events, check your schedule, and manage appointments seamlessly",
    icon: Calendar,
    status: "connected",
    lastSync: "5 minutes ago",
    permissions: ["Read calendar events", "Create events", "Modify events"],
    features: [
      "Create calendar events",
      "Check daily schedule",
      "Set reminders",
      "Find available time slots",
    ],
  },
  {
    id: "maps",
    name: "Google Maps",
    description:
      "Get directions, find places, and explore locations using natural language",
    icon: MapPin,
    status: "connected",
    lastSync: "1 hour ago",
    permissions: ["Access location data", "Search places", "Get directions"],
    features: [
      "Get directions between locations",
      "Find nearby places",
      "Check traffic conditions",
      "Save favorite locations",
    ],
  },
  {
    id: "fitness",
    name: "Google Fit",
    description:
      "Track your fitness goals and health metrics through your personal assistant",
    icon: Heart,
    status: "disconnected",
    lastSync: "Never",
    permissions: [
      "Read activity data",
      "Read health metrics",
      "Write activity data",
    ],
    features: [
      "Track daily steps",
      "Monitor workout sessions",
      "Set fitness goals",
      "View health trends",
    ],
  },
];

/**
 * Renders a status icon based on the integration status string.
 * @param {string} status - The status of the integration ('connected', 'disconnected', etc.).
 * @returns {JSX.Element} A status icon component.
 */
const getStatusIcon = (status: string) => {
  switch (status) {
    case "connected":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "disconnected":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-warning" />;
    default:
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

/**
 * Renders a status badge based on the integration status string.
 * @param {string} status - The status of the integration.
 * @returns {JSX.Element} A badge component reflecting the status.
 */
const getStatusBadge = (status: string) => {
  switch (status) {
    case "connected":
      return (
        <Badge className="bg-success/20 text-success capitalize">
          {status}
        </Badge>
      );
    case "disconnected":
      return (
        <Badge variant="destructive" className="capitalize">
          {status}
        </Badge>
      );
    case "warning":
      return (
        <Badge className="bg-warning/20 text-warning capitalize">
          {status}
        </Badge>
      );
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

/**
 * The Integrations page for the TaskIQ application.
 * This is a Server Component, as it only displays static and derived data without client-side state.
 *
 * @returns {JSX.Element} The integrations page component.
 */
export default function IntegrationsPage() {
  const connectedCount = integrations.filter(
    (i) => i.status === "connected"
  ).length;
  const totalCount = integrations.length;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
          <p className="mt-2 text-muted-foreground">
            Connect and manage your Google services integrations
          </p>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">
                Connected Services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {connectedCount} / {totalCount}
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.round((connectedCount / totalCount) * 100)}% integration
                coverage
              </p>
            </CardContent>
          </Card>
          {/* Additional stats cards can be added here */}
        </div>

        {/* Integration Cards */}
        <div className="space-y-6">
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className="bg-gradient-card border-border shadow-card"
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                      <integration.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center space-x-2 text-foreground">
                        <span>{integration.name}</span>
                        {getStatusIcon(integration.status)}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {getStatusBadge(integration.status)}
                    {integration.status === "connected" ? (
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-gradient-primary">
                        <Zap className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Status Info & Permissions */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">
                        Status Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Last Sync:
                          </span>
                          <span className="text-foreground">
                            {integration.lastSync}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Auto-sync:
                          </span>
                          <Switch
                            checked={integration.status === "connected"}
                            disabled={integration.status !== "connected"}
                            aria-label="Toggle auto-sync"
                          />
                        </div>
                      </div>
                    </div>

                    {integration.status === "connected" && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">
                          Permissions
                        </h4>
                        <div className="space-y-1">
                          {integration.permissions.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <Shield className="h-3 w-3 text-success" />
                              <span className="text-muted-foreground">
                                {permission}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Available Features
                    </h4>
                    <div className="space-y-2">
                      {integration.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <CheckCircle className="h-3 w-3 text-success" />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                {integration.status === "connected" && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Connected and syncing automatically
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="destructive" size="sm">
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
