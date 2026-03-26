import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getSubscriptionPlans,
  createCheckoutSession,
  getOrgSubscription,
  getPaymentHistory,
} from "@/services/subscriptionService";
import { useAuth } from "@/contexts/useAuth";

export const subscriptionKeys = {
  all: ["subscription"] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
  orgStatus: () => [...subscriptionKeys.all, "orgStatus"] as const,
  paymentHistory: () => [...subscriptionKeys.all, "paymentHistory"] as const,
};

export const useSubscriptionPlans = () =>
  useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: getSubscriptionPlans,
    staleTime: 5 * 60 * 1000, // 5 min — plans don't change often
  });

export const useCreateCheckout = () =>
  useMutation({
    mutationFn: (priceId: string) => createCheckoutSession(priceId),
  });

/**
 * Fetches live subscription status from the backend.
 * Only runs when the logged-in user has the "organisation" role.
 */
export const useOrgSubscription = () => {
  const { user } = useAuth();
  const isOrg = user?.role === "organisation";

  return useQuery({
    queryKey: subscriptionKeys.orgStatus(),
    queryFn: getOrgSubscription,
    enabled: isOrg,
    staleTime: 60 * 1000,
    retry: false,
  });
};

export const usePaymentHistory = () => {
  const { user } = useAuth();
  const isOrg = user?.role === "organisation";

  return useQuery({
    queryKey: subscriptionKeys.paymentHistory(),
    queryFn: getPaymentHistory,
    enabled: isOrg,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
};
