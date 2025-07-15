"use client";

import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Settings,
  Heart,
  Sparkles,
  ThumbsUp,
  Coffee,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingPlan } from "./pricingPlans";

const currentPlanMessages = [
  { icon: Heart, text: "Thanks for choosing us!", color: "text-pink-400" },
  {
    icon: Sparkles,
    text: "You're vibing with the best!",
    color: "text-yellow-400",
  },
  {
    icon: ThumbsUp,
    text: "Enjoying the premium experience?",
    color: "text-green-400",
  },
  { icon: Coffee, text: "Fueling your productivity!", color: "text-amber-400" },
  { icon: Star, text: "You're a star user!", color: "text-purple-400" },
];

interface CurrentPricingCardProps {
  plan: PricingPlan;
  isCurrentPlan?: boolean;
  hoveredPlan?: string | null;
  isPending?: boolean;
  onHover: (planId: string | null) => void;
  onManagePlan: () => void;
}

export function CurrentPricingCard({
  plan,
  hoveredPlan,
  isPending,
  onHover,
  onManagePlan,
}: CurrentPricingCardProps) {
  const Icon = plan.icon;

  const randomMessage = React.useMemo(
    () =>
      currentPlanMessages[
        Math.floor(Math.random() * currentPlanMessages.length)
      ],
    []
  );

  const [isHovered, setIsHovered] = useState(hoveredPlan === plan.id);

  useEffect(() => {
    setIsHovered(hoveredPlan === plan.id);
  }, [hoveredPlan, plan.id]);

  return (
    <>
      {/* Full-screen fireworks overlay */}
      {isHovered && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
        </div>
      )}

      <div className="relative p-1">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-xl shimmer",
            {
              "ring-2 ring-primary/50 shadow-xl scale-[1.03]":
                plan.id === hoveredPlan,
            }
          )}
        />
        <Card
          className={cn(
            "relative flex flex-col items-center h-full bg-background",
            {
              "ring-2 ring-primary/50 shadow-xl scale-[1.03]":
                plan.id === hoveredPlan,
            }
          )}
          onMouseEnter={() => onHover(plan.id)}
          onMouseLeave={() => onHover(null)}
        >
          <Badge className="absolute bg-primary text-secondary-foreground px-3 py-1 -top-3">
            <BadgeCheck className="w-4 h-4 mr-1" />
            Current Plan
          </Badge>

          <CardHeader className="text-center pb-4">
            <div
              className={cn(
                "w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-r",
                plan.gradient
              )}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>

            <CardTitle className="text-2xl font-bold text-foreground">
              {plan.name}
            </CardTitle>

            <div className="flex items-center justify-center gap-x-1 mt-2">
              <randomMessage.icon
                className={cn("w-5 h-5", randomMessage.color)}
              />
              <span className={cn("text-sm font-medium", randomMessage.color)}>
                {randomMessage.text}
              </span>
            </div>

            <div className="mt-4 h-24 flex flex-col items-center justify-center">
              {plan.price === 0 ? (
                <div className="text-5xl font-bold text-foreground mt-4">
                  Free
                </div>
              ) : (
                <>
                  {plan.discount > 0 ? (
                    <div className="flex flex-col items-center mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs line-through text-muted-foreground">
                          ${plan.real_price}
                        </span>
                        <span className="text-3xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{plan.billing}
                        </span>
                      </div>
                      <span className="mt-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {plan.discount * 100}% OFF
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.billing}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <Separator className="mb-6" />
            {/* <div className="space-y-3 mb-6 flex-grow">
            {plan.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div> */}
            <Button
              className="w-full mt-auto"
              onClick={onManagePlan}
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
