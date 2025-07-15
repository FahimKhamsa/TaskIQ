import React from "react";
import { Zap, Crown, Smile, Rocket } from "lucide-react";
import { PlanType } from "@/lib/api/types";

export interface PricingPlan {
  id: PlanType;
  name: string;
  description: string;
  real_price: number;
  discount: number;
  price: number;
  billing: "forever" | "month" | "6 months" | "12 months";
  icon: React.ComponentType<{ className?: string }>;
  popular: boolean;
  features: string[];
  limitations: string[];
  buttonText: string;
  gradient: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "FREE",
    name: "FREE",
    description: "Perfect for getting started",
    real_price: 0,
    discount: 0,
    price: 0,
    billing: "forever",
    icon: Smile,
    popular: false,
    features: [
      "10 API credits per month",
      "Gmail integration",
      "Basic bot commands",
      "Community support",
      "Email notifications",
    ],
    limitations: [
      "Limited to 10 credits/month",
      "Basic integrations only",
      "Community support only",
    ],
    buttonText: "Get Started",
    gradient: "from-gray-500 to-gray-600",
  },
  {
    id: "MONTHLY",
    name: "MONTHLY",
    description: "Best for professionals and small teams",
    real_price: 9.99,
    discount: 0,
    price: 9.99,
    billing: "month",
    icon: Zap,
    popular: true,
    features: [
      "1,000 API credits per month",
      "All Google integrations",
      "Advanced bot commands",
      "Priority email support",
      "Custom workflows",
      "Analytics dashboard",
      "Team collaboration",
    ],
    limitations: [],
    buttonText: "Upgrade",
    gradient: "from-primary to-primary/80",
  },
  {
    id: "BI_YEARLY",
    name: "BI YEARLY",
    description: "Ideal for growing businesses",
    real_price: 59.99,
    discount: 0.1,
    price: 53.99,
    billing: "6 months",
    icon: Rocket,
    popular: false,
    features: [
      "5,000 API credits per month",
      "All Pro features",
      "Advanced analytics",
      "Custom integrations",
      "Phone & email support",
      "Team management",
      "SSO authentication",
      "API access",
    ],
    limitations: [],
    buttonText: "Upgrade",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "YEARLY",
    name: "YEARLY",
    description: "For large organizations with custom needs",
    real_price: 119.99,
    discount: 0.2,
    price: 95.99,
    billing: "12 months",
    icon: Crown,
    popular: false,
    features: [
      "Unlimited API credits",
      "All Business features",
      "Dedicated support manager",
      "Custom development",
      "On-premise deployment",
      "Advanced security",
      "SLA guarantee",
      "Training & onboarding",
    ],
    limitations: [],
    buttonText: "Upgrade",
    gradient: "from-purple-500 to-purple-600",
  },
];
