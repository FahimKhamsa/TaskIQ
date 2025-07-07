import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type {
  SubscriptionPlansResponse,
  Subscription,
  Pricing,
  PlanType,
  UpgradeSubscriptionResponse,
} from "@/lib/api/types";

/**
 * Hook to fetch current user's subscription
 */
export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => apiCall<{ subscription: Subscription }>("/subscriptions"),
    select: (data) => data.subscription,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch available subscription plans
 */
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => apiCall<SubscriptionPlansResponse>("/subscriptions/plans"),
    select: (data) => data.plans,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook to upgrade subscription
 */
export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      planType,
      priceId,
    }: {
      planType: PlanType;
      priceId?: string;
    }) =>
      apiCall<UpgradeSubscriptionResponse>("/subscriptions/upgrade", {
        method: "POST",
        body: JSON.stringify({ planType, priceId }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });

      if (data.redirectUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.redirectUrl;
      } else {
        toast({
          title: "Subscription upgraded successfully",
          description: "Your subscription has been updated.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error upgrading subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () =>
      apiCall("/subscriptions/cancel", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast({
        title: "Subscription cancelled",
        description:
          "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to reactivate cancelled subscription
 */
export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () =>
      apiCall("/subscriptions/reactivate", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({
        title: "Subscription reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error reactivating subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Utility hook to check subscription status
 */
export const useSubscriptionStatus = () => {
  const { data: subscription } = useSubscription();

  if (!subscription) {
    return {
      isActive: false,
      plan: "FREE" as PlanType,
      daysRemaining: 0,
      isExpired: false,
      isCancelled: false,
    };
  }

  const now = new Date();
  const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
  const isExpired = endDate ? endDate < now : false;
  const daysRemaining = endDate
    ? Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  return {
    isActive: subscription.isSubscribed && !isExpired,
    plan: subscription.plan || "FREE",
    daysRemaining,
    isExpired,
    isCancelled: !subscription.isSubscribed,
    endDate: subscription.endDate,
    startDate: subscription.startDate,
  };
};

/**
 * Utility hook to get plan benefits
 */
export const usePlanBenefits = (planType: PlanType) => {
  const benefits = {
    FREE: {
      credits: 10,
      integrations: ["Gmail"],
      support: "Community",
      features: ["Basic bot commands", "Email integration"],
    },
    PRO: {
      credits: 100,
      integrations: ["Gmail", "Calendar", "Drive"],
      support: "Email",
      features: [
        "All basic features",
        "Advanced bot commands",
        "All Google integrations",
        "Priority support",
      ],
    },
    ENTERPRISE: {
      credits: 1000,
      integrations: ["Gmail", "Calendar", "Drive", "Custom"],
      support: "Phone & Email",
      features: [
        "All Pro features",
        "Custom integrations",
        "Dedicated support",
        "Advanced analytics",
        "Team management",
      ],
    },
  };

  return benefits[planType] || benefits.FREE;
};

/**
 * Utility hook to check if user can upgrade to a specific plan
 */
export const useCanUpgradeTo = (targetPlan: PlanType) => {
  const { plan: currentPlan, isActive } = useSubscriptionStatus();

  const planHierarchy = { FREE: 0, PRO: 1, ENTERPRISE: 2 };

  return planHierarchy[targetPlan] > planHierarchy[currentPlan];
};

/**
 * Hook to get subscription billing history
 */
export const useBillingHistory = () => {
  return useQuery({
    queryKey: ["billing-history"],
    queryFn: () => apiCall("/subscriptions/billing-history"),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Utility hook to format subscription price
 */
export const useFormattedPrice = (price: number | null | undefined) => {
  if (!price) return "Free";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};
