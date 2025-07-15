import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar } from "lucide-react";

interface CurrentPlanProps {
  plan: {
    name: string;
    price: string;
    billing: string;
    nextBilling: string;
  };
}

export default function CurrentPlanCard({ plan }: CurrentPlanProps) {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Current Plan</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your active subscription details
            </CardDescription>
          </div>
          <Badge className="bg-primary/20 text-primary">Active</Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="space-y-4 mt-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {plan.name} Plan
              </h3>
              <p className="text-muted-foreground">
                {plan.price}/{plan.billing}
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
                {plan.nextBilling}
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
  );
}
