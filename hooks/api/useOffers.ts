import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type {
  ActiveOffersResponse,
  Offer,
  OfferClaim,
  CreateOfferRequest,
} from "@/lib/api/types";

/**
 * Hook to fetch all offers (admin only)
 */
export const useOffers = () => {
  return useQuery({
    queryKey: ["offers"],
    queryFn: () => apiCall<{ offers: Offer[] }>("/offers"),
    select: (data) => data.offers,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to fetch active offers for users
 */
export const useActiveOffers = () => {
  return useQuery({
    queryKey: ["active-offers"],
    queryFn: () => apiCall<ActiveOffersResponse>("/offers/active"),
    select: (data) => data.offers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to claim an offer
 */
export const useClaimOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (offerId: string) =>
      apiCall<{ claim: OfferClaim; message: string }>("/offers/claim", {
        method: "POST",
        body: JSON.stringify({ offerId }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast({
        title: "Offer claimed successfully",
        description:
          data.message || "Your offer has been applied to your account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error claiming offer",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to create new offer (admin only)
 */
export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (offerData: CreateOfferRequest) =>
      apiCall<{ offer: Offer }>("/offers", {
        method: "POST",
        body: JSON.stringify(offerData),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
      toast({
        title: "Offer created successfully",
        description: `Offer "${data.offer.offerName}" has been created.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating offer",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to update offer (admin only)
 */
export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      offerId,
      offerData,
    }: {
      offerId: string;
      offerData: Partial<CreateOfferRequest>;
    }) =>
      apiCall<{ offer: Offer }>(`/offers/${offerId}`, {
        method: "PUT",
        body: JSON.stringify(offerData),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
      toast({
        title: "Offer updated successfully",
        description: `Offer "${data.offer.offerName}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating offer",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to delete offer (admin only)
 */
export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (offerId: string) =>
      apiCall(`/offers/${offerId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
      toast({
        title: "Offer deleted successfully",
        description: "The offer has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting offer",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Utility hook to check if user has claimed a specific offer
 */
export const useHasClaimedOffer = (offerId: string) => {
  return useQuery({
    queryKey: ["offer-claim", offerId],
    queryFn: () => apiCall<{ claimed: boolean }>(`/offers/${offerId}/claimed`),
    select: (data) => data.claimed,
    enabled: !!offerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Utility hook to format offer expiration
 */
export const useOfferExpiration = (expirationDate: Date | null | string) => {
  if (!expirationDate)
    return { isExpired: false, timeRemaining: "No expiration" };

  const expiry = new Date(expirationDate);
  const now = new Date();
  const isExpired = expiry < now;

  if (isExpired) {
    return { isExpired: true, timeRemaining: "Expired" };
  }

  const diffInMs = expiry.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 1) {
    return { isExpired: false, timeRemaining: "Expires today" };
  } else if (diffInDays < 7) {
    return { isExpired: false, timeRemaining: `${diffInDays} days left` };
  } else {
    return { isExpired: false, timeRemaining: expiry.toLocaleDateString() };
  }
};

/**
 * Utility hook to get offer type display info
 */
export const useOfferTypeInfo = (offerType: string | null) => {
  const typeInfo = {
    PROMO: {
      label: "Promo",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: "🎉",
    },
    DISCOUNT: {
      label: "Discount",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: "💰",
    },
    TRIAL: {
      label: "Trial",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      icon: "⏰",
    },
    CREDIT_BONUS: {
      label: "Credit Bonus",
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      icon: "⚡",
    },
  };

  return (
    typeInfo[offerType as keyof typeof typeInfo] || {
      label: "Unknown",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      icon: "❓",
    }
  );
};

/**
 * Hook to get user's claimed offers
 */
export const useUserClaimedOffers = () => {
  return useQuery({
    queryKey: ["user-claimed-offers"],
    queryFn: () => apiCall<{ claims: OfferClaim[] }>("/offers/claimed"),
    select: (data) => data.claims,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
