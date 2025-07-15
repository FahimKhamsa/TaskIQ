import {
  BillingHeader,
  CurrentPlanCard,
  UsageOverviewCard,
  InvoicesCard,
  QuickActionsCard,
  PaymentMethodsCard,
} from "./_components";

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
  {
    id: "2",
    type: "card",
    last4: "4242",
    brand: "Visa",
    expiry: "12/25",
    isDefault: false,
  },
  {
    id: "3",
    type: "card",
    last4: "4242",
    brand: "Visa",
    expiry: "12/25",
    isDefault: false,
  },
];

export default function BillingPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BillingHeader />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <CurrentPlanCard plan={currentPlan} />
            <UsageOverviewCard credits={currentPlan.credits} />
            <InvoicesCard invoices={invoices} />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <QuickActionsCard />
            <PaymentMethodsCard paymentMethods={paymentMethods} />
          </div>
        </div>
      </div>
    </div>
  );
}
