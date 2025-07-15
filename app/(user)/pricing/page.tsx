"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useSubscriptionStatus,
  useUpgradeSubscription,
} from "@/hooks/api/useSubscriptions";
import { PlanType } from "@/lib/api/types";
import {
  pricingPlans,
  NormalPricingCard,
  CurrentPricingCard,
} from "./_components";

/**
 * The Pricing page for the TaskIQ application.
 * Displays subscription plans with features and pricing information.
 */
export default function PricingPage() {
  const router = useRouter();
  const { plan: currentPlan, isActive } = useSubscriptionStatus();
  const { mutate: upgradeSubscription, isPending } = useUpgradeSubscription();
  const [hoveredPlan, setHoveredPlan] = React.useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    if (planId === "FREE") return;

    upgradeSubscription({
      planType: planId as PlanType,
    });
  };

  const handleManagePlan = () => {
    router.push("/billing");
  };

  const isCurrentPlan = (planId: string) => {
    return currentPlan === planId && isActive;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your productivity with TaskIQ. From individuals to
            enterprises, we have the perfect plan for your needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingPlans.map((plan) => {
            const isCurrent = isCurrentPlan(plan.id);

            return isCurrent ? (
              <CurrentPricingCard
                key={plan.id}
                plan={plan}
                hoveredPlan={hoveredPlan}
                isPending={isPending}
                onHover={setHoveredPlan}
                onManagePlan={handleManagePlan}
              />
            ) : (
              <NormalPricingCard
                key={plan.id}
                plan={plan}
                hoveredPlan={hoveredPlan}
                isPending={isPending}
                onHover={setHoveredPlan}
                onPlanSelect={handlePlanSelect}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
