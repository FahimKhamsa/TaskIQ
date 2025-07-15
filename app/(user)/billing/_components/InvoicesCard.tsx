import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
}

interface InvoicesCardProps {
  invoices: Invoice[];
}

export default function InvoicesCard({ invoices }: InvoicesCardProps) {
  return (
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
                <p className="text-sm text-muted-foreground">{invoice.date}</p>
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
  );
}
