"use client";

import React from "react";
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
import { Check, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingPlan } from "./pricingPlans";

interface PricingPlanProps {
  plan: PricingPlan;
  isCurrentPlan?: boolean;
  hoveredPlan?: string | null;
  isPending?: boolean;
  onHover: (planId: string | null) => void;
  onPlanSelect: (plan: any) => void;
}

export function NormalPricingCard({
  plan,
  hoveredPlan,
  isPending,
  onHover,
  onPlanSelect,
}: PricingPlanProps) {
  const Icon = plan.icon;

  return (
    <Card
      className={cn(
        "relative flex flex-col items-center h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.03] bg-background",
        {
          "ring-2 ring-primary/50 shadow-xl scale-[1.03]":
            plan.id === hoveredPlan,
        }
      )}
      onMouseEnter={() => onHover(plan.id)}
      onMouseLeave={() => onHover(null)}
    >
      {plan.popular && (
        <Badge className="absolute bg-primary text-secondary-foreground px-3 py-1 -top-3">
          <Star className="w-4 h-4 mr-1" />
          Most Popular
        </Badge>
      )}

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
        <CardDescription className="text-muted-foreground min-h-[40px]">
          {plan.description}
        </CardDescription>

        <div className="mt-4 h-24 flex flex-col items-center justify-center">
          {/* {plan.price === 0 ? (
            <div className="text-3xl font-bold text-foreground mt-4">$0.00</div>
          ) : ( */}
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
                <span className="text-3xl font-bold text-foreground">
                  ${plan.price ? plan.price : "0.00"}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{plan.price ? plan.billing : "forever"}
                </span>
              </div>
            )}
          </>
          {/* )} */}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow">
        <Separator className="mb-6" />
        {/* <div className="space-y-3 mb-6 flex-grow">
          {plan.features.map((feature: string, index: number) => (
            <div
              key={index}
              className="flex items-start space-x-3 transition-all duration-300"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div> */}

        <Button
          className={cn(
            "w-full mt-auto transition-all duration-300 group hover:scale-105",
            {
              "bg-gradient-to-r from-primary to-blue-500 text-white":
                plan.id === hoveredPlan,
            }
          )}
          onClick={() => onPlanSelect(plan)}
          disabled={isPending}
          variant={plan.id === hoveredPlan ? "default" : "outline"}
        >
          {plan.buttonText}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
