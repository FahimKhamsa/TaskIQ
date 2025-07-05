import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Download,
  Clock,
  Zap,
  TrendingUp,
  Calendar,
  Plus,
  ExternalLink,
} from "lucide-react";

// Static data for the current subscription plan.
const currentPlan = {
  name: "Pro",
  price: "$29",
  billing: "monthly",
  nextBilling: "December 15, 2024",
  credits: {
    used: 750,
    total: 1000,
    percentage: 75,
  },
};

// Static data for monthly usage history.
const usageHistory = [
  { date: "Nov 2024", credits: 850, cost: "$29.00" },
  { date: "Oct 2024", credits: 920, cost: "$29.00" },
  { date: "Sep 2024", credits: 680, cost: "$29.00" },
  { date: "Aug 2024", credits: 1000, cost: "$29.00" },
];

// Static data for recent invoices.
const invoices = [
  { id: "INV-001", date: "Nov 1, 2024", amount: "$29.00", status: "paid" },
  { id: "INV-002", date: "Oct 1, 2024", amount: "$29.00", status: "paid" },
  { id: "INV-003", date: "Sep 1, 2024", amount: "$29.00", status: "paid" },
  { id: "INV-004", date: "Aug 1, 2024", amount: "$29.00", status: "paid" },
];

// Static data for saved payment methods.
const paymentMethods = [
  {
    id: "1",
    type: "card",
    last4: "4242",
    brand: "Visa",
    expiry: "12/25",
    isDefault: true,
  },
];

/**
 * The Billing and Subscription page for the TaskIQ application.
 * This is a Server Component, rendered on the server for optimal performance.
 *
 * @returns {JSX.Element} The billing page component.
 */
export default function BillingPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Billing & Subscription
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your subscription, usage, and payment methods
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Plan */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">
                      Current Plan
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your active subscription details
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/20 text-primary">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {currentPlan.name} Plan
                      </h3>
                      <p className="text-muted-foreground">
                        {currentPlan.price}/{currentPlan.billing}
                      </p>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Next Billing Date
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Calendar className="mr-1.5 h-4 w-4" />
                        {currentPlan.nextBilling}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Billing Cycle
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="mr-1.5 h-4 w-4" />
                        Monthly
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Overview */}
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
                      {currentPlan.credits.used} / {currentPlan.credits.total}
                    </span>
                  </div>
                  <Progress
                    value={currentPlan.credits.percentage}
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {currentPlan.credits.percentage}% used
                    </span>
                    <span className="text-muted-foreground">
                      {currentPlan.credits.total - currentPlan.credits.used}{" "}
                      remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage History */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <TrendingUp className="h-5 w-5" />
                  <span>Usage History</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your credit usage over the past few months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {usageHistory.map((month) => (
                    <div
                      key={month.date}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {month.date}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {month.credits} credits used
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {month.cost}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Buy More Credits
                </Button>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Methods</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between rounded border border-border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            •••• {method.last4}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {method.brand} expires {method.expiry}
                          </p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Invoices */}
        <Card className="mt-8 bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Invoices</CardTitle>
            <CardDescription className="text-muted-foreground">
              Download your past invoices and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      Invoice {invoice.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {invoice.amount}
                      </p>
                      <Badge
                        className={`capitalize ${
                          invoice.status === "paid"
                            ? "bg-success/20 text-success"
                            : ""
                        }`}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download invoice</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
