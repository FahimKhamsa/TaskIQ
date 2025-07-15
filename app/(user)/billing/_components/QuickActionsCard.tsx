import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, XOctagon } from "lucide-react";

export default function QuickActionsCard() {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full bg-gradient-primary text-white hover:scale-105 transition-all duration-300">
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Upgrade Plan
        </Button>
        <Button
          className="w-full hover:scale-105 transition-all duration-300"
          variant="outline"
        >
          <XOctagon className="mr-2 h-4 w-4" />
          Cancel Plan
        </Button>
      </CardContent>
    </Card>
  );
}
