import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type {
  CreditsResponse,
  ConsumeCreditsResponse,
  AddCreditsResponse,
  ConsumeCreditsRequest,
  AddCreditsRequest,
} from "@/lib/api/types";

/**
 * Hook to fetch current user's credits
 */
export const useCredits = () => {
  return useQuery({
    queryKey: ["credits"],
    queryFn: () => apiCall<CreditsResponse>("/credits"),
    select: (data) => data.credits,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch specific user's credits (admin only)
 */
export const useUserCredits = (userId: string) => {
  return useQuery({
    queryKey: ["credits", userId],
    queryFn: () => apiCall<CreditsResponse>(`/credits?userId=${userId}`),
    select: (data) => data.credits,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to consume credits
 */
export const useConsumeCredits = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      amount,
      description,
    }: {
      amount: number;
      description?: string;
    }) =>
      apiCall<ConsumeCreditsResponse>("/credits", {
        method: "POST",
        body: JSON.stringify({
          action: "consume",
          amount,
          description,
        } as ConsumeCreditsRequest),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast({
        title: "Credits consumed successfully",
        description: `${data.consumed} credit(s) used. ${data.remaining} remaining.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error consuming credits",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to add credits (admin only or bonus credits)
 */
export const useAddCredits = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ amount }: { amount: number }) =>
      apiCall<AddCreditsResponse>("/credits", {
        method: "POST",
        body: JSON.stringify({ action: "add", amount } as AddCreditsRequest),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast({
        title: "Credits added successfully",
        description: `${data.added} credit(s) added to your daily limit.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding credits",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to reset daily credits (admin only)
 */
export const useResetCredits = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => apiCall("/credits/reset", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast({
        title: "Credits reset successfully",
        description: "Daily credits have been reset for all users.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error resetting credits",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to get credit usage statistics
 */
export const useCreditUsage = () => {
  return useQuery({
    queryKey: ["credit-usage"],
    queryFn: () => apiCall("/credits/usage"),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Utility hook to check if user has sufficient credits
 */
export const useHasCredits = (requiredAmount: number = 1) => {
  const { data: credits } = useCredits();

  if (!credits) return false;

  const remaining = (credits.dailyLimit || 0) - (credits.usedToday || 0);
  return remaining >= requiredAmount;
};

/**
 * Utility hook to get remaining credits count
 */
export const useRemainingCredits = () => {
  const { data: credits } = useCredits();

  if (!credits) return 0;

  return (credits.dailyLimit || 0) - (credits.usedToday || 0);
};
