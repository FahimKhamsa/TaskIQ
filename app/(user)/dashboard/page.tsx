"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CreditCard,
  Users,
  Bot,
  Zap,
  Calendar,
  Mail,
  MapPin,
  Heart,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";

// Static data for the statistics cards.
const stats = [
  {
    title: "Commands Used",
    value: "2,847",
    description: "This month",
    icon: Activity,
    change: "+12%",
    changeType: "positive" as const,
  },
  {
    title: "Credits Remaining",
    value: "1,250",
    description: "Out of 2,000",
    icon: CreditCard,
    change: "62.5%",
    changeType: "neutral" as const,
  },
  {
    title: "Active Integrations",
    value: "4",
    description: "All connected",
    icon: Users,
    change: "100%",
    changeType: "positive" as const,
  },
  {
    title: "Bot Uptime",
    value: "99.9%",
    description: "Last 30 days",
    icon: Bot,
    change: "+0.1%",
    changeType: "positive" as const,
  },
];

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
  {
    name: "Fitness",
    icon: Heart,
    status: "connected",
    lastUsed: "3 hours ago",
  },
];

// Static data for the recent activity feed.
const recentActivity = [
  { action: "Sent email via Gmail", time: "2 minutes ago", type: "email" },
  {
    action: "Created calendar event",
    time: "1 hour ago",
    type: "calendar",
  },
  {
    action: "Searched location on Maps",
    time: "3 hours ago",
    type: "maps",
  },
  { action: "Checked fitness data", time: "5 hours ago", type: "fitness" },
];

/**
 * The Dashboard page for the TaskIQ application.
 * This is a Client Component because it uses state (useState) and browser APIs (navigator.clipboard).
 *
 * @returns {JSX.Element} The dashboard page component.
 */
export default function DashboardPage() {
  const [showSecret, setShowSecret] = useState(false);
  const secretKey = "tk_live_sk_1234567890abcdef";

  /**
   * Copies the secret key to the user's clipboard.
   */
  const copySecret = () => {
    navigator.clipboard.writeText(secretKey);
    // A toast notification could be added here to confirm the copy action.
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your TaskIQ
            account.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="bg-gradient-card border-border shadow-card"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-muted-foreground">
                    {stat.title}
                  </CardDescription>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <Badge
                    variant={
                      stat.changeType === "positive" ? "default" : "secondary"
                    }
                    className={
                      stat.changeType === "positive"
                        ? "bg-success/20 text-success"
                        : ""
                    }
                  >
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Secret Key Card */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Bot className="h-5 w-5" />
                  <span>Telegram Bot Configuration</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Use this secret key to authenticate your Telegram bot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Secret Key
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono text-foreground">
                        {showSecret ? secretKey : "•".repeat(secretKey.length)}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showSecret ? "Hide secret key" : "Show secret key"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copySecret}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy secret key</span>
                      </Button>
                    </div>
                  </div>
                  <div className="rounded bg-info/10 p-3">
                    <p className="text-sm text-info">
                      Keep this key secure! Use it in your Telegram bot to
                      authenticate API requests.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">
                Common tasks you can do right now
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Zap className="mr-2 h-4 w-4" />
                Test Bot Connection
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Buy More Credits
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Add Integration
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Connected Services */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Connected Services
              </CardTitle>
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

          {/* Recent Activity */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your latest bot interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.action}
                    className="flex items-start space-x-3"
                  >
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
