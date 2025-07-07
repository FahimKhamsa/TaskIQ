import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const plans = await prisma.pricing.findMany({
      orderBy: { price: "asc" },
    });

    // Add plan features based on plan type
    const plansWithFeatures = plans.map((plan: any) => ({
      ...plan,
      features: getPlanFeatures(plan.planType),
    }));

    return NextResponse.json({ plans: plansWithFeatures });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getPlanFeatures(planType: string | null) {
  switch (planType) {
    case "FREE":
      return {
        dailyCredits: 10,
        integrations: ["Gmail"],
        support: "Community",
        features: [
          "10 daily credits",
          "Basic Gmail integration",
          "Community support",
          "Basic analytics",
        ],
      };
    case "PRO":
      return {
        dailyCredits: 100,
        integrations: ["Gmail", "Calendar", "Drive"],
        support: "Email",
        features: [
          "100 daily credits",
          "All Google integrations",
          "Email support",
          "Advanced analytics",
          "Priority processing",
          "Custom workflows",
        ],
      };
    case "ENTERPRISE":
      return {
        dailyCredits: "Unlimited",
        integrations: ["All available"],
        support: "Priority",
        features: [
          "Unlimited credits",
          "All integrations",
          "Priority support",
          "Advanced analytics",
          "Custom integrations",
          "Dedicated account manager",
          "SLA guarantee",
          "White-label options",
        ],
      };
    default:
      return {
        dailyCredits: 0,
        integrations: [],
        support: "None",
        features: [],
      };
  }
}
