import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import {
  useSubscriptionPlans,
  useCreateCheckout,
} from "@/hooks/useSubscription";
import type { SubscriptionPlan } from "@/services/subscriptionService";
import { PlanCard } from "./components/PlanCard";
import { PlanCardSkeleton } from "./components/PlanCardSkeleton";
import { SubscriptionHeader } from "./components/SubscriptionHeader";
import { BillingIntervalToggle } from "./components/BillingIntervalToggle";
import { CheckoutErrorAlert } from "./components/CheckoutErrorAlert";
import { getPriceForInterval } from "./components/subscriptionHelpers";

// ── main page ──────────────────────────────────────────────────────────────

export function SubscriptionPage() {
  const { user } = useAuth();
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(
    null,
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data: plans, isLoading, isError, refetch } = useSubscriptionPlans();
  const checkoutMutation = useCreateCheckout();

  const currentStatus = user?.organisation?.subscriptionStatus;

  const handleSubscribe = async (priceId: string) => {
    setCheckoutError(null);
    setCheckoutLoadingId(priceId);
    try {
      const result = await checkoutMutation.mutateAsync(priceId);
      if (result.checkout?.url) {
        window.location.href = result.checkout?.url;
      } else {
        setCheckoutError("Checkout failed. Please try again.");
        setCheckoutLoadingId(null);
      }
    } catch (err) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Checkout failed. Please try again.",
      );
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <SubscriptionHeader currentStatus={currentStatus} />

      <BillingIntervalToggle interval={interval} onChange={setInterval} />

      {/* Checkout error */}
      {checkoutError && (
        <CheckoutErrorAlert
          message={checkoutError}
          onDismiss={() => setCheckoutError(null)}
        />
      )}

      {/* Plans grid */}
      {isLoading ? (
        <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-3 w-8 h-8 text-red-400" />
          <p className="mb-4 font-medium text-secondary text-sm">
            Failed to load subscription plans.
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary/80 text-white rounded-full"
          >
            Try Again
          </Button>
        </Card>
      ) : !plans || plans.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-accent text-sm">
            No plans available at the moment.
          </p>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${
            plans.length === 1
              ? "grid-cols-1 max-w-sm mx-auto"
              : plans.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {plans.map((plan: SubscriptionPlan) => {
            const priceId = getPriceForInterval(plan.prices, interval)?.id;
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={interval}
                isCurrentPlan={false} // TODO: compare with active subscription price ID when available
                isLoading={checkoutLoadingId === priceId}
                onSubscribe={handleSubscribe}
              />
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-accent text-xs">
        Payments are processed securely via Stripe. You can cancel anytime.
      </p>
    </div>
  );
}
