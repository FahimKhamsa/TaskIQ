import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

interface PaymentMethodsCardProps {
  paymentMethods: PaymentMethod[];
}

export default function PaymentMethodsCard({
  paymentMethods,
}: PaymentMethodsCardProps) {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <CreditCard className="h-5 w-5" />
          <span>Payment Methods</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <p className="text-muted-foreground">
            No payment methods added. Please add a payment method to continue
            using your subscription.
          </p>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
