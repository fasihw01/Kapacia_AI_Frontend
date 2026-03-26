import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/config/apiConfig";

export interface StripePrice {
  id: string;
  interval: "month" | "year";
  amount: number; // in cents
  currency: string;
}

export interface SubscriptionPlan {
  id: string; // Stripe product ID
  name: string;
  description: string;
  prices: StripePrice[];
  features?: string[];
  metadata?: Record<string, string>; // e.g. { popular: "true" }
}

export interface CheckoutResponse {
  checkout?: {
    url: string;
  };
}

interface SubscriptionPlanApiItem {
  priceId: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
  intervalCount?: number;
  productId: string;
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface SubscriptionPlansApiResponse {
  plans?: SubscriptionPlanApiItem[];
}

const getAuthHeader = () => ({
  "x-access-token": localStorage.getItem("auth_token") ?? "",
  "Content-Type": "application/json",
});

const extractError = (error: unknown, fallback: string): never => {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<any>).response?.data;
    const msg =
      data?.error?.message ||
      data?.message ||
      data?.userMessage ||
      (typeof data?.error === "string" ? data.error : null) ||
      fallback;
    throw new Error(msg);
  }
  throw new Error(error instanceof Error ? error.message : fallback);
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stripe/plans`, {
      headers: getAuthHeader(),
    });
    const payload = response.data as
      | SubscriptionPlansApiResponse
      | SubscriptionPlanApiItem[]
      | undefined;
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.plans)
        ? payload.plans
        : [];

    const groupedPlans = new Map<string, SubscriptionPlan>();

    for (const item of items) {
      const existingPlan = groupedPlans.get(item.productId);
      const price: StripePrice = {
        id: item.priceId,
        amount: item.amount,
        currency: item.currency,
        interval: item.interval,
      };

      if (existingPlan) {
        existingPlan.prices.push(price);
      } else {
        groupedPlans.set(item.productId, {
          id: item.productId,
          name: item.name,
          description: item.description ?? "",
          prices: [price],
          metadata: item.metadata ?? {},
        });
      }
    }

    return Array.from(groupedPlans.values());
  } catch (error) {
    extractError(error, "Failed to load subscription plans.");
  }
  throw new Error("Failed to load subscription plans.");
};

export interface OrgSubscription {
  subscriptionId?: string;
  status: string;
  planName?: string;
  amount?: number;
  currency?: string;
  interval?: string;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number; // unix timestamp
  description?: string;
}

export const getOrgSubscription = async (): Promise<OrgSubscription> => {
  const response = await axios.get(`${API_BASE_URL}/stripe/subscription`, {
    headers: getAuthHeader(),
  });
  const data = response.data;
  return data.subscription ?? data;
};

export const getPaymentHistory = async (): Promise<PaymentHistoryItem[]> => {
  const response = await axios.get(`${API_BASE_URL}/stripe/payment-history`, {
    headers: getAuthHeader(),
  });
  const data = response.data;
  return data.payments ?? data.data ?? data ?? [];
};

export const createCheckoutSession = async (
  priceId: string,
): Promise<CheckoutResponse> => {
  const successUrl = `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${window.location.origin}/admin/subscription`;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/stripe/create-checkout-session`,
      { priceId, successUrl, cancelUrl },
      { headers: getAuthHeader() },
    );
    return response.data;
  } catch (error) {
    extractError(error, "Failed to start checkout. Please try again.");
  }
  throw new Error("Failed to start checkout. Please try again.");
};
