import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, MapPin } from "lucide-react";

// Static data for the integrations list.
const integrations = [
  { name: "Gmail", icon: Mail, status: "connected", lastUsed: "2 hours ago" },
  {
    name: "Calendar",
    icon: Calendar,
    status: "connected",
    lastUsed: "5 minutes ago",
  },
  { name: "Maps", icon: MapPin, status: "connected", lastUsed: "1 day ago" },
];

export function ConnectedServices() {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Connected Services</CardTitle>
        <CardDescription className="text-muted-foreground">
          Your active Google integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <integration.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {integration.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last used {integration.lastUsed}
                  </p>
                </div>
              </div>
              <Badge className="bg-success/20 text-success capitalize">
                {integration.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
