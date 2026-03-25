import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getSubscriptionPlans,
  createCheckoutSession,
} from "@/services/subscriptionService";

export const subscriptionKeys = {
  all: ["subscription"] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
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
